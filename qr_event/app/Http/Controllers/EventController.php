<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
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
        ]);

        if ($request->hasFile('banner_image')) {
            $validated['banner_image'] = $request->file('banner_image')->store('events', 'public');
        }
        $validated['is_finished'] = $validated['is_finished'] ?? false;

        Event::create($validated);

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
        ]);

        if ($request->hasFile('banner_image')) {
            // Delete old image if exists
            if ($event->banner_image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($event->banner_image);
            }
            $validated['banner_image'] = $request->file('banner_image')->store('events', 'public');
        }
        $validated['is_finished'] = $validated['is_finished'] ?? false;

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
}
