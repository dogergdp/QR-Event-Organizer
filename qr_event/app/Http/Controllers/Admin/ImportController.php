<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ImportController extends Controller
{
    /**
     * Import users from CSV.
     */
    public function importUsers(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        $handle = fopen($path, 'r');

        // Read header
        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            return back()->with('error', 'The CSV file is empty.');
        }

        // Expected headers (case-insensitive check)
        // Expected columns: First Name, Last Name, Contact Number, Birthdate, Marital Status, Has DG Leader, DG Leader Name, Remarks

        $rowCount = 0;
        $importedCount = 0;
        $errors = [];

        while (($row = fgetcsv($handle)) !== false) {
            $rowCount++;

            // Map row to associative array
            // We assume a specific order or we can try to find headers
            // Let's assume the order from export or a standard order:
            // 0: First Name, 1: Last Name, 2: Contact Number, 3: Birthdate, 4: Marital Status, 5: Has DG Leader, 6: DG Leader Name, 7: Remarks

            if (count($row) < 3) {
                $errors[] = "Row {$rowCount}: Insufficient data.";
                continue;
            }

            $data = [
                'first_name' => trim($row[0] ?? ''),
                'last_name' => trim($row[1] ?? ''),
                'contact_number' => $this->normalizeContactNumber($row[2] ?? ''),
                'birthdate' => trim($row[3] ?? ''),
                'marital_status' => strtolower(trim($row[4] ?? 'single')),
                'has_dg_leader' => strtolower(trim($row[5] ?? 'no')),
                'dg_leader_name' => trim($row[6] ?? ''),
                'remarks' => trim($row[7] ?? ''),
                'password' => 'password', // Default password
                'password_confirmation' => 'password',
            ];

            // Normalize values
            $data['has_dg_leader'] = in_array($data['has_dg_leader'], ['yes', 'y', '1', 'true']) ? 'yes' : 'no';

            // Validation
            $validator = Validator::make($data, [
                'first_name' => ['required', 'string', 'max:255'],
                'last_name' => ['required', 'string', 'max:255'],
                'contact_number' => ['required', 'string', 'max:20', Rule::unique('users', 'contact_number')],
                'birthdate' => ['required', 'date', 'before_or_equal:today'],
                'marital_status' => ['required', Rule::in(['single', 'married', 'separated', 'widowed'])],
                'has_dg_leader' => ['required', Rule::in(['yes', 'no'])],
                'dg_leader_name' => ['nullable', 'string', 'max:255', Rule::requiredIf($data['has_dg_leader'] === 'yes')],
            ]);

            if ($validator->fails()) {
                $errors[] = "Row {$rowCount} ({$data['first_name']} {$data['last_name']}): " . implode(', ', $validator->errors()->all());
                continue;
            }

            // Create user
            $user = User::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'contact_number' => $data['contact_number'],
                'birthdate' => $data['birthdate'],
                'marital_status' => $data['marital_status'],
                'has_dg_leader' => $data['has_dg_leader'],
                'dg_leader_name' => $data['has_dg_leader'] === 'yes' ? $data['dg_leader_name'] : null,
                'remarks' => $data['remarks'],
                'password' => Hash::make($data['password']),
            ]);

            ActivityLog::create([
                'user_id' => $request->user()?->id,
                'action' => 'import_user',
                'target_type' => 'User',
                'target_id' => $user->id,
                'description' => sprintf('Imported user: %s %s', $user->first_name, $user->last_name),
            ]);

            $importedCount++;
        }

        fclose($handle);

        $message = "Successfully imported {$importedCount} users.";
        if (count($errors) > 0) {
            $message .= " Encounted " . count($errors) . " errors.";
            return redirect()->route('admin.users')->with([
                'success' => $message,
                'import_errors' => $errors,
            ]);
        }

        return redirect()->route('admin.users')->with('success', $message);
    }

    /**
     * Normalize contact number for validation and storage.
     */
    private function normalizeContactNumber($number)
    {
        $number = trim((string)$number);
        // Remove non-numeric characters except maybe a leading +
        $number = preg_replace('/[^0-9]/', '', $number);

        // If it starts with 63 (PH country code), keep it or normalize to 09
        // Many local systems prefer 09XXXXXXXXX
        if (str_starts_with($number, '639') && strlen($number) === 12) {
            $number = '0' . substr($number, 2);
        }

        return $number;
    }
}
