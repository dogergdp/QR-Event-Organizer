<?php

namespace App\Http\Controllers;

use App\Actions\Fortify\CreateNewUser;
use App\Models\Attendee;
use App\Models\Event;
use App\Models\QrCode;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user from QR code
     */
    public function registerFromQR(Request $request, CreateNewUser $creator): RedirectResponse
    {
        // Let CreateNewUser handle all validation including password confirmation
        $input = $request->all();

        // Basic QR token validation
        $request->validate([
            'qr_token' => 'required|string|exists:qr_codes,token',
        ]);

        // Let the CreateNewUser action handle validation of user data and password
        $user = $creator->create($input);

        // Get the QR code and event
        $qrCode = QrCode::where('token', $input['qr_token'])->first();
        $event = $qrCode->event;

        // Create attendee record for pre-registration
        Attendee::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'is_attended' => false,
        ]);

        // Log in the user
        Auth::login($user);

        // Fire registered event
        event(new Registered($user));

        // Redirect to the confirmation page
        return redirect()->route('qr.register-confirm', ['event' => $event->id]);
    }

    /**
     * Show pre-registration confirmation page
     */
    public function showConfirmation(Event $event): Response
    {
        $user = request()->user();

        if (!$user) {
            return redirect()->route('login');
        }

        return Inertia::render('attendance/pre-register-confirm', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'location' => $event->location,
                'date' => $event->date,
                'start_time' => $event->start_time,
            ],
        ]);
    }
}

