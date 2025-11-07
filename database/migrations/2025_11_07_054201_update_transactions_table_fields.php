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
        Schema::table('transactions', function (Blueprint $table) {
            $table->enum('status', ['pending', 'paid', 'canceled', 'expired', 'failed'])
                ->default('pending')
                ->change();

            if (Schema::hasColumn('transactions', 'snap_token')) {
                $table->dropColumn('snap_token');
            }
            if (Schema::hasColumn('transactions', 'snap_token_expired_at')) {
                $table->dropColumn('snap_token_expired_at');
            }

            $table->string('checkout_url')->nullable()->after('pickup_status');
            $table->string('reference')->nullable()->after('checkout_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['checkout_url', 'reference']);

            $table->string('snap_token')->nullable()->after('pickup_status');
            $table->timestamp('snap_token_expired_at')->nullable()->after('snap_token');

            $table->enum('status', ['pending', 'paid', 'canceled', 'expired'])
                ->default('pending')
                ->change();
        });
    }
};
