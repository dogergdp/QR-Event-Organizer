<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\AppSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function updateLoginBirthdateRequirement(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'login_with_birthdate' => ['required', 'boolean'],
        ]);

        $enabled = (bool) $validated['login_with_birthdate'];

        AppSetting::setBoolean('login_with_birthdate', $enabled);

        ActivityLog::query()->create([
            'user_id' => $request->user()?->id,
            'action' => 'update_setting',
            'target_type' => 'AppSetting',
            'target_id' => null,
            'description' => sprintf(
                'Updated login setting: login_with_birthdate is now %s',
                $enabled ? 'enabled' : 'disabled'
            ),
        ]);

        return back()->with('success', 'Login method setting updated successfully.');
    }
}
