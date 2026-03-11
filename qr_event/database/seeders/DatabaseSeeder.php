<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create roles with hierarchy
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin']);
        $adminPaymentRole = Role::firstOrCreate(['name' => 'admin-payment']);
        $userAdminRole = Role::firstOrCreate(['name' => 'user-admin']);

        // Keep the legacy 'admin' role for backward compatibility (maps to super-admin)
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        // Super Admin (You) - Full system control
        $superAdmin = User::firstOrCreate(
            ['contact_number' => '09123456789'],
            [
                'first_name' => 'Admin',
                'last_name' => 'Coordinator',
                'password' => Hash::make('P@ssw0rd'),
            ]
        );
        $superAdmin->roles()->syncWithoutDetaching([$superAdminRole->id, $adminRole->id]);

        // Payment Admin (1 person) - Can manage payments and full attendee operations
        $paymentAdmin = User::firstOrCreate(
            ['contact_number' => '09987654321'],
            [
                'first_name' => 'Payment',
                'last_name' => 'Manager',
                'password' => Hash::make('P@ssw0rd'),
            ]
        );
        $paymentAdmin->roles()->syncWithoutDetaching([$adminPaymentRole->id]);

        // User Admins (4 people) - Can only mark attendance
        $userAdminNames = [
            ['first' => 'John', 'last' => 'Smith', 'contact' => '09111111111'],
            ['first' => 'Jane', 'last' => 'Doe', 'contact' => '09222222222'],
            ['first' => 'Michael', 'last' => 'Johnson', 'contact' => '09333333333'],
            ['first' => 'Sarah', 'last' => 'Williams', 'contact' => '09444444444'],
        ];

        foreach ($userAdminNames as $name) {
            $userAdmin = User::firstOrCreate(
                ['contact_number' => $name['contact']],
                [
                    'first_name' => $name['first'],
                    'last_name' => $name['last'],
                    'password' => Hash::make('P@ssw0rd'),
                ]
            );
            $userAdmin->roles()->syncWithoutDetaching([$userAdminRole->id]);
        }
    }
}
