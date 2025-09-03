<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Diorama;
use App\Models\Ticket;
use App\Models\Product;
use Illuminate\Foundation\Application;

class HomepageController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user && $user->hasRole('admin')) {
            return redirect()->route('dashboard.admin');
        }

        if ($user && !$user->hasVerifiedEmail()) {
            return redirect()->route('verification.notice');
        }

        $dioramas = Diorama::where('visibility', 1)->get();
        $ticket = Ticket::where('visibility', 1)->get();
        $mechant = Product::where('visibility', 1)->with('variants', 'images')->get();

        return Inertia::render('Homepage', [
            'canLogin'       => Route::has('login'),
            'canRegister'    => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion'     => PHP_VERSION,
            'dioramas'       => $dioramas,
            'ticket'        => $ticket,
            'merchant'        => $mechant,
        ]);
    }
}
