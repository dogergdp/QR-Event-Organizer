<?php

use App\Http\Controllers\Admin\AttendeeController as AdminAttendeeController;
use App\Http\Controllers\Admin\ImportController as AdminImportController;
use App\Http\Controllers\Admin\LogController as AdminLogController;
use App\Http\Controllers\Admin\MinistryController as AdminMinistryController;
use App\Http\Controllers\Admin\SettingController as AdminSettingController;
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

Route::middleware('guest')->group(function () {
    Route::get('admin/login', fn () => Inertia::render('auth/admin-login'))->name('admin.login');
});

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
    Route::post('users/import', [AdminImportController::class, 'importUsers'])->name('users.import');

    Route::get('attendees', [AdminAttendeeController::class, 'index'])->name('attendees');
    Route::post('attendees', [AdminAttendeeController::class, 'store'])->name('attendees.store');
    Route::delete('attendees/{attendee}', [AdminAttendeeController::class, 'destroy'])->name('attendees.destroy');
    Route::patch('attendees/{attendee}/payment', [AdminAttendeeController::class, 'updatePaymentStatus'])->name('attendees.payment');
    Route::patch('attendees/{attendee}/plus-ones', [AdminAttendeeController::class, 'updatePlusOnes'])->name('attendees.plus-ones');
    Route::patch('attendees/{attendee}/assigned-values', [AdminAttendeeController::class, 'updateAssignedValues'])->name('attendees.assigned-values');

    Route::get('ministries', [AdminMinistryController::class, 'index'])->name('ministries.index');
    Route::get('ministries/create', [AdminMinistryController::class, 'create'])->name('ministries.create');
    Route::post('ministries', [AdminMinistryController::class, 'store'])->name('ministries.store');
    Route::get('ministries/{ministry}/edit', [AdminMinistryController::class, 'edit'])->name('ministries.edit');
    Route::put('ministries/{ministry}', [AdminMinistryController::class, 'update'])->name('ministries.update');
    Route::delete('ministries/{ministry}', [AdminMinistryController::class, 'destroy'])->name('ministries.destroy');

    Route::patch('settings/login-birthdate', [AdminSettingController::class, 'updateLoginBirthdateRequirement'])->name('settings.login-birthdate');

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
    Route::get('{event}/attendees', [EventController::class, 'showAttendees'])->name('attendees');
    Route::patch('{event}/attendees/{attendee}/attendance', [EventController::class, 'updateAttendance'])->name('attendees.attendance');
    Route::post('{event}/attendees/import-families', [AdminImportController::class, 'importFamilies'])->name('attendees.import-families');
    Route::get('{event}/edit', [EventController::class, 'edit'])->name('edit');
    Route::get('{event}/qr-display', [EventController::class, 'qrDisplay'])->name('qr-display');
    Route::put('{event}', [EventController::class, 'update'])->name('update');
    Route::patch('{event}/login-method', [EventController::class, 'updateLoginMethod'])->name('login-method');
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
require __DIR__.'/maintenance.php';
