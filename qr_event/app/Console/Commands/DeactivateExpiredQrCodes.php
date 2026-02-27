<?php

namespace App\Console\Commands;

use App\Models\QrCode;
use Illuminate\Console\Command;

class DeactivateExpiredQrCodes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'qr:deactivate-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically deactivate QR codes that have reached their expiration time.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = QrCode::where('is_active', true)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->update(['is_active' => false]);

        if ($count > 0) {
            $this->info("Successfully deactivated {$count} expired QR code(s).");
        }
    }
}
