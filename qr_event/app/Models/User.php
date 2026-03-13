<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'password',
        'contact_number',
        'birthdate',
        'gender',
        'marital_status',
        'has_dg_leader',
        'dg_leader_name',
        'want_to_join_dg',
        'remarks',
        'is_first_time',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birthdate' => 'date',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_first_time' => 'boolean',
        ];
    }

    /**
     * Check if the user is an admin.
     */
    public function getIsAdminAttribute(): bool
    {
        return $this->isAdmin();
    }

    protected $appends = ['is_admin', 'age'];

    /**
     * Get user's age calculated from birthdate.
     */
    public function getAgeAttribute(): ?int
    {
        return $this->birthdate ? $this->birthdate->diffInYears(now()) : null;
    }

    /**
     * Events the user has joined.
     */
    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class)->withTimestamps();
    }

    /**
     * Attendance records for events.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendee::class);
    }

    /**
     * Activity logs created by the user.
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Roles assigned to the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    /**
     * Check if the user has a role.
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('name', $roleName)->exists();
    }

    /**
     * Check if user is any type of admin (includes all admin roles).
     * This includes: super-admin, admin-payment, user-admin, and legacy admin role.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin')
            || $this->hasRole('super-admin')
            || $this->hasRole('admin-payment')
            || $this->hasRole('user-admin');
    }

    /**
     * Check if user is a super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super-admin');
    }

    /**
     * Check if user can manage payments.
     */
    public function canManagePayments(): bool
    {
        return $this->isSuperAdmin() || $this->hasRole('admin-payment');
    }

    /**
     * Check if user can mark attendance.
     */
    public function canMarkAttendance(): bool
    {
        return $this->isSuperAdmin() || $this->hasRole('admin-payment') || $this->hasRole('user-admin');
    }

    /**
     * Check if user can delete attendees and perform full attendee management.
     */
    public function canManageAttendees(): bool
    {
        return $this->isSuperAdmin();
    }

    /**
     * Future: event organizer role.
     */
    public function canHostEvents(): bool
    {
        return $this->hasRole('admin') || $this->hasRole('event-organizer');
    }
}
