<?php

use App\Http\Controllers\AttendanceController;
use App\Models\Event;
use App\Services\QRCodeService;
use Illuminate\Support\Facades\Route;

Route::get('/events/{event}/qr-code', function (Event $event) {
    $user = request()->user();
    
    if (!$user || !$user->isAdmin()) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    return response()->json([
        'url' => QRCodeService::generateQRUrl($event->id),
        'eventId' => $event->id,
    ]);
})->middleware(['web', 'auth']);
