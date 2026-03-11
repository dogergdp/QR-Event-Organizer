<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Attendee;
use App\Models\Event;
use App\Services\LiveDashboardService;
use App\Services\QRCodeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * Display the check-in/confirmation page
     */
    public function scan(Request $request): Response|RedirectResponse
    {
        $token = $request->get('token');

        // Validate token and get event ID
        $eventId = QRCodeService::validateToken($token);

        if (! $eventId) {
            return redirect()->route('dashboard')
                ->with('error', 'Invalid or expired QR code. Please try again.');
        }

        $event = Event::query()->findOrFail($eventId);
        $user = request()->user();

        // Check if user is already registered for this event
        $attendance = Attendee::query()->where('user_id', $user->id)
            ->where('event_id', $event->id)
            ->first();

        return Inertia::render('attendance/checkin', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'date' => $event->date,
                'start_time' => $event->start_time,
                'end_time' => $event->end_time,
                'location' => $event->location,
                'description' => $event->description,
                'banner_image' => $event->banner_image,
            ],
            'token' => $token,
            'isAlreadyRegistered' => $attendance !== null,
            'isAlreadyAttended' => $attendance?->is_attended ?? false,
            'isFirstTime' => $attendance?->is_first_time ?? false,
            'hasAnsweredFirstTime' => $attendance !== null,
        ]);
    }

    /**
     * Confirm attendance via POST
     */
    public function confirm(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'confirm_attendance' => ['required', 'boolean'],
            'is_first_time' => ['nullable', 'boolean'],
            'data_privacy_consent' => ['accepted'],
        ]);

        // Validate token
        $eventId = QRCodeService::validateToken($validated['token']);

        if (! $eventId || $eventId !== $validated['event_id']) {
            return back()->with('error', 'Invalid QR code. Please try again.');
        }

        if (! $validated['confirm_attendance']) {
            return back()->with('error', 'You must confirm your attendance.');
        }

        $user = request()->user();
        $event = Event::query()->findOrFail($validated['event_id']);

        $confirmPayload = [
            'is_attended' => true,
            'is_first_time' => $request->boolean('is_first_time'),
            'attended_time' => now(),
        ];

        if (Schema::hasColumn('attendees', 'data_privacy_consent')) {
            $confirmPayload['data_privacy_consent'] = true;
        }

        // Create or update attendance record
        Attendee::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'event_id' => $event->id,
            ],
            $confirmPayload
        );

        ActivityLog::query()->create([
            'user_id' => $user->id,
            'action' => 'user_attendance',
            'target_type' => 'Event',
            'target_id' => $event->id,
            'description' => sprintf(
                'User %s %s confirmed attendance for event: %s',
                $user->first_name,
                $user->last_name,
                $event->name
            ),
        ]);

        LiveDashboardService::notify('attendance_confirmed', $event->id);

        return redirect()->route('events.show', $event->id)
            ->with('success', 'Attendance confirmed! Thank you for attending.');
    }

    /**
     * Mark attendance for an event
     */
    public function markAttendance(Request $request, Event $event): RedirectResponse
    {
        $user = request()->user();

        $validated = $request->validate([
            'is_first_time' => ['nullable', 'boolean'],
            'confirm_attendance' => ['required', 'boolean'],
            'attending_member_ids' => ['nullable', 'array'],
            'attending_member_ids.*' => ['string'],
            'data_privacy_consent' => ['accepted'],
        ]);

        if (! $request->boolean('confirm_attendance')) {
            return back()->withErrors([
                'confirm_attendance' => 'Please confirm your attendance and that of the selected attendees to continue.',
            ]);
        }

        $selectedMemberIds = collect($validated['attending_member_ids'] ?? []);

        if (! $selectedMemberIds->contains('primary')) {
            return back()->withErrors([
                'attending_member_ids' => 'Primary attendee must be present to proceed.',
            ]);
        }

        $attendee = Attendee::query()->firstOrNew([
            'user_id' => $user->id,
            'event_id' => $event->id,
        ]);

        if (! $attendee->exists || ! $attendee->is_paid) {
            return back()->with('error', 'Payment is required before check-in. Please proceed to the payment area.');
        }

        $updatedPlusOnes = collect($attendee->plus_ones ?? [])->map(function (array $member) use ($selectedMemberIds) {
            $member['is_attended'] = $selectedMemberIds->contains($member['id'] ?? '');

            return $member;
        })->values()->all();

        $attendancePayload = [
            'is_attended' => true,
            'is_first_time' => $request->boolean('is_first_time'),
            'attended_time' => now(),
        ];

        if (Schema::hasColumn('attendees', 'plus_ones')) {
            $attendancePayload['plus_ones'] = $updatedPlusOnes;
        }

        if (Schema::hasColumn('attendees', 'data_privacy_consent')) {
            $attendancePayload['data_privacy_consent'] = true;
        }

        // Create or update attendance record
        Attendee::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'event_id' => $event->id,
            ],
            $attendancePayload
        );

        ActivityLog::query()->create([
            'user_id' => $user->id,
            'action' => 'user_attendance',
            'target_type' => 'Event',
            'target_id' => $event->id,
            'description' => sprintf(
                'User %s %s marked attendance for event: %s',
                $user->first_name,
                $user->last_name,
                $event->name
            ),
        ]);

        LiveDashboardService::notify('attendance_marked', $event->id);

        return redirect()->route('events.show', $event->id)
            ->with('success', 'Attendance confirmed! Thank you for attending.');
    }

    /**
     * Get QR code URL for an event (admin only)
     */
    public function getQRUrl(Event $event): array
    {
        // Only admins can get QR codes
        if (! auth()->user() || ! auth()->user()->isAdmin()) {
            abort(403);
        }

        return [
            'url' => QRCodeService::generateQRUrl($event->getKey()),
            'eventId' => $event->getKey(),
        ];
    }
}
