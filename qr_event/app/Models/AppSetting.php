<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class AppSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    public static function getBoolean(string $key, bool $default = false): bool
    {
        if (! Schema::hasTable('app_settings')) {
            return $default;
        }
        $value = static::query()->where('key', $key)->value('value');
        if ($value === null) {
            return $default;
        }
        return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? $default;
    }

    public static function setBoolean(string $key, bool $value): void
    {
        if (! Schema::hasTable('app_settings')) {
            return;
        }
        static::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $value ? '1' : '0']
        );
    }

    public static function getString(string $key, string $default = null): ?string
    {
        if (! Schema::hasTable('app_settings')) {
            return $default;
        }
        $value = static::query()->where('key', $key)->value('value');
        return $value !== null ? $value : $default;
    }

    public static function setString(string $key, string $value): void
    {
        if (! Schema::hasTable('app_settings')) {
            return;
        }
        static::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }
}
