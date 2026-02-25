<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Attendee;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return $this->renderAdminDashboard();
        }

        return $this->renderUserDashboard($user);
    }

    private function renderAdminDashboard()
    {
        $totalEvents = Event::count();
        $totalAttendees = User::count();
        $totalAttendances = Attendee::where('is_attended', true)->count();

        $reportEvents = Event::with([
            'attendees' => fn($query) => $query
                ->with('user:id,first_name,last_name,contact_number')
                ->select('id', 'user_id', 'event_id', 'is_attended', 'attended_time'),
        ])
        ->withCount([
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
            'rsvp' => $event->attendees->where('is_attended', false)->values()->map(fn($attendee) => [
                'id' => $attendee->id,
                'name' => trim(($attendee->user->first_name ?? '') . ' ' . ($attendee->user->last_name ?? '')),
                'contact_number' => $attendee->user->contact_number ?? '',
                'attended_time' => null,
            ]),
            'attendees' => $event->attendees->where('is_attended', true)->values()->map(fn($attendee) => [
                'id' => $attendee->id,
                'name' => trim(($attendee->user->first_name ?? '') . ' ' . ($attendee->user->last_name ?? '')),
                'contact_number' => $attendee->user->contact_number ?? '',
                'attended_time' => optional($attendee->attended_time)?->format('M d, Y h:i A'),
            ]),
        ]);

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

        $events = Event::query()
            ->orderBy('date')
            ->orderBy('start_time')
            ->get(['id', 'name', 'date', 'start_time', 'end_time', 'description', 'location', 'banner_image', 'is_finished', 'is_ongoing']);

        return Inertia::render('dashboard/index', [
            'events' => $events,
            'isAdmin' => true,
            'stats' => [
                'total_events' => $totalEvents,
                'finished_events' => Event::where('is_finished', true)->count(),
                'total_attendees' => $totalAttendees,
                'total_attendances' => $totalAttendances,
                'average_attendance_rate' => $totalAttendees > 0 ? round(($totalAttendances / $totalAttendees), 2) : 0,
            ],
            'reportEvents' => $reportEvents,
            'topAttendees' => $topAttendees,
            'activityLogs' => $this->getRecentLogs(4),
        ]);
    }

    private function renderUserDashboard(User $user)
    {
        $events = Event::query()
            ->where('is_finished', false)
            ->orderBy('date')
            ->orderBy('start_time')
            ->get(['id', 'name', 'date', 'start_time', 'end_time', 'description', 'location', 'banner_image', 'is_finished', 'is_ongoing'])
            ->map(function($event) use ($user) {
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
                    'has_rsvp' => $event->attendees()->where('user_id', $user->id)->exists(),
                ];
            });

        return Inertia::render('dashboard', [
            'events' => $events,
            'isAdmin' => false,
        ]);
    }

    private function getRecentLogs(int $limit)
    {
        return ActivityLog::with('user:id,first_name,last_name')
            ->latest()
            ->take($limit)
            ->get()
            ->map(function ($log) {
                $userName = $log->user ? trim($log->user->first_name . ' ' . $log->user->last_name) : 'System';
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
    }
}