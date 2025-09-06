<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Inertia\Inertia;

class VolunteerController extends Controller
{
    public function index()
    {
        return Inertia::render('Volunteer/Dashboard');
    }
}
