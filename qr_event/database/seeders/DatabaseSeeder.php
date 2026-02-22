<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Role;
use App\Models\User;
use App\Models\QrCode;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'event-organizer']);

        $adminUser = User::firstOrCreate(
            ['contact_number' => '09123456789'],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'password' => Hash::make('password'),
            ]
        );

        $adminUser->roles()->syncWithoutDetaching([$adminRole->id]);

        // Create test events
        $events = [
            [
                'name' => 'Tech Conference 2026',
                'description' => 'Annual technology conference featuring keynote speakers and workshops',
                'date' => now()->addDays(15)->toDateString(),
                'start_time' => '09:00',
                'end_time' => '17:00',
                'location' => 'Convention Center, Downtown',
            ],
            [
                'name' => 'Summer Networking Event',
                'description' => 'Casual networking dinner for professionals in the tech industry',
                'date' => now()->addDays(30)->toDateString(),
                'start_time' => '18:00',
                'end_time' => '21:00',
                'location' => 'Grand Hotel Ballroom',
            ],
            [
                'name' => 'Product Launch Event',
                'description' => 'Exclusive launch event for our new product line',
                'date' => now()->addDays(45)->toDateString(),
                'start_time' => '10:00',
                'end_time' => '16:00',
                'location' => 'Innovation Hub, Tech Park',
            ],
            [
                'name' => 'Business Seminar',
                'description' => 'Professional development seminar on business growth strategies',
                'date' => now()->subDays(5)->toDateString(),
                'start_time' => '14:00',
                'end_time' => '18:00',
                'location' => 'Conference Room A, Office Building',
            ],
        ];

        foreach ($events as $eventData) {
            $event = Event::firstOrCreate(
                ['name' => $eventData['name']],
                $eventData
            );

            // Create QR codes for each event
            $qrCodes = [
                [
                    'name' => 'Pre-Registration QR',
                    'type' => 'static',
                    'purpose' => 'pre-registration',
                    'is_dynamic' => false,
                    'is_active' => true,
                ],
                [
                    'name' => 'Attendance Check-in',
                    'type' => 'static',
                    'purpose' => 'attendance',
                    'is_dynamic' => false,
                    'is_active' => true,
                ],
                [
                    'name' => 'VIP Entry Dynamic',
                    'type' => 'static',
                    'purpose' => 'attendance',
                    'is_dynamic' => true,
                    'is_active' => true,
                ],
            ];

            foreach ($qrCodes as $qrData) {
                $token = Str::random(32);
                QrCode::firstOrCreate(
                    [
                        'event_id' => $event->id,
                        'name' => $qrData['name'],
                    ],
                    array_merge($qrData, [
                        'token' => $token,
                        'code' => '/qr/' . $token, // The QR code links to this endpoint
                    ])
                );
            }
        }
    }
}
