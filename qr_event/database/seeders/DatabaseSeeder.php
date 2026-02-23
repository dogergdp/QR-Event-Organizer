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
                'last_name' => 'Coordinator',
                'password' => Hash::make('password'),
            ]
        );

        $adminUser->roles()->syncWithoutDetaching([$adminRole->id]);

        // Create church events
        $events = [
            [
                'name' => 'Sunday Worship Service',
                'description' => 'Main worship service with praise, message, and prayer.',
                'date' => now()->addDays(3)->toDateString(),
                'start_time' => '09:00',
                'end_time' => '11:00',
                'location' => 'Main Sanctuary',
            ],
            [
                'name' => 'Youth Fellowship Night',
                'description' => 'Games, worship, and small group sharing for the youth ministry.',
                'date' => now()->addDays(7)->toDateString(),
                'start_time' => '18:30',
                'end_time' => '20:30',
                'location' => 'Youth Hall',
            ],
            [
                'name' => 'Prayer and Fasting Gathering',
                'description' => 'Corporate prayer meeting and encouragement.',
                'date' => now()->addDays(12)->toDateString(),
                'start_time' => '19:00',
                'end_time' => '20:30',
                'location' => 'Prayer Room',
            ],
            [
                'name' => 'Community Outreach Day',
                'description' => 'Serving the community through outreach and volunteer work.',
                'date' => now()->addDays(20)->toDateString(),
                'start_time' => '08:00',
                'end_time' => '12:00',
                'location' => 'Church Courtyard',
            ],
        ];

        foreach ($events as $eventData) {
            $event = Event::firstOrCreate(
                ['name' => $eventData['name']],
                $eventData
            );

            // Auto-generate QR codes for each event
            $preRegExpiresAt = \Carbon\Carbon::parse($eventData['date'] . ' ' . $eventData['start_time']);
            $attendanceExpiresAt = \Carbon\Carbon::parse($eventData['date'] . ' ' . $eventData['end_time']);
            
            // Pre-registration QR Code
            $preRegToken = Str::random(32);
            QrCode::firstOrCreate(
                [
                    'event_id' => $event->id,
                    'purpose' => 'pre-registration',
                ],
                [
                    'name' => 'Pre-Registration',
                    'token' => $preRegToken,
                    'code' => '/qr/' . $preRegToken,
                    'is_active' => true,
                    'expires_at' => $preRegExpiresAt,
                ]
            );

            // Attendance Check-in QR Code
            $attendanceToken = Str::random(32);
            QrCode::firstOrCreate(
                [
                    'event_id' => $event->id,
                    'purpose' => 'attendance',
                ],
                [
                    'name' => 'Attendance Check-in',
                    'token' => $attendanceToken,
                    'code' => '/qr/' . $attendanceToken,
                    'is_active' => true,
                    'expires_at' => $attendanceExpiresAt,
                ]
            );
        }
    }
}
