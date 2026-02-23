<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\QrCode;
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
    public function show(Event $event): Response
    {
        $user = request()->user();
        
        return Inertia::render('events/show', [
            'event' => $event,
            'isAdmin' => $user?->isAdmin() ?? false,
            'userAttendance' => $user ? $event->attendees()->where('user_id', $user->id)->first() : null,
            'attendees' => $event->attendees()
                ->with('user')
                ->get()
                ->map(fn($attendee) => [
                    'id' => $attendee->id,
                    'user_id' => $attendee->user_id,
                    'is_attended' => $attendee->is_attended,
                    'attended_time' => $attendee->attended_time,
                    'user' => [
                        'first_name' => $attendee->user->first_name,
                        'last_name' => $attendee->user->last_name,
                        'contact_number' => $attendee->user->contact_number,
                        'is_first_time' => $attendee->user->is_first_time,
                    ],
                ]),
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
            'name' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'description' => ['required', 'string'],
            'location' => ['required', 'string', 'max:255'],
            'banner_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'is_finished' => ['sometimes', 'boolean'],
            'is_ongoing' => ['sometimes', 'boolean'],
        ]);

        if ($request->hasFile('banner_image')) {
            $validated['banner_image'] = $request->file('banner_image')->store('events', 'public');
        }
        $validated['is_finished'] = $validated['is_finished'] ?? false;
        $validated['is_ongoing'] = $validated['is_ongoing'] ?? false;

        $event = Event::create($validated);

        // Auto-generate QR codes for pre-registration and attendance
        $expiresAt = \Carbon\Carbon::parse($validated['date'] . ' ' . $validated['end_time']);
        
        // Pre-registration QR Code
        $preRegToken = Str::random(32);
        QrCode::create([
            'event_id' => $event->id,
            'name' => 'Pre-Registration',
            'purpose' => 'pre-registration',
            'token' => $preRegToken,
            'code' => '/qr/' . $preRegToken,
            'is_active' => true,
            'expires_at' => $expiresAt,
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
            'expires_at' => $expiresAt,
        ]);

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
            'name' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'description' => ['required', 'string'],
            'location' => ['required', 'string', 'max:255'],
            'banner_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'is_finished' => ['sometimes', 'boolean'],
            'is_ongoing' => ['sometimes', 'boolean'],
        ]);

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

        return redirect()->route('dashboard');
    }

    /**
     * Delete an event.
     */
    public function destroy(Event $event): RedirectResponse
    {
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
        ]);
    }

    /**
     * Confirm RSVP for an event
     */
    public function confirmRsvp(Event $event): RedirectResponse
    {
        $user = request()->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Get or create attendee record
        $attendee = $event->attendees()
            ->where('user_id', $user->id)
            ->firstOrCreate([
                'user_id' => $user->id,
                'event_id' => $event->id,
            ]);

        // Mark as attended (RSVP confirmed - could add a separate field if needed)
        // For now we're marking as a registration confirmation

        return redirect()->route('events.show', $event->id);
    }
}
