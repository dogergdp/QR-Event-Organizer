<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class LiveDashboardService
{
    public static function notify(string $reason = 'updated', ?int $eventId = null): void
    {
        $url = config('services.live_updates.url');

        if (!$url) {
            return;
        }

        $endpoint = rtrim($url, '/') . '/internal/dashboard-update';
        $secret = config('services.live_updates.secret');

        try {
            Http::timeout(2)
                ->asJson()
                ->withHeaders([
                    'X-Live-Secret' => (string) $secret,
                ])
                ->post($endpoint, [
                    'reason' => $reason,
                    'event_id' => $eventId,
                    'timestamp' => now()->toIso8601String(),
                ]);
        } catch (\Throwable $e) {
        }
    }
}
