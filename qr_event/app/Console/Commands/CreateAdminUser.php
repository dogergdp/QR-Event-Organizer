<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-admin-user 
                            {--role=super-admin : The role to assign (super-admin, admin-payment, user-admin)}
                            {--contact= : Contact number for the new user}
                            {--first-name= : First name}
                            {--last-name= : Last name}
                            {--password= : Password (will be prompted if not provided)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create an admin user with specified role. Roles: super-admin (full control), admin-payment (manage payments), user-admin (mark attendance only)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $role = $this->option('role');

        // Validate role
        if (! in_array($role, ['super-admin', 'admin-payment', 'user-admin'])) {
            $this->error('Invalid role. Must be: super-admin, admin-payment, or user-admin');

            return 1;
        }

        // Get or prompt for user details
        $contact = $this->option('contact') ?? $this->ask('Contact number');
        $firstName = $this->option('first-name') ?? $this->ask('First name');
        $lastName = $this->option('last-name') ?? $this->ask('Last name');
        $password = $this->option('password') ?? $this->secret('Password');

        if (! $contact || ! $firstName || ! $lastName || ! $password) {
            $this->error('All fields are required');

            return 1;
        }

        // Check if user already exists
        if (User::where('contact_number', $contact)->exists()) {
            $this->warn("User with contact number {$contact} already exists");

            if (! $this->confirm('Update existing user?')) {
                return 0;
            }

            $user = User::where('contact_number', $contact)->first();
            $user->update([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'password' => Hash::make($password),
            ]);
            $this->info("Updated user: {$firstName} {$lastName}");
        } else {
            $user = User::create([
                'contact_number' => $contact,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'password' => Hash::make($password),
            ]);
            $this->info("Created user: {$firstName} {$lastName}");
        }

        // Assign role
        $roleModel = Role::firstOrCreate(['name' => $role]);
        $user->roles()->syncWithoutDetaching([$roleModel->id]);

        // Display role description
        $descriptions = [
            'super-admin' => 'Full system control (your account)',
            'admin-payment' => 'Can manage payments and full attendee operations',
            'user-admin' => 'Can only mark users as attended',
        ];

        $this->info("\n✓ User assigned to role: {$role}");
        $this->info("  Permissions: {$descriptions[$role]}");
        $this->info("\nAdmins with this account:");
        $this->info("  • Login as: {$contact}");
        $this->info("  • Name: {$firstName} {$lastName}");

        return 0;
    }
}
