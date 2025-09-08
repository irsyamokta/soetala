<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TicketOrder;
use App\Models\TransactionItem;
use App\Exports\VisitorsExport;
use Maatwebsite\Excel\Facades\Excel;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $stocks = Product::with('variants')->get()->map(function ($product) {
            return [
                'id' => $product->id,
                'product_name' => $product->product_name,
                'category' => $product->category->category_name ?? null,
                'total_stock' => $product->variants->sum('stock'),
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

        $totalRevenue = Transaction::where('status', 'paid')->sum('total_price');

        $ticketsSold = TicketOrder::whereHas('transaction', fn($q) => $q->where('status', 'paid'))
            ->sum('quantity');

        $merchandiseSold = TransactionItem::where('item_type', 'product')
            ->whereHas('transaction', fn($q) => $q->where('status', 'paid'))
            ->sum('quantity');

        $totalVisitors = TicketOrder::whereNotNull('used_at')->sum('quantity'); // Overall total

        $today = Carbon::now('Asia/Jakarta')->toDateString();
        $selectedDate = $request->query('date', $today);

        $visitors = TicketOrder::whereNotNull('used_at')
            ->with('category')
            ->when(!auth()->check() || auth()->user()->role !== 'admin', function ($query) use ($today) {
                $query->whereDate('used_at', $today);
            })
            ->when(auth()->check() && auth()->user()->role === 'admin' && $request->has('date'), function ($query) use ($selectedDate) {
                $query->whereDate('used_at', $selectedDate);
            })
            ->orderBy('used_at', 'desc')
            ->get()
            ->map(function ($ticketOrder) {
                return [
                    'id' => $ticketOrder->id,
                    'buyer_name' => $ticketOrder->buyer_name,
                    'quantity' => $ticketOrder->quantity,
                    'used_at' => $ticketOrder->used_at,
                    'ticket_id' => $ticketOrder->ticket_id,
                    'ticket_category_id' => $ticketOrder->ticket_category_id,
                    'category_name' => $ticketOrder->category->category_name ?? null,
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stocks' => $stocks,
            'totalRevenue' => $totalRevenue,
            'ticketsSold' => $ticketsSold,
            'merchandiseSold' => $merchandiseSold,
            'visitors' => $visitors,
            'totalVisitors' => $totalVisitors, 
            'today' => $today,
        ]);
    }

    public function checkin(Request $request)
    {
        $request->validate([
            'qr_code' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            $ticketOrder = TicketOrder::where('qr_code', $request->qr_code)
                ->with('ticket', 'category')
                ->first();

            if (!$ticketOrder) {
                return back()->with('message', 'Tiket tidak ditemukan.');
            }

            if ($ticketOrder->used_at) {
                return back()->with('message', 'Tiket sudah digunakan pada ' . Carbon::parse($ticketOrder->used_at)->format('d/m/Y H:i'));
            }

            $ticketOrder->update(['used_at' => Carbon::now('Asia/Jakarta')]);

            DB::commit();

            return redirect()->back()->with([
                'success' => true,
                'data' => [
                    'buyer_name' => $ticketOrder->buyer_name,
                    'category_name' => $ticketOrder->category->category_name,
                    'quantity' => $ticketOrder->quantity,
                    'used_at' => $ticketOrder->used_at,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('message', 'Gagal memproses check-in: ' . $e->getMessage());
        }
    }

    public function export(Request $request)
    {
        $date = $request->get('date');

        if (!$date || !\DateTime::createFromFormat('Y-m-d', $date)) {
            return back()->with('message', 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD.');
        }

        $count = TicketOrder::whereDate('used_at', Carbon::parse($date)->setTimezone('Asia/Jakarta'))->count();
        if ($count === 0) {
            return back()->with('message', 'Tidak ada data pengunjung tanggal ' . $date);
        }

        return Excel::download(new VisitorsExport($date), "data_pengunjung_{$date}.xlsx");
    }
}
