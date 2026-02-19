<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('is_dg_leader', 'has_dg_leader');
            $table->string('dg_leader_name')->nullable()->after('has_dg_leader');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('dg_leader_name');
            $table->renameColumn('has_dg_leader', 'is_dg_leader');
        });
    }
};
