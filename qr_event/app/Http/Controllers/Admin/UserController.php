<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\ProfileValidationRules;
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
    use ProfileValidationRules;
    public function create(): Response
    {
        return Inertia::render('admin/users/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => $this->firstNameRules(),
            'last_name' => $this->lastNameRules(),
            'contact_number' => array_merge($this->contactNumberRules(), [Rule::unique('users', 'contact_number')]),
            'birthdate' => $this->birthdateRules(),
            'marital_status' => $this->maritalStatusRules(),
            'has_dg_leader' => $this->hasDgLeaderRules(),
            'dg_leader_name' => array_merge($this->dgLeaderNameRules(), [Rule::requiredIf($request->input('has_dg_leader') === 'yes')]),
            'want_to_join_dg' => ['nullable', Rule::in(['yes', 'no']), Rule::requiredIf($request->input('has_dg_leader') === 'no')],
            'password' => ['required', 'string', 'min:1', 'confirmed'],
        ]);

        $validated['dg_leader_name'] = $validated['has_dg_leader'] === 'yes'
            ? $validated['dg_leader_name']
            : null;

        $validated['want_to_join_dg'] = $validated['has_dg_leader'] === 'no'
            ? $validated['want_to_join_dg']
            : null;

        $user = User::create($validated);
        $user->assignRole('user');

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
            ->paginate(10, ['id', 'first_name', 'last_name', 'contact_number', 'birthdate', 'created_at', 'dg_leader_name', 'remarks', 'want_to_join_dg'])
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
                'want_to_join_dg' => $user->want_to_join_dg,
                'remarks' => $user->remarks,
            ],
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => $this->firstNameRules(),
            'last_name' => $this->lastNameRules(),
            'contact_number' => array_merge($this->contactNumberRules(), [Rule::unique('users', 'contact_number')->ignore($user->id)]),
            'birthdate' => $this->birthdateRules(),
            'marital_status' => $this->maritalStatusRules(),
            'has_dg_leader' => $this->hasDgLeaderRules(),
            'dg_leader_name' => array_merge($this->dgLeaderNameRules(), [Rule::requiredIf($request->input('has_dg_leader') === 'yes')]),
            'want_to_join_dg' => ['nullable', Rule::in(['yes', 'no']), Rule::requiredIf($request->input('has_dg_leader') === 'no')],
            'remarks' => ['nullable', 'string'],
            'password' => ['nullable', 'string', 'min:1', 'confirmed'],
        ]);

        $validated['dg_leader_name'] = $validated['has_dg_leader'] === 'yes'
            ? $validated['dg_leader_name']
            : null;

        $validated['want_to_join_dg'] = $validated['has_dg_leader'] === 'no'
            ? $validated['want_to_join_dg']
            : null;

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user->update($validated);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'update_user',
            'target_type' => 'User',
            'target_id' => $user->id,
            'description' => sprintf('Updated user: %s %s', $user->first_name, $user->last_name),
        ]);

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
