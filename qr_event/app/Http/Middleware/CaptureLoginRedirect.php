<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CaptureLoginRedirect
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Capture redirect_url from login form submission
        if ($request->isMethod('post') && $request->path() === 'login') {
            $redirectUrl = $request->input('redirect_url');

            if ($redirectUrl && str_starts_with($redirectUrl, '/')) {
                // Validate it's a local path and not malicious
                if (! str_contains($redirectUrl, '//')) {
                    $request->session()->put('login_redirect_url', $redirectUrl);
                }
            }
        }

        return $next($request);
    }
}
