<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QrCode extends Model
{
    protected $fillable = [
        'event_id',
        'name',
        'purpose',
        'code',
        'is_active',
        'expires_at',
        'token',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    /**
     * Relationship with Event
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Check if QR code is active and not expired.
     *
     * If the current time is past expires_at, the QR code is automatically
     * considered inactive.
     */
    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        // If expires_at is set and the current time is past it, auto-deactivate
        if ($this->expires_at && now()->greaterThan($this->expires_at)) {
            // We update the database record to reflect the auto-deactivation
            $this->update(['is_active' => false]);
            return false;
        }

        return true;
    }

    /**
     * Get QR code display data
     */
    public function getQrUrl(): string
    {
        return route('qr.view', ['token' => $this->token]);
    }
}
