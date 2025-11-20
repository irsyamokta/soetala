<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Transaction;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $recap = Transaction::select(
                DB::raw('DATE(created_at) as date'),
                'payment_method',
                DB::raw('SUM(total_price) as total')
            )
            ->where('status', 'paid')
            ->groupBy('date', 'payment_method')
            ->orderBy('date', 'desc')
            ->get();

        $report = [];
        foreach ($recap as $row) {
            if (!isset($report[$row->date])) {
                $report[$row->date] = [
                    'date' => $row->date,
                    'methods' => [],
                    'total' => 0,
                ];
            }
            $report[$row->date]['methods'][$row->payment_method] = $row->total;
            $report[$row->date]['total'] += $row->total;
        }

        $report = array_values($report);

        return Inertia::render('Admin/Report', [
            'report' => $report
        ]);
    }
}
