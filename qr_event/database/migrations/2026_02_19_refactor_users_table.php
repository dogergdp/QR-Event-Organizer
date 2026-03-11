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
            // Drop email columns
            $table->dropUnique(['email']);
            $table->dropColumn(['email', 'email_verified_at']);

            // Change name to first_name and last_name
            $table->dropColumn('name');
            $table->string('first_name')->after('id');
            $table->string('last_name')->after('first_name');

            // Add new fields
            $table->string('contact_number')->after('last_name');
            $table->date('birthdate')->nullable()->after('contact_number');
            $table->enum('marital_status', ['single', 'married', 'separated', 'widowed'])->nullable()->after('birthdate');
            $table->enum('is_dg_leader', ['yes', 'no'])->nullable()->after('marital_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name', 'contact_number', 'birthdate', 'marital_status', 'is_dg_leader']);
            $table->string('name')->after('id');
            $table->string('email')->unique()->after('name');
            $table->timestamp('email_verified_at')->nullable()->after('email');
        });
    }
};
