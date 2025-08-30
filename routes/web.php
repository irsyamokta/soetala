<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
    ->prefix('/dashboard')
    ->group(function () {
        Route::get('/', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('dashboard.admin');
    });

// Profile Routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
