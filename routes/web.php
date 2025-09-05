<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\HomepageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\DioramaController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CheckoutController;

// Localization
Route::get('/locale/{lang}', function ($lang) {
    session(['locale' => $lang]);
    return back();
})->name('locale.switch');

// Homepage Routes
Route::get('/', [HomepageController::class, 'index'])->name('homepage');

Route::middleware(['auth', 'verified', 'role:visitor'])->group(function () {
    Route::get('/ticket/checkout/{ticket_id}', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/ticket/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('/transactions', [CheckoutController::class, 'history'])->name('checkout.history');
});

// Admin Routes
Route::middleware(['auth', 'verified', 'role:admin'])
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.admin');

        Route::group(['prefix' => 'ticket'], function () {
            Route::get('/', [TicketController::class, 'index'])->name('dashboard.ticket');
            Route::post('/create', [TicketController::class, 'store'])->name('ticket.store');
            Route::patch('/update/{id}', [TicketController::class, 'update'])->name('ticket.update');
            Route::delete('/delete/{id}', [TicketController::class, 'destroy'])->name('ticket.destroy');
        });

        Route::group(['prefix' => 'diorama'], function () {
            Route::get('/', [DioramaController::class, 'index'])->name('dashboard.diorama');
            Route::post('/create', [DioramaController::class, 'store'])->name('diorama.store');
            Route::patch('/update/{id}', [DioramaController::class, 'update'])->name('diorama.update');
            Route::delete('/delete/{id}', [DioramaController::class, 'destroy'])->name('diorama.destroy');
        });

        Route::group(['prefix' => 'merchandise'], function () {
            Route::get('/', [ProductController::class, 'index'])->name('dashboard.merchandise');
            Route::post('/create', [ProductController::class, 'store'])->name('merchandise.store');
            Route::patch('/update/{id}', [ProductController::class, 'update'])->name('merchandise.update');
            Route::delete('/images/{id}', [ProductController::class, 'destroyImage'])->name('merchandise.images.destroy');
            Route::delete('/delete/{id}', [ProductController::class, 'destroy'])->name('merchandise.destroy');
        });

        Route::group(['prefix' => 'transaction'], function () {
            Route::get('/', [TransactionController::class, 'index'])->name('dashboard.transaction');
        });

        Route::group(['prefix' => 'user'], function () {
            Route::get('/', [UserController::class, 'index'])->name('dashboard.user');
            Route::delete('/delete/{id}', [UserController::class, 'destroy'])->name('user.destroy');
        });
    });

// Profile Routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
