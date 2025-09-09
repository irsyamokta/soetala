<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CheckoutController;

Route::post('/midtrans/notification', [CheckoutController::class, 'handleNotification'])->name('midtrans.notification');

