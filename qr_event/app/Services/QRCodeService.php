<?php

namespace App\Services;

class QRCodeService
{
    private const SECRET_KEY = 'event-checkin-secret';

    private const TOKEN_VALIDITY = 60; // seconds

    /**
     * Generate a stateless HMAC-signed token for event check-in
     * Token format: event_id:timestamp:signature
     */
    public static function generateToken(int $eventId): string
    {
        $timestamp = time();
        $data = "{$eventId}:{$timestamp}";
        $signature = hash_hmac('sha256', $data, self::SECRET_KEY);

        return "{$data}:{$signature}";
    }

    /**
     * Validate a check-in token
     * Returns event_id if valid, null if invalid or expired
     */
    public static function validateToken(string $token): ?int
    {
        $parts = explode(':', $token);

        if (count($parts) !== 3) {
            return null;
        }

        [$eventId, $timestamp, $signature] = $parts;

        // Validate signature
        $data = "{$eventId}:{$timestamp}";
        $expectedSignature = hash_hmac('sha256', $data, self::SECRET_KEY);

        if (! hash_equals($signature, $expectedSignature)) {
            return null;
        }

        // Check if within 60-second validity window
        $age = time() - (int) $timestamp;
        if ($age > self::TOKEN_VALIDITY || $age < 0) {
            return null;
        }

        return (int) $eventId;
    }

    /**
     * Generate QR code URL
     * Format: /attendance/scan/{token}
     */
    public static function generateQRUrl(int $eventId): string
    {
        $token = self::generateToken($eventId);

        return route('attendance.scan', ['token' => $token]);
    }
}
