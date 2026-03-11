<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Http\Responses\CustomLoginResponse;
use App\Models\QrCode;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind custom login response to Fortify's contract
        $this->app->bind(LoginResponse::class, CustomLoginResponse::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::authenticateUsing(function (Request $request) {
            $isAdminLogin = $request->boolean('admin_login');
            $redirectUrl = (string) $request->input('redirect_url', '');
            $redirectPath = parse_url($redirectUrl, PHP_URL_PATH) ?: $redirectUrl;
            $loginWithBirthdate = false;

            if (! $isAdminLogin && Str::startsWith($redirectPath, '/qr/')) {
                $afterPrefix = Str::after($redirectPath, '/qr/');
                $token = trim(explode('/', $afterPrefix)[0] ?? '');

                if ($token !== '') {
                    $qrCode = QrCode::query()->with('event:id,login_requires_birthdate')->where('token', $token)->first();
                    $loginWithBirthdate = (bool) ($qrCode?->event?->login_requires_birthdate ?? false);
                }
            }
            $rawContact = trim($request->string('contact_number')->toString());
            $digitsOnly = preg_replace('/\D+/', '', $rawContact) ?? '';

            $contactCandidates = collect([
                $rawContact,
                $digitsOnly,
                str_starts_with($digitsOnly, '63') && strlen($digitsOnly) === 12
                    ? '0'.substr($digitsOnly, 2)
                    : null,
                str_starts_with($digitsOnly, '0') && strlen($digitsOnly) === 11
                    ? '63'.substr($digitsOnly, 1)
                    : null,
            ])->filter()->unique()->values();

            $request->validate([
                'contact_number' => ['required', 'string'],
                'password' => $isAdminLogin
                    ? ['required', 'string']
                    : ($loginWithBirthdate ? ['required', 'date_format:Y-m-d'] : ['nullable', 'string']),
            ]);

            $user = User::query()
                ->whereIn('contact_number', $contactCandidates->all())
                ->first();

            if (! $user) {
                return null;
            }

            if ($isAdminLogin && ! $user->isAdmin()) {
                return null;
            }

            if (! $isAdminLogin && $user->isAdmin()) {
                return null;
            }

            if ($isAdminLogin) {
                return Hash::check($request->string('password')->toString(), $user->password)
                    ? $user
                    : null;
            }

            if (! $loginWithBirthdate) {
                return $user;
            }

            if (! $user->birthdate) {
                return null;
            }

            return $user->birthdate->format('Y-m-d') === $request->string('password')->toString()
                ? $user
                : null;
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
            'loginRequiresBirthdate' => false,
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => (string) $request->input('email', ''),
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn () => Inertia::render('auth/register'));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }
}
