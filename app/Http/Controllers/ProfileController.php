<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Helpers\ValidationHelper;
use Inertia\Inertia;
use Inertia\Response;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/UserProfiles', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Cretae a new user profile
     */
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

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->all();

        unset($validated['email']);

        $user->fill($validated);

        if ($request->hasFile('avatar')) {
            if ($user->public_id) {
                Cloudinary::uploadApi()->destroy($user->public_id);
            }

            $uploaded = Cloudinary::uploadApi()->upload(
                $request->file('avatar')->getRealPath(),
                ['folder' => 'images/profile']
            );

            $user->avatar = $uploaded['secure_url'];
            $user->public_id = $uploaded['public_id'];
        }

        $user->save();

        return Redirect::route('profile.edit')->with('status', 'Profile updated successfully!');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        if ($user->public_id) {
            Cloudinary::uploadApi()->destroy($user->public_id);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
