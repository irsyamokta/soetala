<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stocks = Product::with('variants')->get()->map(function ($product) {
            return [
                'stock' => $product->variants->sum('stock'),
            ];
        });

        return Inertia::render('Admin/Dashboard', [
            'stocks' => $stocks
        ]);
    }
}
