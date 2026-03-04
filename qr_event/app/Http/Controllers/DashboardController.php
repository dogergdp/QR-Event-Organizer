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
        $totalAttendances = Attendee::query()
            ->get(['is_attended', 'plus_ones'])
            ->sum(function (Attendee $attendee) {
                $primaryAttended = $attendee->is_attended ? 1 : 0;
                $plusOnesAttended = collect($attendee->plus_ones ?? [])->where('is_attended', true)->count();

                return $primaryAttended + $plusOnesAttended;
            });

        $reportEvents = Event::with([
            'attendees' => fn($query) => $query
                ->with('user:id,first_name,last_name,contact_number')
                ->latest('updated_at')
                ->select('id', 'user_id', 'event_id', 'is_attended', 'attended_time', 'is_first_time', 'plus_ones'),
        ])
        ->orderBy('date', 'desc')
        ->limit(10)
        ->get()
        ->map(function ($event) {
            $totalRegistered = $event->attendees->sum(function (Attendee $attendee) {
                return 1 + count($attendee->plus_ones ?? []);
            });

            $totalAttended = $event->attendees->sum(function (Attendee $attendee) {
                $primaryAttended = $attendee->is_attended ? 1 : 0;
                $plusOnesAttended = collect($attendee->plus_ones ?? [])->where('is_attended', true)->count();

                return $primaryAttended + $plusOnesAttended;
            });

            return [
                'id' => $event->id,
                'name' => $event->name,
                'date' => $event->date,
                'start_time' => $event->start_time,
                'location' => $event->location,
                'total_registered' => $totalRegistered,
                'total_attended' => $totalAttended,
                'rsvp' => $event->attendees
                    ->filter(function (Attendee $attendee) {
                        $primaryNotAttended = ! $attendee->is_attended;
                        $plusOneNotAttended = collect($attendee->plus_ones ?? [])->contains(
                            fn(array $member) => ! (bool) ($member['is_attended'] ?? false)
                        );

                        return $primaryNotAttended || $plusOneNotAttended;
                    })
                    ->values()
                    ->map(fn($attendee) => [
                        'id' => $attendee->id,
                        'name' => trim(($attendee->user->first_name ?? '') . ' ' . ($attendee->user->last_name ?? '')),
                        'contact_number' => $attendee->user->contact_number ?? '',
                        'attended_time' => null,
                        'is_attended' => (bool) $attendee->is_attended,
                        'is_first_time' => $attendee->is_first_time,
                        'plus_ones' => collect($attendee->plus_ones ?? [])->filter(
                            fn(array $member) => ! (bool) ($member['is_attended'] ?? false)
                        )->map(fn(array $member) => [
                            'id' => (string) ($member['id'] ?? ''),
                            'full_name' => (string) ($member['full_name'] ?? ''),
                            'is_first_time' => (bool) ($member['is_first_time'] ?? false),
                            'is_attended' => (bool) ($member['is_attended'] ?? false),
                        ])->values(),
                    ]),
                'attendees' => $event->attendees->where('is_attended', true)->values()->map(fn($attendee) => [
                    'id' => $attendee->id,
                    'name' => trim(($attendee->user->first_name ?? '') . ' ' . ($attendee->user->last_name ?? '')),
                    'contact_number' => $attendee->user->contact_number ?? '',
                    'attended_time' => optional($attendee->attended_time)?->format('M d, Y h:i A'),
                    'is_attended' => true,
                    'is_first_time' => $attendee->is_first_time,
                    'plus_ones' => collect($attendee->plus_ones ?? [])->where('is_attended', true)->map(fn(array $member) => [
                        'id' => (string) ($member['id'] ?? ''),
                        'full_name' => (string) ($member['full_name'] ?? ''),
                        'is_first_time' => (bool) ($member['is_first_time'] ?? false),
                        'is_attended' => (bool) ($member['is_attended'] ?? false),
                    ])->values(),
                ]),
            ];
        });

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
            ->map(function (Event $event) use ($user) {
                $attendee = $event->attendees()->where('user_id', $user->id)->first();
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
                    'has_rsvp' => $attendee !== null,
                    'is_attended' => $attendee?->is_attended ?? false,
                ];
            });

        return Inertia::render('dashboard/index', [
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
