<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\Admin\AttendeeController as AdminAttendeeController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ReportController;
use App\Models\Attendee;
use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    $user = request()->user();
    
    if ($user->isAdmin()) {
        $events = Event::query()
            ->orderBy('date')
            ->orderBy('start_time')
            ->get([
                'id',
                'name',
                'date',
                'start_time',
                'end_time',
                'description',
                'location',
                'banner_image',
                'is_finished',
                'is_ongoing',
            ]);

        return Inertia::render('dashboard', [
            'events' => $events,
            'isAdmin' => true,
        ]);
    } else {
        $events = Event::query()
            ->where('is_finished', false)
            ->orderBy('date')
            ->orderBy('start_time')
            ->get([
                'id',
                'name',
                'date',
                'start_time',
                'end_time',
                'description',
                'location',
                'banner_image',
                'is_finished',
                'is_ongoing',
            ]);

        return Inertia::render('dashboard', [
            'events' => $events,
            'isAdmin' => false,
        ]);
    }
})->middleware(['auth'])->name('dashboard');

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('users', [AdminUserController::class, 'index'])->name('users');
    Route::get('users/{user}/edit', [AdminUserController::class, 'edit'])->name('users.edit');
    Route::put('users/{user}', [AdminUserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

    Route::get('attendees', [AdminAttendeeController::class, 'index'])->name('attendees');
    Route::post('attendees', [AdminAttendeeController::class, 'store'])->name('attendees.store');
    Route::delete('attendees/{attendee}', [AdminAttendeeController::class, 'destroy'])->name('attendees.destroy');

    Route::get('reports', [ReportController::class, 'index'])->name('reports');
    Route::get('reports/export/events', [ReportController::class, 'exportEvents'])->name('reports.export.events');
    Route::get('reports/export/attendees', [ReportController::class, 'exportAttendees'])->name('reports.export.attendees');
    Route::get('reports/export/attendance-details', [ReportController::class, 'exportAttendanceDetails'])->name('reports.export.attendance-details');
    Route::get('reports/export/event/{event}/attendees', [ReportController::class, 'exportEventAttendees'])->name('reports.export.event.attendees');
});

Route::middleware(['auth', 'admin'])->prefix('events')->name('events.')->group(function () {
    Route::get('create', [EventController::class, 'create'])->name('create');
    Route::post('/', [EventController::class, 'store'])->name('store');
    Route::get('{event}/edit', [EventController::class, 'edit'])->name('edit');
    Route::get('{event}/qr-display', [EventController::class, 'qrDisplay'])->name('qr-display');
    Route::put('{event}', [EventController::class, 'update'])->name('update');
    Route::delete('{event}', [EventController::class, 'destroy'])->name('destroy');
});
// Attendance/Check-in routes
Route::middleware(['auth'])->prefix('attendance')->name('attendance.')->group(function () {
    Route::get('scan', [AttendanceController::class, 'scan'])->name('scan');
    Route::post('confirm', [AttendanceController::class, 'confirm'])->name('confirm');
});
Route::middleware(['auth'])->prefix('events')->name('events.')->group(function () {
    Route::get('{event}', [EventController::class, 'show'])->name('show');
});

require __DIR__.'/settings.php';
