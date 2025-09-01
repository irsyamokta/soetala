<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\DioramaController;
use App\Http\Controllers\ProductController;

// Localization
Route::get('/locale/{lang}', function ($lang) {
    session(['locale' => $lang]);
    return back();
})->name('locale.switch');

// Homepage Routes
Route::get('/', function () {
    $user = Auth::user();

    if ($user && $user->hasRole('admin')) {
        return redirect()->route('dashboard.admin');
    }

    if ($user && !$user->hasVerifiedEmail()) {
        return redirect()->route('verification.notice');
    }

    return Inertia::render('Homepage', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('homepage');

// Admin Routes
Route::middleware(['auth', 'verified', 'role:admin'])
    ->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('dashboard.admin');

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
    });

// Profile Routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
