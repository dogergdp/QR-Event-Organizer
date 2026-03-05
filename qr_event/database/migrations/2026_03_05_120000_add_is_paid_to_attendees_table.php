<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendees', function (Blueprint $table) {
            if (! Schema::hasColumn('attendees', 'is_paid')) {
                $table->boolean('is_paid')->default(false)->after('is_first_time');
            }
        });
    }

    public function down(): void
    {
        Schema::table('attendees', function (Blueprint $table) {
            if (Schema::hasColumn('attendees', 'is_paid')) {
                $table->dropColumn('is_paid');
            }
        });
    }
};
