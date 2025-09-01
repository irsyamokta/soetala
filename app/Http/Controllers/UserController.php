<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;


class UserController extends Controller
{
    public function index()
    {
        $users = User::select('*')
            ->selectRaw("CASE WHEN email_verified_at IS NULL THEN 'Unverified' ELSE 'Verified' END as status_verified")
            ->where('role', 'visitor')
            ->paginate(10);

        return Inertia::render('Admin/User', [
            'users' => $users
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->public_id) {
            Cloudinary::uploadApi()->destroy($user->public_id);
        }

        $user->delete();

        return redirect()->route('dashboard.user');
    }
}
