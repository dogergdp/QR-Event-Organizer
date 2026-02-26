<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Event;
use App\Models\QrCode;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QrCodeController extends Controller
{
    /**
     * Show all QR codes across all events (admin only)
     */
    public function listAll(Request $request): Response
    {
        $showFinished = $request->query('show_finished', '0') === '1';

        $qrCodes = QrCode::with('event')
            ->when(!$showFinished, function ($query) {
                $query->whereHas('event', function ($eventQuery) {
                    $eventQuery->where('is_finished', false);
                });
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($qr) => [
                'id' => $qr->id,
                'name' => $qr->name,
                'purpose' => $qr->purpose,
                'is_active' => $qr->is_active,
                'expires_at' => $qr->expires_at?->format('Y-m-d H:i'),
                'token' => $qr->token,
                'created_at' => $qr->created_at->format('Y-m-d H:i'),
                'is_valid' => $qr->isValid(),
                'event' => [
                    'id' => $qr->event->id,
                    'name' => $qr->event->name,
                    'is_finished' => $qr->event->is_finished,
                ],
            ]);

        $events = Event::orderBy('name')->get(['id', 'name']);

        return Inertia::render('qr/index', [
            'qrCodes' => $qrCodes,
            'events' => $events,
            'showFinished' => $showFinished,
        ]);
    }

    /**
     * Show QR code management page for an event
     */
    public function index(Event $event): Response
    {
        $qrCodes = $event->qrCodes()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($qr) => [
                'id' => $qr->id,
                'name' => $qr->name,
                'purpose' => $qr->purpose,
                'is_active' => $qr->is_active,
                'expires_at' => $qr->expires_at?->format('Y-m-d H:i'),
                'token' => $qr->token,
                'created_at' => $qr->created_at->format('Y-m-d H:i'),
                'is_valid' => $qr->isValid(),
                'qr_url' => $qr->getQrUrl(),
            ]);

        return Inertia::render('qr/manage', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
            ],
            'qrCodes' => $qrCodes,
        ]);
    }

    /**
     * Toggle QR code active status
     */
    public function toggle(Request $request, QrCode $qrCode): RedirectResponse
    {
        $qrCode->loadMissing('event');
        $qrCode->update(['is_active' => !$qrCode->is_active]);

        $action = $qrCode->is_active ? 'activate_qr' : 'deactivate_qr';
        $eventName = $qrCode->event?->name ?? 'Unknown event';
        $qrName = $qrCode->name ?? 'QR Code';

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => $action,
            'target_type' => 'QrCode',
            'target_id' => $qrCode->id,
            'description' => sprintf('%s %s for event: %s', $qrCode->is_active ? 'Activated' : 'Deactivated', $qrName, $eventName),
        ]);

        return redirect()->back()->with('success', 'QR code status updated.');
    }

    /**
     * Delete a QR code
     */
    public function destroy(QrCode $qrCode): RedirectResponse
    {
        $qrCode->delete();

        return redirect()->back()->with('success', 'QR code deleted successfully.');
    }

    /**
     * View/display QR code (user scans and lands here)
     */
    public function view(string $token, Request $request): Response|RedirectResponse
    {
        $qrCode = QrCode::where('token', $token)->firstOrFail();

        // If viewing the QR code for download/display purposes
        if ($request->query('view') === '1') {
            return $this->showQRViewer($qrCode);
        }

        if (!$qrCode->isValid()) {
            return Inertia::render('qr/display', [
                'qrCode' => [
                    'id' => $qrCode->id,
                    'name' => $qrCode->name,
                    'type' => $qrCode->expires_at ? 'timed' : 'static',
                    'is_active' => $qrCode->is_active,
                    'expires_at' => $qrCode->expires_at?->toIso8601String(),
                    'valid' => false,
                    'event' => [
                        'id' => $qrCode->event->id,
                        'name' => $qrCode->event->name,
                        'description' => $qrCode->event->description,
                        'date' => $qrCode->event->date,
                        'location' => $qrCode->event->location,
                    ],
                ],
                'token' => $token,
            ]);
        }

        // Route to appropriate handler based on purpose
        if ($qrCode->purpose === 'pre-registration') {
            return $this->handlePreRegistration($qrCode, $token);
        } else {
            return $this->handleAttendance($qrCode, $token);
        }
    }

    /**
     * Admin view QR code (for download/display purposes)
     */
    public function adminView(QrCode $qrCode): Response
    {
        return Inertia::render('qr/viewer', [
            'qrCode' => [
                'id' => $qrCode->id,
                'name' => $qrCode->name,
                'token' => $qrCode->token,
                'code' => $qrCode->code,
                'event' => [
                    'id' => $qrCode->event->id,
                    'name' => $qrCode->event->name,
                    'banner_image' => $qrCode->event->banner_image,
                ],
            ],
        ]);
    }

    /**
     * Handle pre-registration QR code scanning
     */
    private function handlePreRegistration(QrCode $qrCode, string $token): Response|RedirectResponse
    {
        $user = auth()->user();
        $event = $qrCode->event;

        // If logged in, check if already RSVP'd
        if ($user) {
            $alreadyRsvpd = $event->attendees()
                ->where('user_id', $user->id)
                ->exists();

            if ($alreadyRsvpd) {
                // Already RSVP'd - show confirmation message
                return Inertia::render('events/pre-register', [
                    'event' => $event,
                    'fromQr' => true,
                    'alreadyRsvpd' => true,
                ]);
            }

            // Not yet RSVP'd - show RSVP form
            return Inertia::render('events/pre-register', [
                'event' => $event,
                'fromQr' => true,
                'alreadyRsvpd' => false,
            ]);
        }

        // Not logged in - show registration form (prompts to login first)
        return Inertia::render('auth/register-from-qr', [
            'event' => $event,
            'qrToken' => $token,
        ]);
    }

    /**
     * Handle attendance QR code scanning
     */
    private function handleAttendance(QrCode $qrCode, string $token): Response|RedirectResponse
    {
        $user = auth()->user();
        $event = $qrCode->event;

        // If logged in, check RSVP status
        if ($user) {
            $attendee = $event->attendees()
                ->where('user_id', $user->id)
                ->first();

            if ($attendee) {
                // If already attended, show success message
                if ($attendee->is_attended) {
                    return Inertia::render('attendance/already-attended', [
                        'event' => $event,
                        'attendee' => $attendee,
                    ]);
                }

                // RSVP'd but not yet attended - go to mark attendance
                return Inertia::render('attendance/mark', [
                    'event' => $event,
                    'qrCode' => $qrCode,
                    'isFirstTime' => $attendee->is_first_time,
                    'hasAnsweredFirstTime' => true,
                ]);
            }

            // Logged in but not RSVP'd - redirect to RSVP confirmation, then back to QR for attendance
            return redirect()->route('qr.register-confirm', [
                'event' => $event->id,
                'qr_token' => $token,
                'hasAnsweredFirstTime' => false,
            ]);
        }

        // Not logged in - show registration form (same as pre-registration)
        return Inertia::render('auth/register-from-qr', [
            'event' => $event,
            'qrToken' => $token,
            'isAttendanceQr' => true, // Flag to indicate this is from attendance QR
        ]);
    }

    /**
     * Look up an attendee by contact number for a specific event
     */
    public function lookupAttendee(Request $request): JsonResponse
    {
        $request->validate([
            'contact_number' => 'required|string',
            'event_id' => 'required|integer|exists:events,id',
        ]);

        $contact = $request->input('contact_number');
        $eventId = $request->input('event_id');

        // Find user with this contact number
        $user = User::where('contact_number', $contact)->first();

        if (!$user) {
            return response()->json(['found' => false]);
        }

        // Check if this user is already an attendee for this event
        $attendee = $user->attendances()
            ->where('event_id', $eventId)
            ->first();

        if ($attendee) {
            // Already registered for this event
            return response()->json([
                'found' => true,
                'type' => 'already-registered',
                'attendee' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'user_id' => $user->id,
                ],
            ]);
        }

        // User exists in system but not registered for this event yet
        return response()->json([
            'found' => true,
            'type' => 'existing-user',
            'attendee' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'user_id' => $user->id,
            ],
        ]);
    }
}
