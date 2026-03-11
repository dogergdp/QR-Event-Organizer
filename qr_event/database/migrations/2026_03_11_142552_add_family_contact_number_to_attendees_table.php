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
        Schema::table('attendees', function (Blueprint $table) {
            $table->string('family_contact_number')->nullable()->comment('Contact number of family head - groups family members');
            $table->index(['family_contact_number', 'event_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendees', function (Blueprint $table) {
            $table->dropIndex(['family_contact_number', 'event_id']);
            $table->dropColumn('family_contact_number');
        });
    }
};
