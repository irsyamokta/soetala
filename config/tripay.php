<?php

return [
    'api_key'       => env('TRIPAY_API_KEY'),
    'private_key'   => env('TRIPAY_PRIVATE_KEY'),
    'merchant_code' => env('TRIPAY_MERCHANT_CODE'),
    'callback_url'  => env('TRIPAY_CALLBACK_URL'),
    'return_url'    => env('TRIPAY_RETURN_URL'),
];
