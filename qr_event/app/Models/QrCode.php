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
     * Check if QR code is active.
     *
     * Manual activation/deactivation controls validity.
     * The expiration date is used for reference, but the admin
     * can manually toggle activation status.
     */
    public function isValid(): bool
    {
        return (bool) $this->is_active;
    }

    /**
     * Get QR code display data
     */
    public function getQrUrl(): string
    {
        return route('qr.view', ['token' => $this->token]);
    }
}
