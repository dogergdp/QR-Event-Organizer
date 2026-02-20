<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\QrCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QrCodeController extends Controller
{
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
            'expires_at' => ['nullable', 'date_format:Y-m-d\TH:i', 'after:now'],
        ]);

        $token = bin2hex(random_bytes(16));
        
        QrCode::create([
            'event_id' => $event->id,
            'name' => $validated['name'],
            'type' => $validated['type'],
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
    public function view(string $token): Response
    {
        $qrCode = QrCode::where('token', $token)->firstOrFail();

        if (!$qrCode->isValid()) {
            abort(403, 'This QR code is no longer valid.');
        }

        return Inertia::render('qr/display', [
            'event' => [
                'id' => $qrCode->event->id,
                'name' => $qrCode->event->name,
                'description' => $qrCode->event->description,
                'date' => $qrCode->event->date,
                'location' => $qrCode->event->location,
            ],
            'qrCode' => [
                'id' => $qrCode->id,
                'name' => $qrCode->name,
                'type' => $qrCode->type,
                'is_active' => $qrCode->is_active,
                'expires_at' => $qrCode->expires_at?->format('Y-m-d H:i'),
                'valid' => $qrCode->isValid(),
            ],
            'token' => $token,
        ]);
    }
}
