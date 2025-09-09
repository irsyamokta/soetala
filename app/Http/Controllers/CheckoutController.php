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
use App\Services\MidtransService;
use Carbon\Carbon;
use Midtrans\Config;

class CheckoutController extends Controller
{
    private $midtrans;

    public function __construct(MidtransService $midtrans)
    {
        $this->midtrans = $midtrans;
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
            return redirect()->route('checkout.history')->with('error', 'Transaction is not in a pending state');
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

        $params = [
            'transaction_details' => [
                'order_id' => $transaction->id,
                'gross_amount' => (int) $transaction->total_price,
            ],
            'customer_details' => [
                'first_name' => $user->name ?? 'Guest',
                'email' => $user->email ?? 'guest@example.com',
                'phone' => $user->phone ?? null,
            ],
            'item_details' => $itemDetails,
        ];

        try {
            $response = $this->midtrans->createTransaction($params);

            if (!isset($response->token) || empty($response->token)) {
                throw new \Exception('Snap token not received from Midtrans');
            }

            $snapToken = $response->token;

            $transaction->update([
                'snap_token' => $snapToken,
                'snap_token_expired_at' => Carbon::now()->addHours(24),
                'raw_response' => json_encode($response),
            ]);

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
                ->select('id', 'user_id', 'type', 'total_price', 'status', 'created_at', 'snap_token', 'snap_token_expired_at')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($transaction) {
                    return [
                        'id' => $transaction->id,
                        'type' => $transaction->type,
                        'total_price' => $transaction->total_price,
                        'status' => $transaction->status,
                        'created_at' => $transaction->created_at->toIso8601String(),
                        'snap_token' => $transaction->snap_token,
                        'snap_token_expired_at' => $transaction->snap_token_expired_at?->toIso8601String(),
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

            return Inertia::render('Transaction/UserTransaction', [
                'transactions' => $transactions,
                'snap_token' => $snapToken,
                'transaction_id' => $transaction->id,
            ]);
        } catch (\Exception $e) {
            return redirect()->route('checkout.history')->with('error', 'Failed to initiate payment: ' . $e->getMessage());
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
            ->select('id', 'user_id', 'type', 'total_price', 'status', 'created_at', 'snap_token', 'snap_token_expired_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->type,
                    'total_price' => $transaction->total_price,
                    'status' => $transaction->status,
                    'created_at' => $transaction->created_at->toIso8601String(),
                    'snap_token' => $transaction->snap_token,
                    'snap_token_expired_at' => $transaction->snap_token_expired_at?->toIso8601String(),
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
            ->with('items')
            ->firstOrFail();

        DB::beginTransaction();

        try {
            if ($transaction->snap_token) {
                try {
                    $statusResponse = (object) $this->midtrans->status($transaction->id);

                    if (in_array($statusResponse->transaction_status, ['cancel', 'expire', 'deny'])) {
                        $transaction->update([
                            'status' => $statusResponse->transaction_status,
                            'snap_token' => null,
                            'snap_token_expired_at' => null,
                        ]);
                        DB::commit();
                        return redirect()->route('checkout.history')
                            ->with('message', 'Transaction already ' . $statusResponse->transaction_status);
                    }

                    $this->midtrans->cancelTransaction($transaction->id);
                } catch (\Exception $e) {
                    throw $e;
                }
            }

            $transaction->update([
                'status' => 'canceled',
                'snap_token' => null,
                'snap_token_expired_at' => null,
            ]);

            DB::commit();
            return redirect()->route('checkout.history')->with('message', 'Transaction canceled successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('checkout.history')->with('error', 'Failed to cancel transaction: ' . $e->getMessage());
        }
    }

    public function handleNotification(Request $request)
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production', false);

        try {
            $notification = new \Midtrans\Notification();

            $serverKey = Config::$serverKey;
            $orderId = $notification->order_id;
            $statusCode = $notification->status_code;
            $grossAmount = (string) $notification->gross_amount;
            $expectedSignature = hash('SHA512', $orderId . $statusCode . $grossAmount . $serverKey);

            if ($notification->signature_key !== $expectedSignature) {
                return response()->json(['message' => 'Invalid signature'], 403);
            }

            $transactionId = $notification->order_id;
            $status = $notification->transaction_status;
            $fraudStatus = $notification->fraud_status ?? 'accept';
            $paymentType = $notification->payment_type ?? null;

            $transaction = Transaction::with('items')->where('id', $transactionId)->first();
            if (!$transaction) {
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            DB::beginTransaction();

            $updateData = ['status' => $status];
            if (in_array($status, ['capture', 'settlement']) && $fraudStatus === 'accept') {
                $updateData['status'] = 'paid';
                $updateData['payment_method'] = $paymentType;
            } elseif ($status === 'capture' && $fraudStatus !== 'accept') {
                $updateData['status'] = 'canceled';
            } elseif (in_array($status, ['cancel', 'deny'])) {
                $updateData['status'] = 'canceled';
            } elseif ($status === 'expire') {
                $updateData['status'] = 'expired';
            }

            $updateData['raw_notification'] = json_encode($notification->getResponse());

            $transaction->update($updateData);

            if ($updateData['status'] === 'paid') {
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

            return response()->json(['message' => 'Notification handled'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['message' => 'Failed to handle notification: ' . $e->getMessage()]);
        }
    }
}
