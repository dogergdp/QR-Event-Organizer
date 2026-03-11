<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendee extends Model
{
    protected $fillable = [
        'user_id',
        'event_id',
        'data_privacy_consent',
        'is_attended',
        'is_first_time',
        'is_paid',
        'is_walk_in',
        'assigned_values',
        'amount_paid',
        'plus_ones',
        'attended_time',
        'payment_type',
        'payment_remarks',
    ];

    protected $casts = [
        'data_privacy_consent' => 'boolean',
        'is_attended' => 'boolean',
        'is_first_time' => 'boolean',
        'is_paid' => 'boolean',
        'is_walk_in' => 'boolean',
        'assigned_values' => 'array',
        'amount_paid' => 'decimal:2',
        'plus_ones' => 'array',
        'attended_time' => 'datetime',
        'payment_type' => 'string',
        'payment_remarks' => 'string',
    ];

    protected static function booted(): void
    {
        // No global is_first_time update here anymore, per-event focus.
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
