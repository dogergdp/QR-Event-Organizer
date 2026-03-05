<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendees', function (Blueprint $table) {
            if (! Schema::hasColumn('attendees', 'is_walk_in')) {
                $table->boolean('is_walk_in')->default(false)->after('is_paid');
            }

            if (! Schema::hasColumn('attendees', 'amount_paid')) {
                $table->decimal('amount_paid', 10, 2)->nullable()->after('is_walk_in');
            }
        });
    }

    public function down(): void
    {
        Schema::table('attendees', function (Blueprint $table) {
            if (Schema::hasColumn('attendees', 'amount_paid')) {
                $table->dropColumn('amount_paid');
            }

            if (Schema::hasColumn('attendees', 'is_walk_in')) {
                $table->dropColumn('is_walk_in');
            }
        });
    }
};
