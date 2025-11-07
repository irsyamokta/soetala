<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomepageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\DioramaController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\UserTicketController;

// Localization
Route::get('/locale/{lang}', function ($lang) {
    session(['locale' => $lang]);
    return back();
})->name('locale.switch');

// Homepage Routes
Route::get('/', [HomepageController::class, 'index'])->name('homepage');
Route::get('/kebijakan-privasi', [HomepageController::class, 'privacy'])->name('privacy');
Route::get('/ketentuan-layanan', [HomepageController::class, 'terms'])->name('terms');

Route::middleware(['auth', 'verified', 'role:visitor'])->group(function () {
    Route::get('/tickets', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/ticket/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('/transactions', [CheckoutController::class, 'history'])->name('checkout.history');
    Route::get('/ticket/history', [UserTicketController::class, 'index'])->name('ticket.history');
    Route::get('/checkout/{transactionId}', [CheckoutController::class, 'checkout'])->name('checkout.pay.get');
    Route::post('/checkout/{transactionId}', [CheckoutController::class, 'checkout'])->name('checkout.pay');
    Route::post('/checkout/{transactionId}/cancel', [CheckoutController::class, 'cancel'])->name('checkout.cancel');
});

// Admin Routes
Route::middleware(['auth', 'verified', 'role:admin'])
    ->group(function () {

        Route::get('/visitors/export', [DashboardController::class, 'export'])->name('visitors.export');

        Route::group(['prefix' => 'ticket'], function () {
            Route::get('/', [TicketController::class, 'index'])->name('dashboard.ticket');
            Route::post('/create', [TicketController::class, 'store'])->name('ticket.store');
            Route::patch('/update/{id}', [TicketController::class, 'update'])->name('ticket.update');
            Route::delete('/delete/{id}', [TicketController::class, 'destroy'])->name('ticket.destroy');
        });

        Route::group(['prefix' => 'gallery'], function () {
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
            Route::delete('/variants/image/{id}', [ProductController::class, 'destroyVariantImage'])->name('merchandise.variants.image.destroy');
            Route::delete('/delete/{id}', [ProductController::class, 'destroy'])->name('merchandise.destroy');
        });

        Route::group(['prefix' => 'user'], function () {
            Route::get('/', [UserController::class, 'index'])->name('dashboard.user');
            Route::post('/create', [UserController::class, 'store'])->name('user.store');
            Route::put('/update/{id}', [UserController::class, 'update'])->name('user.update');
            Route::delete('/delete/{id}', [UserController::class, 'destroy'])->name('user.destroy');
        });
    });

// Admin & Volunteer Routes
Route::middleware(['auth', 'verified', 'role:admin|volunteer'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/checkin', [DashboardController::class, 'checkin'])->name('dashboard.checkin');
    Route::post('/transactions/{id}/pickup-status', [TransactionController::class, 'updatePickupStatus'])->name('transaction.updatePickupStatus');
});

Route::group(['prefix' => 'transaction'], function () {
    Route::get('/', [TransactionController::class, 'index'])->name('dashboard.transaction');
    Route::post('/create', [TransactionController::class, 'store'])->name('transaction.store');
})->middleware(['auth', 'verified', 'role:admin|volunteer']);

Route::delete('/transactions/{id}', [TransactionController::class, 'destroy'])->name('transaction.destroy')->middleware(['auth', 'verified', 'role:admin']);

// Profile Routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
