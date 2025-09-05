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
            $table->string('thumbnail');
            $table->string('title');
            $table->string('public_id');
            $table->text('description');
            $table->string('location');
            $table->date('start_date');
            $table->date('end_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('visibility')->default(true);
            $table->timestamps();
        });

        Schema::create('ticket_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('ticket_id');
            $table->string('category_name');
            $table->text('description');
            $table->decimal('price', 12, 2)->default(0);
            $table->timestamps();

            $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
        });

        Schema::create('ticket_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('transaction_id');
            $table->uuid('ticket_id');
            $table->uuid('ticket_category_id');
            $table->string('buyer_name');
            $table->string('phone')->nullable();
            $table->decimal('price', 12, 2);
            $table->string('qr_code')->nullable();
            $table->timestamps();

            $table->foreign('transaction_id')->references('id')->on('transactions')->onDelete('cascade');
            $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
            $table->foreign('ticket_category_id')->references('id')->on('ticket_categories')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_orders');
        Schema::dropIfExists('ticket_categories');
        Schema::dropIfExists('tickets');
    }
};
