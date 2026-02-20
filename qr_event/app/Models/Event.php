<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $date
 * @property string|null $start_time
 * @property string|null $end_time
 * @property string $description
 * @property string $location
 * @property string|null $banner_image
 * @property bool $is_finished
 * @property bool $is_ongoing
 */
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
        'is_ongoing',
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

    /**
     * QR codes for this event.
     */
    public function qrCodes(): HasMany
    {
        return $this->hasMany(QrCode::class);
    }
}
