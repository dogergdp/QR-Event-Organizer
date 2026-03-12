<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateLoginRequest
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only intercept login requests
        if ($request->path() !== 'login' || $request->method() !== 'POST') {
            return $next($request);
        }

        $isAdminLogin = $request->boolean('admin_login') || $request->filled('email');

        // For admin login, contact_number is not required
        // Add a placeholder if empty to avoid validation errors
        if ($isAdminLogin && ! $request->filled('contact_number')) {
            $request->merge(['contact_number' => 'admin']);
        }

        return $next($request);
    }
}
