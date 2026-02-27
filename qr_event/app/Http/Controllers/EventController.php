<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Event;
use App\Models\QrCode;
use App\Services\LiveDashboardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        $status = $request->query('status', 'rsvp');
        $isFirstTime = $request->query('first_time');

        $attendees = $event->attendees()
            ->with('user')
            ->when($status === 'rsvp', fn($q) => $q->where('is_attended', false))
            ->when($status === 'attendance', fn($q) => $q->where('is_attended', true))
            ->when($isFirstTime === 'yes', fn($q) => $q->where('is_first_time', true))
            ->when($isFirstTime === 'no', fn($q) => $q->where('is_first_time', false))
            ->latest('updated_at')
            ->paginate(10)
            ->through(fn($attendee) => [
                'id' => $attendee->id,
                'user_id' => $attendee->user_id,
                'is_attended' => $attendee->is_attended,
                'is_first_time' => (bool) $attendee->is_first_time,
                'attended_time' => $attendee->attended_time,
                'user' => [
                    'first_name' => $attendee->user->first_name,
                    'last_name' => $attendee->user->last_name,
                    'contact_number' => $attendee->user->contact_number,
                    'is_first_time' => (bool) $attendee->user->is_first_time,
                    'remarks' => $attendee->user->remarks,
                ],
            ])
            ->withQueryString();

        return Inertia::render('events/show', [
            'event' => $event,
            'isAdmin' => $user?->isAdmin() ?? false,
            'userAttendance' => $user ? $event->attendees()->where('user_id', $user->id)->first() : null,
            'attendees' => $attendees,
            'filters' => [
                'status' => $status,
                'first_time' => $isFirstTime ?? 'all',
            ],
        ]);
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

        $event = Event::create($validated);

        ActivityLog::create([
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
        QrCode::create([
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
        QrCode::create([
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
            // Delete old image if exists
            if ($event->banner_image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($event->banner_image);
            }
            $validated['banner_image'] = $request->file('banner_image')->store('events', 'public');
        }
        $validated['is_finished'] = $validated['is_finished'] ?? false;
        $validated['is_ongoing'] = $validated['is_ongoing'] ?? false;

        $event->update($validated);

        ActivityLog::create([
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
        ActivityLog::create([
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
        ]);

        // Get or create attendee record
        $attendee = $event->attendees()
            ->updateOrCreate([
                'user_id' => $user->id,
                'event_id' => $event->id,
            ], [
                'is_first_time' => $request->boolean('is_first_time'),
            ]);

        ActivityLog::create([
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
