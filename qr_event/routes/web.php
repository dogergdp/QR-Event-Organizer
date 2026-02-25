<?php

use App\Http\Controllers\Admin\AttendeeController as AdminAttendeeController;
use App\Http\Controllers\Admin\LogController as AdminLogController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\QrCodeController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Extract dashboard logic to a controller
Route::get('dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth'])
    ->name('dashboard');

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('users', [AdminUserController::class, 'index'])->name('users');
    Route::get('users/create', [AdminUserController::class, 'create'])->name('users.create');
    Route::post('users', [AdminUserController::class, 'store'])->name('users.store');
    Route::get('users/{user}/edit', [AdminUserController::class, 'edit'])->name('users.edit');
    Route::put('users/{user}', [AdminUserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

    Route::get('attendees', [AdminAttendeeController::class, 'index'])->name('attendees');
    Route::post('attendees', [AdminAttendeeController::class, 'store'])->name('attendees.store');
    Route::delete('attendees/{attendee}', [AdminAttendeeController::class, 'destroy'])->name('attendees.destroy');

    Route::get('qr-codes', [QrCodeController::class, 'listAll'])->name('qr-codes');
    Route::get('qr/{qrCode}/view', [QrCodeController::class, 'adminView'])->name('qr.view');

    Route::get('reports', [ReportController::class, 'index'])->name('reports');
    
    // Extract logs logic to a controller
    Route::get('logs', [AdminLogController::class, 'index'])->name('logs');
    
    Route::get('reports/export/events', [ReportController::class, 'exportEvents'])->name('reports.export.events');
    Route::get('reports/export/attendees', [ReportController::class, 'exportAttendees'])->name('reports.export.attendees');
    Route::get('reports/export/attendance-details', [ReportController::class, 'exportAttendanceDetails'])->name('reports.export.attendance-details');
    Route::get('reports/export/logs', [ReportController::class, 'exportLogs'])->name('reports.export.logs');
    Route::get('reports/export/event/{event}/attendees', [ReportController::class, 'exportEventAttendees'])->name('reports.export.event.attendees');
});

Route::middleware(['auth', 'admin'])->prefix('events')->name('events.')->group(function () {
    Route::get('/', [EventController::class, 'index'])->name('index');
    Route::get('create', [EventController::class, 'create'])->name('create');
    Route::post('/', [EventController::class, 'store'])->name('store');
    Route::get('{event}/edit', [EventController::class, 'edit'])->name('edit');
    Route::get('{event}/qr-display', [EventController::class, 'qrDisplay'])->name('qr-display');
    Route::put('{event}', [EventController::class, 'update'])->name('update');
    Route::delete('{event}', [EventController::class, 'destroy'])->name('destroy');
    Route::get('{event}/qr', [QrCodeController::class, 'index'])->name('qr.index');
    Route::put('qr/{qrCode}/toggle', [QrCodeController::class, 'toggle'])->name('qr.toggle');
});

Route::get('qr/{token}', [QrCodeController::class, 'view'])->name('qr.view');
Route::post('qr-register', [AuthController::class, 'registerFromQR'])->name('qr.register');
Route::get('qr-register-confirm/{event}', [AuthController::class, 'showConfirmation'])
    ->middleware('auth')
    ->name('qr.register-confirm');

Route::middleware(['auth'])->prefix('attendance')->name('attendance.')->group(function () {
    Route::get('scan', [AttendanceController::class, 'scan'])->name('scan');
    Route::post('confirm', [AttendanceController::class, 'confirm'])->name('confirm');
});

Route::middleware(['auth'])->prefix('events')->name('events.')->group(function () {
    Route::get('{event}/rsvp', [EventController::class, 'showRsvp'])->name('rsvp');
    Route::post('{event}/confirm-rsvp', [EventController::class, 'confirmRsvp'])->name('confirm-rsvp');
    Route::post('{event}/mark-attendance', [AttendanceController::class, 'markAttendance'])->name('mark-attendance');
    Route::get('{event}', [EventController::class, 'show'])->name('show');
});

require __DIR__.'/settings.php';