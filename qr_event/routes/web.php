<?php

use App\Http\Controllers\EventController;
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
            ]);

        return Inertia::render('dashboard', [
            'events' => $events,
            'isAdmin' => false,
        ]);
    }
})->middleware(['auth'])->name('dashboard');

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('users', function () {
        $users = User::query()
            ->orderBy('created_at', 'desc')
            ->get(['id', 'first_name', 'last_name', 'contact_number', 'created_at']);

        return Inertia::render('admin/users', [
            'users' => $users,
        ]);
    })->name('users');

    Route::get('attendees', function () {
        $attendees = Attendee::query()
            ->with(['user:id,first_name,last_name,contact_number', 'event:id,name'])
            ->orderBy('created_at', 'desc')
            ->get(['id', 'user_id', 'event_id', 'is_attended', 'attended_time', 'created_at']);

        return Inertia::render('admin/attendees', [
            'attendees' => $attendees,
        ]);
    })->name('attendees');
});

Route::middleware(['auth', 'admin'])->prefix('events')->name('events.')->group(function () {
    Route::get('create', [EventController::class, 'create'])->name('create');
    Route::post('/', [EventController::class, 'store'])->name('store');
    Route::get('{event}/edit', [EventController::class, 'edit'])->name('edit');
    Route::put('{event}', [EventController::class, 'update'])->name('update');
});

Route::middleware(['auth'])->prefix('events')->name('events.')->group(function () {
    Route::get('{event}', [EventController::class, 'show'])->name('show');
});

require __DIR__.'/settings.php';
