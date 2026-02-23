<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\AttendeeController as AdminAttendeeController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\QrCodeController;
use App\Http\Controllers\ReportController;
use App\Models\Attendee;
use App\Models\ActivityLog;
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
        
        $activityLogs = ActivityLog::with('user:id,first_name,last_name')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($log) {
                $userName = $log->user
                    ? trim($log->user->first_name . ' ' . $log->user->last_name)
                    : 'System';

                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'target_type' => $log->target_type,
                    'target_id' => $log->target_id,
                    'description' => $log->description,
                    'user' => $userName !== '' ? $userName : 'User',
                    'created_at' => $log->created_at->format('M d, Y h:i A'),
                ];
            });
        
    $user = request()->user();
    
    if ($user->isAdmin()) {
        $totalEvents = Event::count();
        $finishedEvents = Event::where('is_finished', true)->count();
        $totalAttendees = User::count();
        $totalAttendances = Attendee::where('is_attended', true)->count();
        
        // Get events with attendance counts for report
        $reportEvents = Event::withCount([
            'attendees',
            'attendees as attended_count' => fn($q) => $q->where('is_attended', true)
        ])
        ->orderBy('date', 'desc')
        ->limit(10)
        ->get()
        ->map(fn($event) => [
            'id' => $event->id,
            'name' => $event->name,
            'date' => $event->date,
            'start_time' => $event->start_time,
            'location' => $event->location,
            'total_registered' => $event->attendees_count,
            'total_attended' => $event->attended_count,
        ]);

        // Get top attendees
        $topAttendees = User::withCount([
            'attendances as attended_events' => fn($q) => $q->where('is_attended', true)
        ])
            ->orderBy('attended_events', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($user) => [
                'id' => $user->id,
                'name' => "{$user->first_name} {$user->last_name}",
                'contact_number' => $user->contact_number,
                'events_attended' => $user->attended_events,
                'is_first_time' => $user->is_first_time,
            ]);
            
        $stats = [
            'total_events' => $totalEvents,
            'finished_events' => $finishedEvents,
            'total_attendees' => $totalAttendees,
            'total_attendances' => $totalAttendances,
            'average_attendance_rate' => $totalAttendees > 0 
                ? round(($totalAttendances / $totalAttendees), 2)
                : 0,
        ];
        
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
            'stats' => $stats,
            'reportEvents' => $reportEvents,
            'topAttendees' => $topAttendees,
            'activityLogs' => $activityLogs,
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
            ])
            ->map(function($event) use ($user) {
                $hasRsvp = $event->attendees()
                    ->where('user_id', $user->id)
                    ->exists();
                
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'date' => $event->date,
                    'start_time' => $event->start_time,
                    'end_time' => $event->end_time,
                    'description' => $event->description,
                    'location' => $event->location,
                    'banner_image' => $event->banner_image,
                    'is_finished' => $event->is_finished,
                    'is_ongoing' => $event->is_ongoing,
                    'has_rsvp' => $hasRsvp,
                ];
            });

        return Inertia::render('dashboard', [
            'events' => $events,
            'isAdmin' => false,
        ]);
    }
})->middleware(['auth'])->name('dashboard');

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
    Route::get('logs', function () {
        $logs = ActivityLog::with('user:id,first_name,last_name')
            ->latest()
            ->paginate(15)
            ->through(function ($log) {
                $userName = $log->user
                    ? trim($log->user->first_name . ' ' . $log->user->last_name)
                    : 'System';

                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'target_type' => $log->target_type,
                    'target_id' => $log->target_id,
                    'description' => $log->description,
                    'user' => $userName !== '' ? $userName : 'User',
                    'created_at' => $log->created_at->format('M d, Y h:i A'),
                ];
            });

        return Inertia::render('admin/logs', [
            'logs' => $logs,
        ]);
    })->name('logs');
    Route::get('reports/export/events', [ReportController::class, 'exportEvents'])->name('reports.export.events');
    Route::get('reports/export/attendees', [ReportController::class, 'exportAttendees'])->name('reports.export.attendees');
    Route::get('reports/export/attendance-details', [ReportController::class, 'exportAttendanceDetails'])->name('reports.export.attendance-details');
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
    // QR Code management routes (auto-generated, only toggle active status)
    Route::get('{event}/qr', [QrCodeController::class, 'index'])->name('qr.index');
    Route::put('qr/{qrCode}/toggle', [QrCodeController::class, 'toggle'])->name('qr.toggle');
});

// Public QR code view route (when users scan QR code)
Route::get('qr/{token}', [QrCodeController::class, 'view'])->name('qr.view');

// QR-based registration
Route::post('qr-register', [AuthController::class, 'registerFromQR'])->name('qr.register');
Route::get('qr-register-confirm/{event}', [AuthController::class, 'showConfirmation'])
    ->middleware('auth')
    ->name('qr.register-confirm');

// Attendance/Check-in routes
Route::middleware(['auth'])->prefix('attendance')->name('attendance.')->group(function () {
    Route::get('scan', [AttendanceController::class, 'scan'])->name('scan');
    Route::post('confirm', [AttendanceController::class, 'confirm'])->name('confirm');
});

// User event routes (must come after admin routes to avoid conflicts)
Route::middleware(['auth'])->prefix('events')->name('events.')->group(function () {
    Route::get('{event}/rsvp', [EventController::class, 'showRsvp'])->name('rsvp');
    Route::post('{event}/confirm-rsvp', [EventController::class, 'confirmRsvp'])->name('confirm-rsvp');
    Route::post('{event}/mark-attendance', [AttendanceController::class, 'markAttendance'])->name('mark-attendance');
    Route::get('{event}', [EventController::class, 'show'])->name('show');
});

require __DIR__.'/settings.php';
