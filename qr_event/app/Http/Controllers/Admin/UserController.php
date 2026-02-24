<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('admin/users/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'max:20', Rule::unique('users', 'contact_number')],
            'birthdate' => ['required', 'date', 'before_or_equal:today'],
            'marital_status' => ['required', Rule::in(['single', 'married', 'separated', 'widowed'])],
            'has_dg_leader' => ['required', Rule::in(['yes', 'no'])],
            'dg_leader_name' => ['nullable', 'string', 'max:255', Rule::requiredIf($request->input('has_dg_leader') === 'yes')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $validated['dg_leader_name'] = $validated['has_dg_leader'] === 'yes'
            ? $validated['dg_leader_name']
            : null;

        $user = User::create($validated);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'create_user',
            'target_type' => 'User',
            'target_id' => $user->id,
            'description' => sprintf('Created user: %s %s', $user->first_name, $user->last_name),
        ]);

        return redirect()->route('admin.users')->with('success', 'User created successfully.');
    }

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $sort = (string) $request->query('sort', 'created_at');
        $direction = strtolower((string) $request->query('direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        $allowedSorts = ['id', 'name', 'age', 'created_at'];
        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'created_at';
        }

        $usersQuery = User::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($innerQuery) use ($search) {
                    $innerQuery
                        ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('contact_number', 'like', "%{$search}%");
                });
            });

        if ($sort === 'name') {
            $usersQuery
                ->orderBy('first_name', $direction)
                ->orderBy('last_name', $direction);
        } elseif ($sort === 'age') {
            $usersQuery->orderBy('birthdate', $direction === 'asc' ? 'desc' : 'asc');
        } else {
            $usersQuery->orderBy($sort, $direction);
        }

        $users = $usersQuery
            ->paginate(10, ['id', 'first_name', 'last_name', 'contact_number', 'birthdate', 'created_at', 'dg_leader_name', 'remarks'])
            ->withQueryString();

        return Inertia::render('admin/users', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', [
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'contact_number' => $user->contact_number,
                'birthdate' => optional($user->birthdate)->format('Y-m-d'),
                'marital_status' => $user->marital_status,
                'has_dg_leader' => $user->has_dg_leader,
                'dg_leader_name' => $user->dg_leader_name,
                'remarks' => $user->remarks,
            ],
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'max:20', Rule::unique('users', 'contact_number')->ignore($user->id)],
            'birthdate' => ['required', 'date', 'before_or_equal:today'],
            'marital_status' => ['required', Rule::in(['single', 'married', 'separated', 'widowed'])],
            'has_dg_leader' => ['required', Rule::in(['yes', 'no'])],
            'dg_leader_name' => ['nullable', 'string', 'max:255', Rule::requiredIf($request->input('has_dg_leader') === 'yes')],
            'remarks' => ['nullable', 'string'],
        ]);

        $validated['dg_leader_name'] = $validated['has_dg_leader'] === 'yes'
            ? $validated['dg_leader_name']
            : null;

        $user->update($validated);

        return redirect()->route('admin.users')->with('success', 'User updated successfully.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($request->user()?->id === $user->id) {
            return redirect()->route('admin.users')->with('error', 'You cannot delete your own account.');
        }

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'delete_user',
            'target_type' => 'User',
            'target_id' => $user->id,
            'description' => sprintf('Deleted user: %s %s', $user->first_name, $user->last_name),
        ]);

        $user->delete();

        return redirect()->route('admin.users')->with('success', 'User deleted successfully.');
    }
}
