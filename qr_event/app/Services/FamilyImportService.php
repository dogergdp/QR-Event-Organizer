<?php

namespace App\Services;

use App\Models\Attendee;
use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class FamilyImportService
{
    /**
     * Import families from array of member data.
     * Groups by surname + contact_number, identifies family head (oldest male).
     *
     * @param  array  $rows  Array of members with: surname, first_name, age, gender, contact_number
     * @return int Number of families created
     */
    public function importFromArray(array $rows, Event $event): int
    {
        // Group by surname + contact_number to identify families
        $families = collect($rows)->groupBy(function ($row) {
            return $row['surname'].'|'.$row['contact_number'];
        });

        $count = 0;
        foreach ($families as $members) {
            $this->createFamily(collect($members), $event);
            $count++;
        }

        return $count;
    }

    /**
     * Create a family with head and plus_ones.
     */
    private function createFamily(Collection $members, Event $event): void
    {
        // Find head: oldest male, then oldest female
        $head = $members
            ->where('gender', 'M')
            ->sortByDesc('age')
            ->first()
            ?? $members->sortByDesc('age')->first();

        if (! $head) {
            return;
        }

        // Calculate birthdate from age
        $birthdate = $this->calculateBirthdateFromAge((int) $head['age']);

        // Create or find user for family head (don't update existing users)
        $user = User::firstOrCreate(
            ['contact_number' => $head['contact_number']],
            [
                'first_name' => $head['first_name'],
                'last_name' => $head['surname'],
                'birthdate' => $birthdate,
                'password' => Hash::make('password'),
            ]
        );

        // Create attendee for head (create new, don't update existing)
        $attendee = Attendee::firstOrCreate(
            [
                'user_id' => $user->id,
                'event_id' => $event->id,
            ],
            [
                'family_contact_number' => $head['contact_number'],
                'assigned_values' => ['family_color' => null],
            ]
        );

        // Build plus_ones from other family members
        // Exclude the head by comparing first_name, surname, and age
        $plusOnes = $members
            ->reject(function ($member) use ($head) {
                return $member['first_name'] === $head['first_name']
                    && $member['surname'] === $head['surname']
                    && (int) $member['age'] === (int) $head['age'];
            })
            ->map(function ($member) {
                return [
                    'id' => (string) Str::uuid(),
                    'full_name' => $member['first_name'].' '.$member['surname'],
                    'age' => (int) $member['age'],
                    'gender' => $member['gender'],
                    'is_first_time' => false,
                    'is_attended' => false,
                ];
            })
            ->values()
            ->toArray();

        // Update attendee with plus_ones
        $attendee->update(['plus_ones' => $plusOnes]);
    }

    /**
     * Calculate a birthdate from age.
     * Returns a date that would result in the specified age.
     */
    private function calculateBirthdateFromAge(int $age): string
    {
        $today = today();

        return $today->subYears($age)->format('Y-m-d');
    }
}
