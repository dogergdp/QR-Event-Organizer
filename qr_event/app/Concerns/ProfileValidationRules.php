<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Validation\Rule;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>>
     */
    protected function profileRules(?int $userId = null): array
    {
        return [
            'first_name' => $this->firstNameRules(),
            'last_name' => $this->lastNameRules(),
            'contact_number' => $this->contactNumberRules(),
            'birthdate' => $this->birthdateRules(),
            'marital_status' => $this->maritalStatusRules(),
            'has_dg_leader' => $this->hasDgLeaderRules(),
            'dg_leader_name' => $this->dgLeaderNameRules(),
        ];
    }

    /**
     * Get the validation rules used to validate user first names.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function firstNameRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    /**
     * Get the validation rules used to validate user last names.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function lastNameRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    /**
     * Get the validation rules used to validate contact numbers.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function contactNumberRules(): array
    {
        return ['required', 'string', 'size:11', 'regex:/^09\d{9}$/'];
    }

    /**
     * Get the validation rules used to validate birthdates.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function birthdateRules(): array
    {
        return ['nullable', 'date', 'before_or_equal:today'];
    }

    /**
     * Get the validation rules used to validate marital status.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function maritalStatusRules(): array
    {
        return ['nullable', Rule::in(['single', 'married', 'separated', 'widowed'])];
    }

    /**
     * Get the validation rules used to validate if user has a DG Leader.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function hasDgLeaderRules(): array
    {
        return ['nullable', Rule::in(['yes', 'no'])];
    }

    /**
     * Get the validation rules used to validate DG Leader name.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function dgLeaderNameRules(): array
    {
        return ['nullable', 'string', 'max:255'];
    }
}
