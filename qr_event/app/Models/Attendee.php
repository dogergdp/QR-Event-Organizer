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
        'attended_time',
    ];

    protected $casts = [
        'is_attended' => 'boolean',
        'attended_time' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::updated(function (Attendee $attendee) {
            // If user is marked as attended and it's their first time, update is_first_time to false
            if ($attendee->is_attended && $attendee->user && $attendee->user->is_first_time) {
                $attendee->user->update(['is_first_time' => false]);
            }
        });
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

