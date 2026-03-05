<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (! Schema::hasColumn('events', 'login_requires_birthdate')) {
                $table->boolean('login_requires_birthdate')->default(false)->after('is_ongoing');
            }
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (Schema::hasColumn('events', 'login_requires_birthdate')) {
                $table->dropColumn('login_requires_birthdate');
            }
        });
    }
};
