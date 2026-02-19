<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'date',
        'start_time',
        'end_time',
        'description',
        'location',
        'banner_image',
        'is_finished',
    ];

    /**
     * Users who joined the event.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    /**
     * Attendees of the event with tracking information.
     */
    public function attendees(): HasMany
    {
        return $this->hasMany(Attendee::class);
    }
}
