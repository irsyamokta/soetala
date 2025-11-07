<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Helpers\ValidationHelper;
use Illuminate\Support\Facades\Hash;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;


class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->select('*')
            ->selectRaw("CASE WHEN email_verified_at IS NULL THEN 'Unverified' ELSE 'Verified' END as status_verified")
            ->whereIn('role', ['visitor', 'volunteer']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name',  'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/User', [
            'users'   => $users,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validator = ValidationHelper::user($request->all(), false);
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();

        try {
            DB::beginTransaction();

            if ($request->hasFile('avatar')) {
                $uploaded = Cloudinary::uploadApi()->upload(
                    $request->file('avatar')->getRealPath(),
                    ['folder' => 'images/profile']
                );

                $validated['avatar'] = $uploaded['secure_url'];
                $validated['public_id'] = $uploaded['public_id'];
            }

            $validated['password'] = Hash::make($validated['password']);
            $validated['email_verified_at'] = now();

            $user = User::create($validated);

            $user->assignRole($request->role);

            DB::commit();

            return redirect()->route('dashboard.user')->with('success', 'User berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal membuat user: ' . $e->getMessage())->withInput();
        }
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = ValidationHelper::user($request->all(), true, $id);
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();

        try {
            DB::beginTransaction();

            if ($request->hasFile('avatar')) {
                if ($user->public_id) {
                    Cloudinary::uploadApi()->destroy($user->public_id);
                }
                $uploaded = Cloudinary::uploadApi()->upload(
                    $request->file('avatar')->getRealPath(),
                    ['folder' => 'images/profile']
                );

                $validated['avatar'] = $uploaded['secure_url'];
                $validated['public_id'] = $uploaded['public_id'];
            }

            if (!empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']);
            }

            $user->update($validated);

            $user->syncRoles([$request->role]);

            DB::commit();

            return redirect()->route('dashboard.user')->with('success', 'User berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal memperbarui user: ' . $e->getMessage())->withInput();
        }
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
