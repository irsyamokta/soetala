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

class CheckoutController extends Controller
{
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
                'total_price' => $request->total_price,
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
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
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
                        'quantity' => $ticketDetail['quantity'],
                        'price' => $ticketDetail['price'],
                        'qr_code' => Uuid::uuid4()->toString(),
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('checkout.history', ['transaction_id' => $transaction->id]);
        } catch (\Exception $e) {
            \Log::info($e);
            DB::rollBack();
            return back()->with('error', 'Gagal melakukan checkout');
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
            ->select('id', 'user_id', 'type', 'total_price', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->type,
                    'total_price' => $transaction->total_price,
                    'status' => $transaction->status,
                    'created_at' => $transaction->created_at->toIso8601String(),
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
}
