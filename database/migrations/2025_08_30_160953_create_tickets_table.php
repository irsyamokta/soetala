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
        Schema::create('tickets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('thumbnail')->nullable();
            $table->string('public_id')->nullable();
            $table->string('category');
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->decimal('online_price', 12, 2)->default(0);
            $table->decimal('offline_price', 12, 2)->default(0);
            $table->json('requirement')->nullable();
            $table->boolean('visibility')->default(true);
            $table->timestamps();
        });

        Schema::create('ticket_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('transaction_id');
            $table->uuid('ticket_id');
            $table->string('buyer_name');
            $table->string('phone')->nullable();
            $table->enum('ticket_type', ['adult', 'child']);
            $table->decimal('price', 12, 2);
            $table->string('qr_code')->nullable();
            $table->timestamps();

            $table->foreign('transaction_id')->references('id')->on('transactions')->onDelete('cascade');
            $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_orders');
        Schema::dropIfExists('tickets');
    }
};
