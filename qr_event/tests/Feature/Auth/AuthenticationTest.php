<?php

use App\Models\Role;
use App\Models\User;
use Laravel\Fortify\Features;

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create([
        'contact_number' => '09123456789',
        'birthdate' => '1990-01-01',
    ]);

    $response = $this->post(route('login.store'), [
        'contact_number' => $user->contact_number,
        'password' => '1990-01-01',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users with two factor enabled are redirected to two factor challenge', function () {
    if (! Features::canManageTwoFactorAuthentication()) {
        $this->markTestSkipped('Two-factor authentication is not enabled.');
    }

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->create([
        'contact_number' => '09123456780',
        'birthdate' => '1990-01-01',
    ]);

    $user->forceFill([
        'two_factor_secret' => encrypt('test-secret'),
        'two_factor_recovery_codes' => encrypt(json_encode(['code1', 'code2'])),
        'two_factor_confirmed_at' => now(),
    ])->save();

    $response = $this->post(route('login'), [
        'contact_number' => $user->contact_number,
        'password' => '1990-01-01',
    ]);

    $response->assertRedirect(route('two-factor.login'));
    $response->assertSessionHas('login.id', $user->id);
    $this->assertGuest();
});

test('users can not authenticate with invalid birthdate', function () {
    $user = User::factory()->create([
        'contact_number' => '09123456781',
        'birthdate' => '1990-01-01',
    ]);

    $this->post(route('login.store'), [
        'contact_number' => $user->contact_number,
        'password' => '1991-01-01',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $this->assertGuest();
    $response->assertRedirect(route('home'));
});

test('users are rate limited', function () {
    $user = User::factory()->create([
        'contact_number' => '09123456782',
        'birthdate' => '1990-01-01',
    ]);

    foreach (range(1, 5) as $attempt) {
        $this->post(route('login.store'), [
            'contact_number' => $user->contact_number,
            'password' => '1991-01-01',
        ]);
    }

    $response = $this->post(route('login.store'), [
        'contact_number' => $user->contact_number,
        'password' => '1991-01-01',
    ]);

    $response->assertTooManyRequests();
});

test('admin login screen can be rendered', function () {
    $response = $this->get(route('admin.login'));

    $response->assertOk();
});

test('admins can not authenticate using user login screen', function () {
    $user = User::factory()->create([
        'contact_number' => '09123456783',
        'birthdate' => '1990-01-01',
    ]);
    $adminRole = Role::query()->firstOrCreate(['name' => 'admin']);
    $user->roles()->syncWithoutDetaching([$adminRole->id]);

    $response = $this->post(route('login.store'), [
        'contact_number' => $user->contact_number,
        'password' => '1990-01-01',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('contact_number');
});

test('admins can authenticate using admin login screen', function () {
    $user = User::factory()->create([
        'contact_number' => '09123456784',
        'birthdate' => '1990-01-01',
    ]);
    $adminRole = Role::query()->firstOrCreate(['name' => 'admin']);
    $user->roles()->syncWithoutDetaching([$adminRole->id]);

    $response = $this->post(route('login.store'), [
        'contact_number' => $user->contact_number,
        'password' => 'password',
        'admin_login' => '1',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});
