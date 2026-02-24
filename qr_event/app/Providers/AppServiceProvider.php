<?php

namespace App\Providers;

use App\Models\ActivityLog;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureUrlGeneration();
        $this->configureActivityLogging();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }

    /**
     * Force HTTPS for URLs when APP_URL uses HTTPS (e.g., ngrok).
     */
    protected function configureUrlGeneration(): void
    {
        $appUrl = config('app.url');
        if (str_starts_with($appUrl, 'https://')) {
            URL::forceScheme('https');
        }
    }

    /**
     * Configure global activity logging listeners.
     */
    protected function configureActivityLogging(): void
    {
        Event::listen(Login::class, function (Login $event): void {
            $user = $event->user;
            $userId = data_get($user, 'id');
            $firstName = (string) data_get($user, 'first_name', '');
            $lastName = (string) data_get($user, 'last_name', '');
            $fullName = trim($firstName.' '.$lastName);

            ActivityLog::create([
                'user_id' => $userId,
                'action' => 'user_login',
                'target_type' => 'User',
                'target_id' => $userId,
                'description' => sprintf('User logged in: %s', $fullName !== '' ? $fullName : 'Unknown user'),
            ]);
        });
    }
}
