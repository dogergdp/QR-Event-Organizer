<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Attendee;
use App\Models\Event;
use App\Models\User;
use App\Services\LiveDashboardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AttendeeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $attendees = Attendee::query()
            ->with(['user:id,first_name,last_name,contact_number,birthdate,want_to_join_dg,dg_leader_name', 'event:id,name'])
            ->when($search !== '', function ($query) use ($search) {
                $query->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery
                        ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('contact_number', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['id', 'user_id', 'event_id', 'is_attended', 'is_first_time', 'attended_time', 'created_at'])
            ->withQueryString();

        return Inertia::render('admin/attendees', [
            'attendees' => $attendees,
            'users' => User::query()
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get(['id', 'first_name', 'last_name', 'contact_number']),
            'events' => Event::query()
                ->orderByDesc('date')
                ->orderBy('start_time')
                ->get(['id', 'name', 'date']),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'event_id' => ['required', 'exists:events,id'],
            'is_attended' => ['sometimes', 'boolean'],
            'is_paid' => ['sometimes', 'boolean'],
            'amount_paid' => ['nullable', 'numeric', 'min:0'],
            'payment_type' => ['nullable', 'string', 'max:50'],
            'payment_remarks' => ['nullable', 'string', 'max:255'],
            'redirect_to' => ['nullable', 'string', 'starts_with:/'],
        ]);

        $isAttended = (bool) ($validated['is_attended'] ?? false);
        $attendedTime = $isAttended ? now() : null;
        $amountPaid = array_key_exists('amount_paid', $validated) && $validated['amount_paid'] !== null
            ? (float) $validated['amount_paid']
            : null;
        $isPaid = (bool) ($validated['is_paid'] ?? false) || ($amountPaid !== null && $amountPaid > 0);

        $attendee = Attendee::updateOrCreate(
            [
                'user_id' => $validated['user_id'],
                'event_id' => $validated['event_id'],
            ],
            [
                'is_attended' => $isAttended,
                'attended_time' => $attendedTime,
                'is_paid' => $isPaid,
                'amount_paid' => $isPaid ? $amountPaid : null,
                'payment_type' => $validated['payment_type'] ?? null,
                'payment_remarks' => $validated['payment_remarks'] ?? null,
            ]
        );

        $user = User::find($attendee->user_id);
        $event = Event::find($attendee->event_id);

        $action = $attendee->wasRecentlyCreated ? 'create_attendee' : 'update_attendee';
        $description = $attendee->wasRecentlyCreated
            ? sprintf('Added attendee %s %s to event %s', $user?->first_name ?? 'Unknown', $user?->last_name ?? 'User', $event?->name ?? 'Unknown event')
            : sprintf('Updated attendance status for %s %s at event %s', $user?->first_name ?? 'Unknown', $user?->last_name ?? 'User', $event?->name ?? 'Unknown event');

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => $action,
            'target_type' => 'Attendee',
            'target_id' => $attendee->id,
            'description' => $description,
        ]);

        LiveDashboardService::notify($attendee->wasRecentlyCreated ? 'attendee_created' : 'attendance_confirmed', $attendee->event_id);

        $message = $attendee->wasRecentlyCreated ? 'Attendee added successfully.' : 'Attendee status updated successfully.';
        if (! empty($validated['redirect_to'])) {
            return redirect($validated['redirect_to'])->with('success', $message);
        }

        return redirect()->route('admin.attendees')->with('success', $message);
    }

    public function destroy(Request $request, Attendee $attendee): RedirectResponse
    {
        $attendee->loadMissing(['user:id,first_name,last_name', 'event:id,name']);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'delete_attendee',
            'target_type' => 'Attendee',
            'target_id' => $attendee->id,
            'description' => sprintf(
                'Removed attendee %s %s from event %s',
                $attendee->user?->first_name ?? 'Unknown',
                $attendee->user?->last_name ?? 'User',
                $attendee->event?->name ?? 'Unknown event'
            ),
        ]);

        LiveDashboardService::notify('attendee_deleted', $attendee->event_id);

        $attendee->delete();

        return redirect()->route('admin.attendees')->with('success', 'Attendee deleted successfully.');
    }

    public function updatePaymentStatus(Request $request, Attendee $attendee): RedirectResponse
    {
        $validated = $request->validate([
            'is_paid' => ['required', 'boolean'],
            'amount_paid' => ['nullable', 'numeric', 'min:0'],
            'payment_type' => ['nullable', 'string', 'max:50'],
            'payment_remarks' => ['nullable', 'string', 'max:255'],
        ]);

        if ($attendee->is_attended) {
            return back()->with('error', 'Paid status can only be updated before check-in.');
        }

        $attendee->loadMissing(['user:id,first_name,last_name', 'event:id,name']);
        $attendee->update([
            'is_paid' => (bool) $validated['is_paid'],
            'amount_paid' => (bool) $validated['is_paid']
                ? ($validated['amount_paid'] ?? $attendee->amount_paid)
                : null,
            'payment_type' => $validated['payment_type'] ?? $attendee->payment_type,
            'payment_remarks' => $validated['payment_remarks'] ?? $attendee->payment_remarks,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'update_attendee_payment',
            'target_type' => 'Attendee',
            'target_id' => $attendee->id,
            'description' => sprintf(
                'Updated paid status for %s %s in event %s to %s',
                $attendee->user?->first_name ?? 'Unknown',
                $attendee->user?->last_name ?? 'User',
                $attendee->event?->name ?? 'Unknown event',
                $attendee->is_paid ? 'Paid' : 'Unpaid'
            ),
        ]);

        return back()->with('success', 'Paid status updated successfully.');
    }
}
