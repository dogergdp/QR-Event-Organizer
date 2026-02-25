<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Inertia\Inertia;

class LogController extends Controller
{
    public function index()
    {
        $logs = ActivityLog::with('user:id,first_name,last_name')
            ->latest()
            ->paginate(15)
            ->through(function ($log) {
                $userName = $log->user 
                    ? trim($log->user->first_name . ' ' . $log->user->last_name) 
                    : 'System';

                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'target_type' => $log->target_type,
                    'target_id' => $log->target_id,
                    'description' => $log->description,
                    'user' => $userName !== '' ? $userName : 'User',
                    'created_at' => $log->created_at->format('M d, Y h:i A'),
                ];
            });

        return Inertia::render('admin/logs', [
            'logs' => $logs,
        ]);
    }
}