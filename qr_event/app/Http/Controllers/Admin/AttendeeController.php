<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Attendee;
use App\Models\Event;
use App\Models\User;
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
            ->with(['user:id,first_name,last_name,contact_number,birthdate', 'event:id,name'])
            ->when($search !== '', function ($query) use ($search) {
                $query->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery
                        ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('contact_number', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['id', 'user_id', 'event_id', 'is_attended', 'attended_time', 'created_at'])
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
            'event_id' => [
                'required',
                'exists:events,id',
                Rule::unique('attendees')->where(function ($query) use ($request) {
                    return $query->where('user_id', $request->input('user_id'));
                }),
            ],
            'is_attended' => ['sometimes', 'boolean'],
        ]);

        $validated['is_attended'] = (bool) ($validated['is_attended'] ?? false);
        $validated['attended_time'] = $validated['is_attended'] ? now() : null;

        $attendee = Attendee::create($validated);
        $user = User::find($attendee->user_id);
        $event = Event::find($attendee->event_id);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'create_attendee',
            'target_type' => 'Attendee',
            'target_id' => $attendee->id,
            'description' => sprintf(
                'Added attendee %s %s to event %s',
                $user?->first_name ?? 'Unknown',
                $user?->last_name ?? 'User',
                $event?->name ?? 'Unknown event'
            ),
        ]);

        return redirect()->route('admin.attendees')->with('success', 'Attendee added successfully.');
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

        $attendee->delete();

        return redirect()->route('admin.attendees')->with('success', 'Attendee deleted successfully.');
    }
}
