<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendees', function (Blueprint $table) {
            if (!Schema::hasColumn('attendees', 'payment_type')) {
                $table->string('payment_type')->nullable()->after('amount_paid');
            }
            if (!Schema::hasColumn('attendees', 'payment_remarks')) {
                $table->string('payment_remarks')->nullable()->after('payment_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('attendees', function (Blueprint $table) {
            if (Schema::hasColumn('attendees', 'payment_type')) {
                $table->dropColumn('payment_type');
            }
            if (Schema::hasColumn('attendees', 'payment_remarks')) {
                $table->dropColumn('payment_remarks');
            }
        });
    }
};
