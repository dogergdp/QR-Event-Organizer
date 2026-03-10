<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Event;
use App\Models\QrCode;
use App\Models\User;
use App\Services\LiveDashboardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    /**
     * Show admin events list page.
     */
    public function index(): Response
    {
        $events = Event::query()
            ->orderBy('date')
            ->orderBy('start_time')
            ->get([
                'id',
                'name',
                'date',
                'start_time',
                'end_time',
                'description',
                'location',
                'banner_image',
                'is_finished',
                'is_ongoing',
            ]);

        return Inertia::render('events/index', [
            'events' => $events,
            'isAdmin' => true,
        ]);
    }

    /**
     * Show event details page.
     */
    public function show(Request $request, Event $event): Response
    {
        $user = $request->user();
        $userAttendance = $user
            ? $event->attendees()->with('user:id,last_name')->where('user_id', $user->id)->first()
            : null;

        $attendedUsers = $event->attendees()
            ->with('user:id,first_name,last_name')
            ->where('is_attended', true)
            ->latest('attended_time')
            ->get()
            ->map(fn($attendee) => [
                'id' => $attendee->id,
                'name' => trim(($attendee->user->first_name ?? '') . ' ' . ($attendee->user->last_name ?? '')),
                'family_name' => $attendee->user->last_name ?? null,
                'family_color' => data_get($attendee->assigned_values, 'family_color'),
                'attended_time' => optional($attendee->attended_time)?->toDateTimeString(),
            ])
            ->values();

        return Inertia::render('events/show', [
            'event' => $event,
            'isAdmin' => $user?->isAdmin() ?? false,
            'userAttendance' => $userAttendance ? [
                'id' => $userAttendance->id,
                'user_id' => $userAttendance->user_id,
                'event_id' => $userAttendance->event_id,
                'is_attended' => (bool) $userAttendance->is_attended,
                'is_paid' => (bool) $userAttendance->is_paid,
                'amount_paid' => $userAttendance->amount_paid,
                'attended_time' => optional($userAttendance->attended_time)?->toDateTimeString(),
                'family_name' => $userAttendance->user?->last_name,
                'family_color' => data_get($userAttendance->assigned_values, 'family_color'),
                'assigned_values' => $userAttendance->assigned_values ?? [],
                'attending_plus_ones' => collect($userAttendance->plus_ones ?? [])
                    ->filter(fn($member) => (bool) data_get($member, 'is_attended', false))
                    ->map(fn($member) => [
                        'id' => (string) data_get($member, 'id', ''),
                        'full_name' => (string) data_get($member, 'full_name', ''),
                    ])
                    ->values(),
            ] : null,
            'attendedUsers' => $attendedUsers,
        ]);
    }

    public function showAttendees(Request $request, Event $event): Response
    {
        $status = $request->query('status', 'rsvp');
        $isFirstTime = $request->query('first_time');
        $isWalkIn = $request->query('walk_in');
        $isPaid = $request->query('paid');
        $search = trim((string) $request->query('search', ''));

        $attendees = $event->attendees()
            ->with('user')
            ->when($search !== '', function ($query) use ($search) {
                $query->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery
                        ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('contact_number', 'like', "%{$search}%");
                });
            })
            ->when($status === 'rsvp', fn($q) => $q->where('is_attended', false))
            ->when($status === 'attendance', fn($q) => $q->where('is_attended', true))
            ->when($isFirstTime === 'yes', fn($q) => $q->where('is_first_time', true))
            ->when($isFirstTime === 'no', fn($q) => $q->where('is_first_time', false))
            ->when($isWalkIn === 'yes', fn($q) => $q->where('is_walk_in', true))
            ->when($isWalkIn === 'no', fn($q) => $q->where('is_walk_in', false))
            ->when($isPaid === 'yes', fn($q) => $q->where('is_paid', true))
            ->when($isPaid === 'no', fn($q) => $q->where('is_paid', false))
            ->latest('updated_at')
            ->paginate(10)
            ->through(fn($attendee) => [
                'id' => $attendee->id,
                'user_id' => $attendee->user_id,
                'is_attended' => $attendee->is_attended,
                'is_first_time' => (bool) $attendee->is_first_time,
                'is_paid' => (bool) $attendee->is_paid,
                'is_walk_in' => (bool) ($attendee->is_walk_in ?? false),
                'amount_paid' => $attendee->amount_paid,
                'payment_type' => $attendee->payment_type,
                'payment_remarks' => $attendee->payment_remarks,
                'plus_ones' => $attendee->plus_ones ?? [],
                'assigned_values' => $attendee->assigned_values ?? [],
                'attended_time' => $attendee->attended_time,
                'user' => [
                    'id' => $attendee->user->id,
                    'first_name' => $attendee->user->first_name,
                    'last_name' => $attendee->user->last_name,
                    'contact_number' => $attendee->user->contact_number,
                    'birthdate' => $attendee->user->birthdate,
                    'is_first_time' => (bool) $attendee->user->is_first_time,
                    'remarks' => $attendee->user->remarks,
                    'want_to_join_dg' => $attendee->user->want_to_join_dg,
                ],
            ])
            ->withQueryString();

        return Inertia::render('events/attendees-admin', [
            'event' => $event,
            'attendees' => $attendees,
            'users' => User::query()
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get(['id', 'first_name', 'last_name', 'contact_number']),
            'filters' => [
                'status' => $status,
                'first_time' => $isFirstTime ?? 'all',
                'walk_in' => $isWalkIn ?? 'all',
                'paid' => $isPaid ?? 'all',
                'search' => $search,
            ],
        ]);
    }

    public function updateLoginMethod(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'login_requires_birthdate' => ['required', 'boolean'],
        ]);

        $event->update([
            'login_requires_birthdate' => (bool) $validated['login_requires_birthdate'],
        ]);

        ActivityLog::query()->create([
            'user_id' => $request->user()?->id,
            'action' => 'update_event_login_method',
            'target_type' => 'Event',
            'target_id' => $event->id,
            'description' => sprintf(
                'Updated login method for event %s to %s',
                $event->name,
                $event->login_requires_birthdate ? 'contact + birthdate' : 'number only'
            ),
        ]);

        return back()->with('success', 'Event login method updated.');
    }

    /**
     * Show QR display page (fullscreen for monitors).
     */
    public function qrDisplay(Event $event): Response
    {
        return Inertia::render('qr-display', [
            'event' => $event,
        ]);
    }

    /**
     * Show the admin create event page.
     */
    public function create(): Response
    {
        return Inertia::render('events/create');
    }

    /**
     * Store a newly created event.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[^0-9]*$/'],
            'date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'description' => ['nullable', 'string'],
            'location' => ['required', 'string', 'max:255'],
            'banner_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'is_finished' => ['sometimes', 'boolean'],
            'is_ongoing' => ['sometimes', 'boolean'],
        ]);

        // Validate that event cannot be both finished and ongoing
        if (($validated['is_finished'] ?? false) && ($validated['is_ongoing'] ?? false)) {
            return redirect()->back()->withErrors([
                'status' => 'An event cannot be both finished and ongoing at the same time.',
            ])->withInput();
        }

        $validated['name'] = Str::ucfirst(trim($validated['name']));
        $validated['description'] = isset($validated['description'])
            ? trim($validated['description'])
            : '';

        if ($request->hasFile('banner_image')) {
            $validated['banner_image'] = $request->file('banner_image')->store('events', 'public');
        }
        $validated['is_finished'] = $validated['is_finished'] ?? false;
        $validated['is_ongoing'] = $validated['is_ongoing'] ?? false;

        $event = Event::query()->create($validated);

        ActivityLog::query()->create([
            'user_id' => $request->user()?->id,
            'action' => 'create_event',
            'target_type' => 'Event',
            'target_id' => $event->id,
            'description' => sprintf('Created event: %s', $event->name),
        ]);

        // Auto-generate QR codes for pre-registration and attendance
        $preRegExpiresAt = \Carbon\Carbon::parse($validated['date'] . ' ' . $validated['start_time']);
        $attendanceExpiresAt = \Carbon\Carbon::parse($validated['date'] . ' ' . $validated['end_time']);

        // Pre-registration QR Code
        $preRegToken = Str::random(32);
        QrCode::query()->create([
            'event_id' => $event->id,
            'name' => 'Pre-Registration',
            'purpose' => 'pre-registration',
            'token' => $preRegToken,
            'code' => '/qr/' . $preRegToken,
            'is_active' => true,
            'expires_at' => $preRegExpiresAt,
        ]);

        // Attendance Check-in QR Code
        $attendanceToken = Str::random(32);
        QrCode::query()->create([
            'event_id' => $event->id,
            'name' => 'Attendance Check-in',
            'purpose' => 'attendance',
            'token' => $attendanceToken,
            'code' => '/qr/' . $attendanceToken,
            'is_active' => true,
            'expires_at' => $attendanceExpiresAt,
        ]);

        LiveDashboardService::notify('event_created', $event->id);

        return redirect()->route('dashboard');
    }

    /**
     * Show the admin edit event page.
     */
    public function edit(Event $event): Response
    {
        return Inertia::render('events/edit', [
            'event' => $event,
        ]);
    }

    /**
     * Update an existing event.
     */
    public function update(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[^0-9]*$/'],
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'description' => ['nullable', 'string'],
            'location' => ['required', 'string', 'max:255'],
            'banner_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'is_finished' => ['sometimes', 'boolean'],
            'is_ongoing' => ['sometimes', 'boolean'],
        ]);

        // Validate that event cannot be both finished and ongoing
        if (($validated['is_finished'] ?? false) && ($validated['is_ongoing'] ?? false)) {
            return redirect()->back()->withErrors([
                'status' => 'An event cannot be both finished and ongoing at the same time.',
            ])->withInput();
        }

        $validated['name'] = Str::ucfirst(trim($validated['name']));
        $validated['description'] = isset($validated['description'])
            ? trim($validated['description'])
            : '';

        if ($request->hasFile('banner_image')) {
            // Delete old image if exists
            if ($event->banner_image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($event->banner_image);
            }
            $validated['banner_image'] = $request->file('banner_image')->store('events', 'public');
        }
        $validated['is_finished'] = $validated['is_finished'] ?? false;
        $validated['is_ongoing'] = $validated['is_ongoing'] ?? false;

        $event->update($validated);

        ActivityLog::query()->create([
            'user_id' => $request->user()?->id,
            'action' => 'update_event',
            'target_type' => 'Event',
            'target_id' => $event->id,
            'description' => sprintf('Updated event: %s', $event->name),
        ]);

        LiveDashboardService::notify('event_updated', $event->id);

        return redirect()->route('dashboard');
    }

    /**
     * Delete an event.
     */
    public function destroy(Event $event): RedirectResponse
    {
        ActivityLog::query()->create([
            'user_id' => request()->user()?->id,
            'action' => 'delete_event',
            'target_type' => 'Event',
            'target_id' => $event->id,
            'description' => sprintf('Deleted event: %s', $event->name),
        ]);

        LiveDashboardService::notify('event_deleted', $event->id);

        $event->delete();

        return redirect()->route('dashboard');
    }

    /**
     * Show RSVP confirmation page
     */
    public function showRsvp(Event $event): Response
    {
        return Inertia::render('events/pre-register', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'date' => $event->date,
                'start_time' => $event->start_time,
                'end_time' => $event->end_time,
                'location' => $event->location,
                'description' => $event->description,
            ],
            'fromQr' => false,
            // Do NOT create attendee record here; only show confirmation page
        ]);
    }

    /**
     * Confirm RSVP for an event
     */
    public function confirmRsvp(Request $request, Event $event): RedirectResponse
    {
        $user = request()->user();

        if (!$user) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'confirm_rsvp' => ['required', 'boolean'],
            'is_first_time' => ['nullable', 'boolean'],
            'has_plus_ones' => ['nullable', 'boolean'],
            'plus_ones' => ['nullable', 'array'],
            'plus_ones.*.full_name' => ['required_with:plus_ones', 'string', 'max:255'],
            'plus_ones.*.age' => ['required_with:plus_ones', 'integer', 'min:0', 'max:120'],
            'plus_ones.*.gender' => ['required_with:plus_ones', 'in:male,female,other,prefer_not_to_say'],
            'plus_ones.*.is_first_time' => ['required_with:plus_ones', 'boolean'],
            'plus_ones.*.remarks' => ['nullable', 'string', 'max:255'],
            'data_privacy_consent' => ['accepted'],
        ]);

        if ($request->boolean('has_plus_ones') && empty($validated['plus_ones'])) {
            return back()->withErrors([
                'plus_ones' => 'Please add at least one family member / plus one.',
            ])->withInput();
        }

        $plusOnes = collect($validated['plus_ones'] ?? [])->map(function (array $member) {
            return [
                'id' => (string) Str::uuid(),
                'full_name' => trim($member['full_name']),
                'age' => (int) $member['age'],
                'gender' => $member['gender'],
                'is_first_time' => (bool) $member['is_first_time'],
                'remarks' => trim((string) ($member['remarks'] ?? '')),
                'is_attended' => false,
            ];
        })->values()->all();

        $attendeePayload = [
            'is_first_time' => $request->boolean('is_first_time'),
        ];

        $walkInSessionKey = sprintf('walk_in_event_%d_user_%d', $event->id, $user->id);
        $isWalkIn = (bool) $request->session()->pull($walkInSessionKey, false);

        if (Schema::hasColumn('attendees', 'is_walk_in')) {
            $attendeePayload['is_walk_in'] = $isWalkIn;
        }

        if (Schema::hasColumn('attendees', 'plus_ones')) {
            $attendeePayload['plus_ones'] = $plusOnes;
        }

        if (Schema::hasColumn('attendees', 'data_privacy_consent')) {
            $attendeePayload['data_privacy_consent'] = true;
        }

        // Get or create attendee record
        $attendee = $event->attendees()
            ->updateOrCreate([
                'user_id' => $user->id,
                'event_id' => $event->id,
            ], $attendeePayload);

        ActivityLog::query()->create([
            'user_id' => $user->id,
            'action' => 'user_rsvp',
            'target_type' => 'Event',
            'target_id' => $event->id,
            'description' => sprintf(
                'User %s %s RSVP\'d to event: %s',
                $user->first_name,
                $user->last_name,
                $event->name
            ),
        ]);

        LiveDashboardService::notify('event_rsvp', $event->id);

        // Mark as attended (RSVP confirmed - could add a separate field if needed)
        // For now we're marking as a registration confirmation

        $qrToken = $request->input('qr_token');

        if ($qrToken) {
            return redirect()->route('qr.view', ['token' => $qrToken]);
        }

        return redirect()->route('events.show', $event->id);
    }
}
