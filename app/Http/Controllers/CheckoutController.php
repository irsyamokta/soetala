<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TicketCategory;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\TicketOrder;
use App\Models\ProductVariant;
use App\Helpers\ValidationHelper;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;
use Inertia\Inertia;
use App\Services\TripayService;

class CheckoutController extends Controller
{
    private $tripay;

    public function __construct(TripayService $tripay)
    {
        $this->tripay = $tripay;
    }

    public function index(Request $request)
    {
        $ticketCategories = TicketCategory::with(['ticket' => function ($query) {
            $query->select('id', 'title', 'visibility')->where('visibility', true);
        }])
            ->select('id', 'ticket_id', 'category_name as category', 'price', 'description')
            ->whereHas('ticket', function ($query) {
                $query->where('visibility', true);
            })
            ->get();

        $merchandises = Product::where('visibility', 1)
            ->with(['variants' => function ($query) {
                $query->select('id', 'product_id', 'color', 'size', 'stock');
            }])
            ->select('id', 'product_name', 'price')
            ->get();

        return Inertia::render("Checkout/CheckoutTicket", [
            "tickets" => $ticketCategories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'category' => $category->category,
                    'description' => $category->description,
                    'price' => $category->price,
                    'ticket_id' => $category->ticket_id,
                ];
            })->toArray(),
            "merchandises" => $merchandises->map(function ($merch) {
                return [
                    'id' => $merch->id,
                    'product_name' => $merch->product_name,
                    'price' => $merch->price,
                    'variants' => $merch->variants->map(function ($variant) {
                        return [
                            'id' => $variant->id,
                            'color' => $variant->color,
                            'size' => $variant->size,
                            'stock' => $variant->stock,
                        ];
                    })->toArray(),
                ];
            })->toArray(),
        ]);
    }

    public function store(Request $request)
    {
        $validator = ValidationHelper::order($request->all());
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        if ($request->user()->id !== $request->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        DB::beginTransaction();

        try {
            foreach ($request->items as $item) {
                if ($item['item_type'] === 'product') {
                    $product = Product::findOrFail($item['item_id']);
                    $variant = ProductVariant::where('product_id', $item['item_id'])
                        ->where('color', $item['color'] ?? '')
                        ->where('size', $item['size'] ?? '')
                        ->first();

                    if ($variant && $variant->stock < $item['quantity']) {
                        throw new \Exception("Insufficient stock for {$product->product_name} (Color: {$item['color']}, Size: {$item['size']})");
                    }
                }
            }

            $transaction = Transaction::create([
                'id' => Uuid::uuid4()->toString(),
                'user_id' => $request->user_id,
                'type' => $request->type,
                'channel' => $request->channel,
                'total_price' => (int) $request->total_price,
                'payment_method' => $request->payment_method ?? null,
                'status' => 'pending',
            ]);

            foreach ($request->items as $item) {
                TransactionItem::create([
                    'id' => Uuid::uuid4()->toString(),
                    'transaction_id' => $transaction->id,
                    'item_type' => $item['item_type'],
                    'item_name' => $item['item_name'],
                    'item_id' => $item['item_id'],
                    'quantity' => (int) $item['quantity'],
                    'price' => (int) $item['price'],
                    'variant_details' => [
                        'color' => $item['color'] ?? null,
                        'size' => $item['size'] ?? null,
                        'note' => $item['note'] ?? null,
                    ],
                ]);
            }

            if (in_array($request->type, ['ticket', 'mixed'])) {
                foreach ($request->ticket_details as $ticketDetail) {
                    TicketOrder::create([
                        'id' => Uuid::uuid4()->toString(),
                        'transaction_id' => $transaction->id,
                        'ticket_id' => $ticketDetail['ticket_id'],
                        'ticket_category_id' => $ticketDetail['ticket_category_id'],
                        'buyer_name' => $ticketDetail['buyer_name'],
                        'phone' => $ticketDetail['phone'],
                        'quantity' => (int) $ticketDetail['quantity'],
                        'price' => (int) $ticketDetail['price'],
                        'qr_code' => Uuid::uuid4()->toString(),
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('checkout.history', ['transaction_id' => $transaction->id]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal melakukan checkout: ' . $e->getMessage());
        }
    }

    public function checkout(Request $request, $transactionId)
    {
        $transaction = Transaction::where('id', $transactionId)
            ->where('user_id', $request->user()->id)
            ->with(['items', 'ticketOrders.category'])
            ->firstOrFail();

        if ($transaction->status !== 'pending') {
            return redirect()->route('checkout.history')
                ->with('error', 'Transaksi tidak dalam status pending.');
        }

        if (!empty($transaction->checkout_url) && $transaction->status === 'pending') {
            return redirect($transaction->checkout_url);
        }

        $user = $request->user();

        $itemDetails = [];
        foreach ($transaction->items as $item) {
            if ($item->item_type === 'product') {
                $itemDetails[] = [
                    'id' => $item->item_id,
                    'price' => (int) $item->price,
                    'quantity' => (int) $item->quantity,
                    'name' => $item->item_name,
                ];
            }
        }

        foreach ($transaction->ticketOrders as $ticket) {
            $itemDetails[] = [
                'id' => $ticket->ticket_category_id,
                'price' => (int) $ticket->price,
                'quantity' => (int) $ticket->quantity,
                'name' => $ticket->category->category_name ?? 'Ticket',
            ];
        }

        $payload = [
            'method' => 'QRIS2',
            'merchant_ref'  => 'INV-' . $transaction->id,
            'amount'        => (int) $transaction->total_price,
            'customer_name' => $user->name ?? 'Guest',
            'customer_email' => $user->email ?? 'guest@example.com',
            'customer_phone' => $user->phone ?? '',
            'order_items'   => $itemDetails,
            'callback_url'  => config('tripay.callback_url'),
            'return_url'    => config('tripay.return_url'),
            'expired_time'  => now()->addMinutes(10)->timestamp,
        ];

        try {
            $response = $this->tripay->createTransaction($payload);

            if (isset($response['data']['checkout_url'])) {
                $transaction->update([
                    'checkout_url' => $response['data']['checkout_url'],
                    'status' => 'pending',
                    'reference' => $response['data']['reference'],
                    'raw_response' => json_encode($response),
                ]);

                return redirect($response['data']['checkout_url']);
            }

            throw new \Exception('Gagal menerima checkout URL dari Tripay.');
        } catch (\Throwable $th) {
            return redirect()->route('checkout.history')
                ->with('error', 'Gagal membuat transaksi Tripay: ' . $th->getMessage());
        }
    }

    public function history(Request $request)
    {
        $transactions = Transaction::where('user_id', $request->user()->id)
            ->with([
                'items' => function ($query) {
                    $query->select('id', 'transaction_id', 'item_type', 'item_name', 'item_id', 'quantity', 'price', 'variant_details');
                },
                'ticketOrders' => function ($query) {
                    $query->select('id', 'transaction_id', 'ticket_id', 'ticket_category_id', 'buyer_name', 'phone', 'quantity', 'price', 'qr_code')
                        ->with(['category' => function ($query) {
                            $query->select('id', 'category_name');
                        }]);
                },
            ])
            ->select('id', 'user_id', 'type', 'total_price', 'status', 'created_at', 'checkout_url')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->type,
                    'total_price' => $transaction->total_price,
                    'status' => $transaction->status,
                    'created_at' => $transaction->created_at->toIso8601String(),
                    'checkout_url' => $transaction->checkout_url,
                    'items' => $transaction->items->map(function ($item) {
                        return [
                            'item_type' => $item->item_type,
                            'item_name' => $item->item_name,
                            'item_id' => $item->item_id,
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                            'color' => $item->variant_details['color'] ?? null,
                            'size' => $item->variant_details['size'] ?? null,
                            'note' => $item->variant_details['note'] ?? null,
                        ];
                    }),
                    'ticket_orders' => $transaction->ticketOrders->map(function ($order) {
                        return [
                            'ticket_id' => $order->ticket_id,
                            'ticket_category_id' => $order->ticket_category_id,
                            'buyer_name' => $order->buyer_name,
                            'phone' => $order->phone,
                            'quantity' => $order->quantity,
                            'category_name' => $order->category ? $order->category->category_name : null,
                            'price' => $order->price,
                            'qr_code' => $order->qr_code,
                        ];
                    }),
                ];
            });

        return Inertia::render("Transaction/UserTransaction", [
            "transactions" => $transactions,
        ]);
    }

    public function cancel(Request $request, $transactionId)
    {
        $transaction = Transaction::where('id', $transactionId)
            ->where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->firstOrFail();

        DB::beginTransaction();

        try {
            if ($transaction->checkout_url) {
                try {
                    $statusResponse = $this->tripay->getTransactionStatus($transaction->reference);

                    if (!$statusResponse || empty($statusResponse['success'])) {
                        throw new \Exception('Gagal mengambil status transaksi dari Tripay.');
                    }

                    $tripayStatus = $statusResponse['data']['status'];

                    $mappedStatus = match ($tripayStatus) {
                        'PAID' => 'paid',
                        'UNPAID' => 'pending',
                        'EXPIRED' => 'expired',
                        default => 'failed',
                    };

                    if (in_array($mappedStatus, ['pending', 'expired'])) {
                        $transaction->update([
                            'status' => 'canceled',
                            'checkout_url' => null,
                        ]);
                    } else {
                        $transaction->update(['status' => $mappedStatus]);
                    }

                    DB::commit();
                    return redirect()->route('checkout.history')
                        ->with('message', 'Transaksi berhasil dibatalkan atau diperbarui ke status terbaru.');
                } catch (\Exception $e) {
                    throw $e;
                }
            }

            $transaction->update([
                'status' => 'canceled',
                'checkout_url' => null,
            ]);

            DB::commit();
            return redirect()->route('checkout.history')
                ->with('message', 'Transaksi dibatalkan di sistem.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('checkout.history')
                ->with('error', 'Gagal membatalkan transaksi: ' . $e->getMessage());
        }
    }

    public function callback(Request $request)
    {
        $json = $request->getContent();
        $signature = hash_hmac('sha256', $json, config('tripay.private_key'));

        if ($signature !== $request->header('X-Callback-Signature')) {
            return response()->json(['success' => false, 'message' => 'Invalid signature'], 403);
        }

        $data = json_decode($json, true);

        $merchantRef = $data['merchant_ref'] ?? null;
        if (!$merchantRef) {
            return response()->json(['success' => false, 'message' => 'Missing merchant_ref'], 400);
        }

        $transactionId = str_replace('INV-', '', $merchantRef);
        $transaction = Transaction::with('items')->where('id', $transactionId)->first();

        if (!$transaction) {
            return response()->json(['success' => false, 'message' => 'Transaction not found'], 404);
        }

        $tripayStatus = strtoupper($data['status'] ?? 'FAILED');
        $status = match ($tripayStatus) {
            'PAID' => 'paid',
            'EXPIRED' => 'expired',
            'UNPAID' => 'pending',
            default => 'failed',
        };

        DB::beginTransaction();

        try {
            $transaction->update([
                'status' => $status,
                'payment_method' => $data['payment_method'] ?? null,
                'reference' => $data['reference'] ?? null,
                'raw_callback' => $json,
            ]);

            if ($status === 'paid') {
                foreach ($transaction->items as $item) {
                    if ($item->item_type === 'product' && $item->quantity > 0) {
                        $color = $item->variant_details['color'] ?? null;
                        $size = $item->variant_details['size'] ?? null;

                        $query = ProductVariant::where('product_id', $item->item_id);

                        if ($color) {
                            $query->where('color', $color);
                        } else {
                            $query->where(function ($q) {
                                $q->whereNull('color')->orWhere('color', '');
                            });
                        }

                        if ($size) {
                            $query->where('size', $size);
                        } else {
                            $query->where(function ($q) {
                                $q->whereNull('size')->orWhere('size', '');
                            });
                        }

                        $variant = $query->first();

                        if ($variant) {
                            if ($variant->stock >= $item->quantity) {
                                $variant->decrement('stock', $item->quantity);
                            }
                        }
                    }
                }
            }

            DB::commit();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Internal error'
            ], 500);
        }
    }
}
