<?php

namespace App\Http\Controllers;

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
    public function listAll(): Response
    {
        $qrCodes = QrCode::with('event')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($qr) => [
                'id' => $qr->id,
                'name' => $qr->name,
                'type' => $qr->type,
                'purpose' => $qr->purpose,
                'is_dynamic' => $qr->is_dynamic,
                'is_active' => $qr->is_active,
                'expires_at' => $qr->expires_at?->format('Y-m-d H:i'),
                'token' => $qr->token,
                'created_at' => $qr->created_at->format('Y-m-d H:i'),
                'is_valid' => $qr->isValid(),
                'event' => [
                    'id' => $qr->event->id,
                    'name' => $qr->event->name,
                ],
            ]);

        $events = Event::orderBy('name')->get(['id', 'name']);

        return Inertia::render('qr/index', [
            'qrCodes' => $qrCodes,
            'events' => $events,
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
                'type' => $qr->type,
                'purpose' => $qr->purpose,
                'is_dynamic' => $qr->is_dynamic,
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
     * Store a new QR code
     */
    public function store(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:static,timed'],
            'purpose' => ['required', 'in:pre-registration,attendance'],
            'is_dynamic' => ['boolean'],
            'expires_at' => ['nullable', 'date_format:Y-m-d\TH:i', 'after:now'],
        ]);

        $token = bin2hex(random_bytes(16));
        
        QrCode::create([
            'event_id' => $event->id,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'purpose' => $validated['purpose'],
            'is_dynamic' => $validated['is_dynamic'] ?? false,
            'token' => $token,
            'code' => route('qr.view', ['token' => $token]),
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        return redirect()->route('events.qr.index', $event)->with('success', 'QR code created successfully.');
    }

    /**
     * Toggle QR code active status
     */
    public function toggle(QrCode $qrCode): RedirectResponse
    {
        $qrCode->update(['is_active' => !$qrCode->is_active]);

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
            abort(403, 'This QR code is no longer valid.');
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
    private function handlePreRegistration(QrCode $qrCode, string $token): Response
    {
        $user = auth()->user();
        $event = $qrCode->event;

        // If logged in, go directly to event with RSVP prompt
        if ($user) {
            return Inertia::render('events/pre-register', [
                'event' => $event,
                'fromQr' => true,
            ]);
        }

        // Not logged in - show registration form
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
                // Already RSVP'd - go straight to mark attendance
                return Inertia::render('attendance/mark', [
                    'event' => $event,
                    'qrCode' => $qrCode,
                ]);
            }

            // Logged in but not RSVP'd - redirect to RSVP confirmation
            return redirect()->route('qr.register-confirm', $event->id);
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
