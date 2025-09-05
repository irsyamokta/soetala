<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\TicketOrder;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;
use Inertia\Inertia;


class CheckoutController extends Controller
{
    public function index(Request $request)
    {
        $ticket = null;
        $merch = null;

        if ($request->ticket_id) {
            $ticket = Ticket::find($request->ticket_id);
        }

        if ($request->merch_id) {
            $merch = Product::find($request->merch_id);
        }

        $tickets = Ticket::all();
        $merchandises = Product::where('visibility', 1)->with('variants')->get();

        return Inertia::render("Checkout/CheckoutTicket", [
            "initialTicket" => $ticket,
            "initialMerch" => $merch,
            "tickets" => $tickets,
            "merchandises" => $merchandises,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|uuid|exists:users,id',
            'total_price' => 'required|numeric|min:0',
            'type' => 'required|string|in:ticket,merchandise,mixed',
            'channel' => 'required|string|in:online,offline',
            'items' => 'required|array',
            'items.*.item_type' => 'required|string|in:ticket,product',
            'items.*.item_name' => 'nullable|string',
            'items.*.item_id' => 'required|uuid',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.color' => 'nullable|string',
            'items.*.size' => 'nullable|string',
            'items.*.note' => 'nullable|string',
            'ticket_details' => 'required_if:type,ticket,ticket,merchandise|array',
            'ticket_details.*.ticket_id' => 'required|uuid|exists:tickets,id',
            'ticket_details.*.ticket_type' => 'required|string|in:adult,child',
            'ticket_details.*.price' => 'required|numeric|min:0',
            'ticket_details.*.quantity' => 'required|integer|min:1',
        ]);

        // Ensure the authenticated user matches the provided user_id
        if ($request->user()->id !== $request->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        DB::beginTransaction();

        try {
            // Create transaction
            $transaction = Transaction::create([
                'id' => Uuid::uuid4()->toString(),
                'user_id' => $request->user_id,
                'type' => $request->type,
                'channel' => $request->channel,
                'total_price' => $request->total_price,
                'payment_method' => $request->payment_method ?? null,
                'status' => 'pending',
            ]);

            // Create transaction items
            foreach ($request->items as $item) {
                TransactionItem::create([
                    'id' => Uuid::uuid4()->toString(),
                    'transaction_id' => $transaction->id,
                    'item_type' => $item['item_type'],
                    'item_name' => $item['item_name'] ?? null,
                    'item_id' => $item['item_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    // Store variant details as JSON if they exist
                    'variant_details' => isset($item['color']) || isset($item['size']) || isset($item['note'])
                        ? json_encode([
                            'color' => $item['color'] ?? null,
                            'size' => $item['size'] ?? null,
                            'note' => $item['note'] ?? null,
                        ])
                        : null,
                ]);
            }

            // Create ticket orders for ticket items
            if ($request->type === 'ticket' || $request->type === 'mixed') {
                foreach ($request->ticket_details as $ticketDetail) {
                    // Create one ticket order per quantity
                    for ($i = 0; $i < $ticketDetail['quantity']; $i++) {
                        TicketOrder::create([
                            'id' => Uuid::uuid4()->toString(),
                            'transaction_id' => $transaction->id,
                            'ticket_id' => $ticketDetail['ticket_id'],
                            'buyer_name' => $request->user()->name,
                            'phone' => $request->user()->phone ?? null,
                            'ticket_type' => $ticketDetail['ticket_type'],
                            'price' => $ticketDetail['price'],
                            'qr_code' => null,
                        ]);
                    }
                }
            }

            DB::commit();

            return redirect()->route('checkout.history', ['transaction_id' => $transaction->id]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create transaction', 'error' => $e->getMessage()], 500);
        }
    }

    public function history(Request $request)
    {
        $transactions = Transaction::where('user_id', $request->user()->id)
            ->with([
                'items' => function ($query) {
                    $query->select('id', 'transaction_id', 'item_type', 'item_name', 'item_id', 'quantity', 'price', 'variant_details')
                        ->with([
                            'ticket' => function ($query) {
                                $query->select('id', 'category')->where('visibility', true);
                            },
                            'product' => function ($query) {
                                $query->select('id', 'product_name')->where('visibility', true);
                            },
                        ]);
                },
                'ticketOrders' => function ($query) {
                    $query->select('id', 'transaction_id', 'ticket_id', 'buyer_name', 'phone', 'ticket_type', 'price', 'qr_code');
                },
            ])
            ->select('id', 'user_id', 'type', 'total_price', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render("Transaction/UserTransaction", [
            "transactions" => $transactions,
        ]);
    }
}
