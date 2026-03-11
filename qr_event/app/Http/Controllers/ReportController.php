<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Attendee;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Show the reports dashboard.
     */
    public function index(): Response
    {
        $totalEvents = Event::count();
        $finishedEvents = Event::where('is_finished', true)->count();
        $totalAttendees = User::count();
        $totalAttendances = Attendee::where('is_attended', true)->count();

        // Get events with attendance counts
        $events = Event::withCount([
            'attendees',
            'attendees as attended_count' => fn ($q) => $q->where('is_attended', true),
        ])
            ->orderBy('date', 'desc')
            ->get()
            ->map(fn ($event) => [
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
            'attendances as attended_events' => fn ($q) => $q->where('is_attended', true),
        ])
            ->orderBy('attended_events', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => "{$user->first_name} {$user->last_name}",
                'contact_number' => $user->contact_number,
                'events_attended' => $user->attended_events,
                'is_first_time' => $user->is_first_time,
            ]);

        // Get attendance statistics
        $attendanceStats = [
            'total_events' => $totalEvents,
            'finished_events' => $finishedEvents,
            'total_attendees' => $totalAttendees,
            'total_attendances' => $totalAttendances,
            'average_attendance_rate' => $totalAttendees > 0
                ? round(($totalAttendances / $totalAttendees), 2)
                : 0,
        ];

        return Inertia::render('reports/index', [
            'stats' => $attendanceStats,
            'events' => $events,
            'topAttendees' => $topAttendees,
        ]);
    }

    /**
     * Export events report to CSV.
     */
    public function exportEvents(): StreamedResponse
    {
        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');

            // Write headers
            fputcsv($handle, [
                'ID',
                'Event Name',
                'Date',
                'Start Time',
                'End Time',
                'Location',
                'Total Registered',
                'Total Attended',
                'Finished',
                'Created At',
            ]);

            // Get events data
            $events = Event::withCount([
                'attendees',
                'attendees as attended_count' => fn ($q) => $q->where('is_attended', true),
            ])->get();

            foreach ($events as $event) {
                fputcsv($handle, [
                    $event->id,
                    $event->name,
                    $event->date,
                    $event->start_time,
                    $event->end_time,
                    $event->location,
                    $event->attendees_count,
                    $event->attended_count,
                    $event->is_finished ? 'Yes' : 'No',
                    $event->created_at,
                ]);
            }

            // Add blank row and timestamp
            fputcsv($handle, []);
            fputcsv($handle, ['Report Generated:', now()->format('Y-m-d H:i:s')]);

            fclose($handle);
        }, 'events-report.csv');
    }

    /**
     * Export registered users report to CSV.
     */
    public function exportAttendees(): StreamedResponse
    {
        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');

            // Write headers
            fputcsv($handle, [
                'ID',
                'First Name',
                'Last Name',
                'Contact Number',
                'Birthdate',
                'Marital Status',
                'Has DG Leader',
                'DG Leader Name',
                'Wants to Join DG',
                'First Time',
                'Remarks',
                'Registered At',
            ]);

            // Get registered users data
            $users = User::all();

            foreach ($users as $user) {
                fputcsv($handle, [
                    $user->id,
                    $user->first_name,
                    $user->last_name,
                    $user->contact_number,
                    $user->birthdate,
                    $user->marital_status,
                    $user->has_dg_leader ? 'Yes' : 'No',
                    $user->dg_leader_name ?? 'N/A',
                    $user->want_to_join_dg ?? 'N/A',
                    $user->is_first_time ? 'Yes' : 'No',
                    $user->remarks ?? 'N/A',
                    $user->created_at,
                ]);
            }

            // Add blank row and timestamp
            fputcsv($handle, []);
            fputcsv($handle, ['Report Generated:', now()->format('Y-m-d H:i:s')]);

            fclose($handle);
        }, 'registered-users.csv');
    }

    /**
     * Export attendance details to CSV.
     */
    public function exportAttendanceDetails(): StreamedResponse
    {
        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');

            // Write headers
            fputcsv($handle, [
                'Event Name',
                'Event Date',
                'First Name',
                'Last Name',
                'Contact Number',
                'Attended',
                'Attendance Time',
                'First Time Attendee',
            ]);

            // Get attendance data
            $attendances = Attendee::with('user', 'event')->get();

            foreach ($attendances as $attendee) {
                fputcsv($handle, [
                    $attendee->event->name,
                    $attendee->event->date,
                    $attendee->user->first_name,
                    $attendee->user->last_name,
                    $attendee->user->contact_number,
                    $attendee->is_attended ? 'Yes' : 'No',
                    $attendee->attended_time,
                    $attendee->is_first_time ? 'Yes' : 'No',
                ]);
            }

            // Add blank row and timestamp
            fputcsv($handle, []);
            fputcsv($handle, ['Report Generated:', now()->format('Y-m-d H:i:s')]);

            fclose($handle);
        }, 'attendance-details.csv');
    }

    /**
     * Export activity logs to CSV.
     */
    public function exportLogs(): StreamedResponse
    {
        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Time',
                'User',
                'Action',
                'Target Type',
                'Target ID',
                'Description',
            ]);

            $logs = ActivityLog::with('user:id,first_name,last_name')
                ->latest()
                ->get();

            foreach ($logs as $log) {
                $userName = $log->user
                    ? trim($log->user->first_name.' '.$log->user->last_name)
                    : 'System';

                fputcsv($handle, [
                    $log->created_at->format('Y-m-d H:i:s'),
                    $userName !== '' ? $userName : 'User',
                    $log->action,
                    $log->target_type ?? '—',
                    $log->target_id ?? '—',
                    $log->description ?? '',
                ]);
            }

            fputcsv($handle, []);
            fputcsv($handle, ['Report Generated:', now()->format('Y-m-d H:i:s')]);

            fclose($handle);
        }, 'activity-logs.csv');
    }

    /**
     * Export attendees for a specific event to CSV.
     */
    public function exportEventAttendees(Event $event, Request $request): StreamedResponse
    {
        $type = $request->query('type', 'all');

        return response()->streamDownload(function () use ($event, $type) {
            $handle = fopen('php://output', 'w');

            $headers = [
                'First Name',
                'Last Name',
                'Contact Number',
                'Attended',
                'Attendance Time',
                'First Time (Event)',
                'Walk-in',
                'Paid',
                'Amount Paid (PHP)',
                'Plus Ones Count',
                'Plus Ones Names',
                'Plus Ones Details',
            ];

            $query = Attendee::with('user')
                ->where('event_id', $event->id);

            if ($type === 'rsvp') {
                $query->where('is_attended', false);
            } elseif ($type === 'attendance') {
                $query->where('is_attended', true);
            } elseif ($type === 'first_time') {
                $query->where('is_attended', true)
                    ->where('is_first_time', true);
            }

            $attendees = $query->get();

            $title = match ($type) {
                'rsvp' => 'RSVP List',
                'attendance' => 'Attendance List',
                'first_time' => 'First Timers List',
                default => 'All Event Participants'
            };

            fputcsv($handle, [$title.' for '.$event->name.' ('.$event->date.')']);
            fputcsv($handle, []);
            fputcsv($handle, $headers);

            $totalAmountPaid = 0.0;

            foreach ($attendees as $attendee) {
                $amountPaid = (float) ($attendee->amount_paid ?? 0);
                $plusOnes = is_array($attendee->plus_ones) ? $attendee->plus_ones : [];
                $plusOnesCount = count($plusOnes);
                $plusOnesNames = collect($plusOnes)
                    ->pluck('full_name')
                    ->filter()
                    ->implode(' | ');

                $plusOnesDetails = collect($plusOnes)
                    ->map(function ($plusOne) {
                        if (! is_array($plusOne)) {
                            return null;
                        }

                        $name = $plusOne['full_name'] ?? 'Unnamed';
                        $age = $plusOne['age'] ?? '—';
                        $gender = $plusOne['gender'] ?? '—';
                        $firstTime = isset($plusOne['is_first_time']) ? ((bool) $plusOne['is_first_time'] ? 'Yes' : 'No') : '—';
                        $remarks = $plusOne['remarks'] ?? '—';

                        return sprintf('%s (Age: %s, Gender: %s, First Time: %s, Remarks: %s)', $name, $age, $gender, $firstTime, $remarks);
                    })
                    ->filter()
                    ->implode(' | ');

                $totalAmountPaid += $amountPaid;

                fputcsv($handle, [
                    $attendee->user->first_name,
                    $attendee->user->last_name,
                    $attendee->user->contact_number,
                    $attendee->is_attended ? 'Yes' : 'No',
                    $attendee->attended_time,
                    $attendee->is_first_time ? 'Yes' : 'No',
                    $attendee->is_walk_in ? 'Yes' : 'No',
                    $attendee->is_paid ? 'Yes' : 'No',
                    number_format($amountPaid, 2, '.', ''),
                    $plusOnesCount,
                    $plusOnesNames,
                    $plusOnesDetails,
                ]);
            }

            // Add totals and timestamp
            fputcsv($handle, []);
            fputcsv($handle, ['Total Amount Paid (PHP)', number_format($totalAmountPaid, 2, '.', '')]);
            fputcsv($handle, []);
            fputcsv($handle, ['Report Generated:', now()->format('Y-m-d H:i:s')]);

            fclose($handle);
        }, "event-{$type}-{$event->name}-{$event->date}.csv");
    }
}
