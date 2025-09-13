<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CheckoutController;

Route::post('/midtrans/notification', [CheckoutController::class, 'handleNotification'])->name('midtrans.notification');

Route::get('/cert/qz-tray.crt', function () {
    return response()->file(storage_path('app/qz/qz-tray.crt'));
});

Route::post('/sign', function (Request $request) {
    $dataToSign = $request->getContent();

    $privateKey = openssl_pkey_get_private(file_get_contents(storage_path('app/qz/qz-tray-private.pem')));
    openssl_sign($dataToSign, $signature, $privateKey, OPENSSL_ALGO_SHA256);

    return base64_encode($signature);
});
