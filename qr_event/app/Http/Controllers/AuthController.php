<?php

namespace App\Http\Controllers;

use App\Concerns\ProfileValidationRules;
use App\Actions\Fortify\CreateNewUser;
use App\Models\ActivityLog;
use App\Models\Attendee;
use App\Models\Event;
use App\Models\QrCode;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use ProfileValidationRules;
    /**
     * Register a new user from QR code
     */
    public function registerFromQR(Request $request, CreateNewUser $creator): RedirectResponse
    {
        // Basic QR token validation
        $request->validate([
            'qr_token' => 'required|string|exists:qr_codes,token',
        ]);

        // Validate basic profile info and uniqueness of contact number
        $request->validate([
            ...$this->profileRules(),
            'contact_number' => array_merge($this->contactNumberRules(), [Rule::unique('users', 'contact_number')]),
        ]);

        // Let CreateNewUser handle all validation including password confirmation
        $input = $request->all();

        // Let the CreateNewUser action handle validation of user data and password
        $user = $creator->create($input);

        // Get the QR code and event
        $qrCode = QrCode::where('token', $input['qr_token'])->first();
        $event = $qrCode->event;

        // Do NOT create attendee record or activity log here; RSVP confirmation should be explicit

        // Log in the user
        Auth::login($user);

        // Fire registered event
        event(new Registered($user));

        $isAttendanceQr = $qrCode->purpose === 'attendance';

        // Redirect to the confirmation page
        return redirect()->route('qr.register-confirm', [
            'event' => $event->id,
            'qr_token' => $isAttendanceQr ? $qrCode->token : null,
        ]);
    }

    /**
     * Show pre-registration confirmation page
     */
    public function showConfirmation(Request $request, Event $event): Response|RedirectResponse
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
            'qrToken' => $request->query('qr_token'),
            'hasAnsweredFirstTime' => (bool) $request->query('hasAnsweredFirstTime', false),
        ]);
    }
}

