<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\TicketOrder;
use App\Models\TicketCategory;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Ticket;
use Illuminate\Support\Facades\DB;
use App\Helpers\ValidationHelper;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Transaction::with(['items', 'ticketOrders.category', 'user']);

        if ($user->role === 'volunteer') {
            $query->where('user_id', $user->id);
        }

        $transactions = $query
            ->orderByDesc('created_at')
            ->paginate(10)
            ->through(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'buyer_name' => $transaction->ticketOrders->first()->buyer_name ?? $transaction->user->name,
                    'items' => $transaction->items->map(function ($item) {
                        $variantDetails = $item->variant_details ?? [];
                        return [
                            'item_type' => $item->item_type,
                            'item_name' => $item->item_name,
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                            'color' => $variantDetails['color'] ?? null,
                            'size' => $variantDetails['size'] ?? null,
                            'note' => $variantDetails['note'] ?? null,
                        ];
                    }),
                    'channel' => $transaction->channel,
                    'total_price' => $transaction->total_price,
                    'payment_method' => $transaction->payment_method,
                    'payment_status' => $transaction->status,
                    'pickup_status' => $transaction->pickup_status,
                    'created_at' => $transaction->created_at->toIso8601String(),
                    'responsible' => [
                        'name' => $transaction->responsible?->name ?? '-',
                    ],
                ];
            });

        $events = Ticket::with(['categories'])->get()->map(function ($ticket) {
            return [
                'id' => $ticket->id,
                'title' => $ticket->title,
                'categories' => $ticket->categories->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'category_name' => $category->category_name,
                        'price' => $category->price,
                    ];
                }),
            ];
        });

        $merchandises = Product::with(['category', 'variants'])->get()->map(function ($product) {
            return [
                'id' => $product->id,
                'product_name' => $product->product_name,
                'price' => $product->price,
                'category_name' => $product->category->category_name ?? 'Unknown',
                'variants' => $product->variants->map(function ($variant) {
                    return [
                        'id' => $variant->id,
                        'color' => $variant->color,
                        'size' => $variant->size,
                        'stock' => $variant->stock,
                    ];
                }),
            ];
        });

        return Inertia::render('Admin/Transaction', [
            'transactions' => $transactions,
            'events' => $events,
            'merchandises' => $merchandises,
        ]);
    }


    public function store(Request $request)
    {
        $validator = ValidationHelper::transaction($request->all());

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            $transaction = Transaction::create([
                'user_id' => auth()->id(),
                'responsible_id' => auth()->id(),
                'type' => $request->type,
                'channel' => $request->channel,
                'total_price' => $request->total_price,
                'payment_method' => $request->payment_method,
                'status' => 'paid',
                'pickup_status' => 'picked_up',
            ]);

            foreach ($request->items as $item) {
                $itemName = $item['item_type'] === 'ticket'
                    ? TicketCategory::findOrFail($item['item_id'])->category_name
                    : Product::findOrFail($item['item_id'])->product_name;

                $itemTotalPrice = $item['price'] * $item['quantity'];

                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'item_type' => $item['item_type'],
                    'item_id' => $item['item_id'],
                    'item_name' => $itemName,
                    'quantity' => $item['quantity'],
                    'price' => $itemTotalPrice,
                    'variant_details' => [
                        'color' => $item['color'] ?? null,
                        'size' => $item['size'] ?? null,
                        'note' => $item['note'] ?? null,
                    ],
                ]);

                if ($item['item_type'] === 'merchandise') {
                    $product = Product::findOrFail($item['item_id']);
                    $variant = ProductVariant::where('product_id', $item['item_id'])
                        ->where('color', $item['color'] ?? '')
                        ->where('size', $item['size'] ?? '')
                        ->first();

                    if ($variant) {
                        if ($variant->stock < $item['quantity']) {
                            throw new \Exception("Stok tidak cukup untuk {$product->product_name} (Varian: {$item['color']}, {$item['size']})");
                        }
                        $variant->decrement('stock', $item['quantity']);
                    } else {
                        if ($product->category->category_name === 'Sticker') {
                            $variant = ProductVariant::where('product_id', $item['item_id'])->first();
                            if ($variant && $variant->stock < $item['quantity']) {
                                throw new \Exception("Stok tidak cukup untuk {$product->product_name}");
                            }
                            $variant->decrement('stock', $item['quantity']);
                        } else {
                            throw new \Exception("Varian tidak ditemukan untuk {$product->product_name}");
                        }
                    }
                }
            }

            if (in_array($request->type, ['ticket', 'mixed'])) {
                foreach ($request->ticket_details as $detail) {
                    $category = TicketCategory::findOrFail($detail['ticket_category_id']);
                    $totalTicketPrice = $detail['price'] * $detail['quantity'];

                    TicketOrder::create([
                        'transaction_id' => $transaction->id,
                        'ticket_id' => $category->ticket_id,
                        'ticket_category_id' => $detail['ticket_category_id'],
                        'buyer_name' => $detail['buyer_name'],
                        'price' => $totalTicketPrice,
                        'quantity' => $detail['quantity'],
                        'qr_code' => Str::uuid()->toString()
                    ]);
                }
            }

            DB::commit();
            return redirect()->back()->with('success', 'Transaksi berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    public function updatePickupStatus(Request $request, $id)
    {
        $request->validate([
            'pickup_status' => 'required|in:pending,picked_up',
        ]);

        try {
            $transaction = Transaction::findOrFail($id);
            $transaction->update([
                'pickup_status' => $request->pickup_status,
            ]);

            return redirect()->back()->with('success', 'Status pengambilan barang berhasil diperbarui');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal memperbarui status pengambilan barang']);
        }
    }
}
