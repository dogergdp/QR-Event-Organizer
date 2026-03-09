<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\AppSetting;

class MaintenanceModeMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Get maintenance mode and scope from settings
        $enabled = AppSetting::getBoolean('maintenance_mode', false);
        $scope = AppSetting::query()->where('key', 'maintenance_scope')->value('value') ?? 'all'; // 'all' or 'users'

        if ($enabled) {
            $user = Auth::user();
            $isAdmin = $user && method_exists($user, 'isAdmin') ? $user->isAdmin() : false;

            if ($scope === 'all' || ($scope === 'users' && (!$user || !$isAdmin))) {
                // Allow access to authentication and maintenance routes (GET/POST)
                $allowedUris = [
                    '/login', '/logout', '/admin/login', '/register', '/password/reset', '/password/email', '/password/request', '/password/confirm', '/password/update', '/two-factor-challenge', '/maintenance'
                ];
                $requestUri = $request->getPathInfo();
                if (!in_array($requestUri, $allowedUris)) {
                    return response()->view('maintenance');
                }
            }
        }

        return $next($request);
    }
}
