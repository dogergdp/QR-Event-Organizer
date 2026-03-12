<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Laravel\Fortify\Fortify;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $isAdminLogin = $this->boolean('admin_login') || $this->filled('email');

        if ($isAdminLogin) {
            // For admin login, require email and password
            return [
                'email' => 'required|string|email',
                'password' => 'required|string',
            ];
        }

        // For user login, require contact_number and password
        return [
            Fortify::username() => 'required|string',
            'password' => 'required|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email.required' => 'The email field is required.',
            'email.email' => 'The email field must be a valid email address.',
            'password.required' => 'The password field is required.',
            Fortify::username().'.required' => 'The '.Fortify::username().' field is required.',
        ];
    }
}
