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

        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->enum('type', ['ticket', 'merchandise']);
            $table->enum('channel', ['online', 'offline']);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->string('payment_method')->nullable();
            $table->enum('status', ['pending', 'paid', 'canceled'])->default('pending');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('transaction_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('transaction_id');
            $table->enum('item_type', ['ticket', 'product']);
            $table->uuid('item_id');
            $table->integer('quantity')->default(1);
            $table->decimal('price', 12, 2);

            $table->foreign('transaction_id')->references('id')->on('transactions')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
        Schema::dropIfExists('transactions');
    }
};
