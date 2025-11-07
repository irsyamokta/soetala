<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class TripayService
{
    protected $apiKey;
    protected $privateKey;
    protected $merchantCode;
    protected $baseUrl;

    public function __construct()
    {
        $this->apiKey = env('TRIPAY_API_KEY');
        $this->privateKey = env('TRIPAY_PRIVATE_KEY');
        $this->merchantCode = env('TRIPAY_MERCHANT_CODE');
        $this->baseUrl = env('TRIPAY_BASE_URL');
    }

    public function getPaymentChannels()
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
        ])->get($this->baseUrl . '/merchant/payment-channel');

        return $response->json();
    }

    public function createTransaction($payload)
    {
        $signature = hash_hmac('sha256', $this->merchantCode . $payload['merchant_ref'] . $payload['amount'], $this->privateKey);
        $payload['signature'] = $signature;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
        ])->post($this->baseUrl . '/transaction/create', $payload);

        return $response->json();
    }

    public function getTransactionStatus($reference)
    {
        $url = $this->baseUrl . '/transaction/detail';

        $payload = [
            'reference' => $reference,
        ];

        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
        ];

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url . '?' . http_build_query($payload),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        return json_decode($response, true);
    }

    public function expireTransaction($orderId)
    {
        $payload = ['merchant_ref' => $orderId];
        $signature = hash_hmac('sha256', $this->merchantCode . $orderId . '0', $this->privateKey); // Amount 0 untuk expire
        $payload['signature'] = $signature;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
        ])->post($this->baseUrl . '/transaction/expire', $payload);

        return $response->json();
    }
}
