<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use Inertia\Inertia;


class UserTicketController extends Controller
{
    public function index(Request $request)
    {
        $transactions = Transaction::where('user_id', $request->user()->id)
            ->where('status', 'paid')
            ->where(function ($query) {
                $query->where('type', 'ticket')
                    ->orWhere('type', 'mixed');
            })
            ->with([
                'ticketOrders' => function ($query) {
                    $query->select('id', 'transaction_id', 'ticket_id', 'ticket_category_id', 'buyer_name', 'phone', 'quantity', 'price', 'qr_code', 'used_at')
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
                    'ticket_orders' => $transaction->ticketOrders->map(function ($order) {
                        return [
                            'id' => $order->id,
                            'ticket_id' => $order->ticket_id,
                            'ticket_category_id' => $order->ticket_category_id,
                            'buyer_name' => $order->buyer_name,
                            'phone' => $order->phone,
                            'quantity' => $order->quantity,
                            'category_name' => $order->category ? $order->category->category_name : null,
                            'price' => $order->price,
                            'qr_code' => $order->qr_code,
                            'used_at' => $order->used_at,
                        ];
                    }),
                ];
            });

        return Inertia::render("Ticket/UserTicket", [
            "transactions" => $transactions,
        ]);
    }
}
