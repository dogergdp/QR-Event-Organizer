<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'contact_number' => array_merge($this->contactNumberRules(), [Rule::unique('users', 'contact_number')]),
            'password' => $this->passwordRules(),
            'dg_leader_name' => Rule::requiredIf(($input['has_dg_leader'] ?? '') === 'yes'),
            'want_to_join_dg' => Rule::requiredIf(($input['has_dg_leader'] ?? '') === 'no'),
        ])->validate();

        $user = User::create([
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name'],
            'password' => $input['password'],
            'contact_number' => $input['contact_number'],
            'birthdate' => $input['birthdate'],
            'marital_status' => $input['marital_status'],
            'has_dg_leader' => $input['has_dg_leader'],
            'dg_leader_name' => $input['dg_leader_name'] ?? null,
            'want_to_join_dg' => $input['want_to_join_dg'] ?? null,
        ]);

        $role = \App\Models\Role::firstOrCreate(['name' => 'user']);
        $user->roles()->syncWithoutDetaching([$role->id]);

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'user_registration',
            'target_type' => 'User',
            'target_id' => $user->id,
            'description' => sprintf('User registered: %s %s', $user->first_name, $user->last_name),
        ]);

        return $user;
    }
}
