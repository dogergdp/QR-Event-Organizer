<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendee extends Model
{
    protected $fillable = [
        'user_id',
        'event_id',
        'is_attended',
        'is_first_time',
        'attended_time',
    ];

    protected $casts = [
        'is_attended' => 'boolean',
        'is_first_time' => 'boolean',
        'attended_time' => 'datetime',
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

