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

        return Inertia::render('Admin/Dashboard', [
            'stocks' => $stocks
        ]);
    }
}
