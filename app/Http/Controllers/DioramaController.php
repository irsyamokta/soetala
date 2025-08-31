<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\ValidationHelper;
use App\Models\Diorama;
use Inertia\Inertia;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class DioramaController extends Controller
{
    public function index()
    {
        $dioramas = Diorama::all();

        return Inertia::render('Admin/Diorama', compact('dioramas'));
    }

    public function show($id)
    {
        $diorama = Diorama::findOrFail($id);

        return Inertia::render('Admin/Diorama/Show', compact('diorama'));
    }

    public function store(Request $request)
    {
        $validator = ValidationHelper::diorama($request->all(), false);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();

        try {
            DB::beginTransaction();

            if ($request->hasFile('thumbnail')) {
                $uploaded = Cloudinary::uploadApi()->upload(
                    $request->file('thumbnail')->getRealPath(),
                    ['folder' => 'images/dioramas']
                );

                $validated['thumbnail']  = $uploaded['secure_url'];
                $validated['public_id']  = $uploaded['public_id'];
            }

            Diorama::create($validated);

            DB::commit();

            return redirect()
                ->route('dashboard.diorama')
                ->with('success', 'Diorama berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal membuat diorama: ' . $e->getMessage())->withInput();
        }
    }

    public function update(Request $request, $id)
    {
        $diorama = Diorama::findOrFail($id);

        $validator = ValidationHelper::diorama($request->all(), true);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();

        try {
            DB::beginTransaction();

            if ($request->hasFile('thumbnail')) {
                if ($diorama->public_id) {
                    Cloudinary::uploadApi()->destroy($diorama->public_id);
                }

                $uploaded = Cloudinary::uploadApi()->upload(
                    $request->file('thumbnail')->getRealPath(),
                    ['folder' => 'images/dioramas']
                );

                $validated['thumbnail']  = $uploaded['secure_url'];
                $validated['public_id']  = $uploaded['public_id'];
            } else {
                $validated['thumbnail'] = $diorama->thumbnail;
                $validated['public_id'] = $diorama->public_id;
            }

            $diorama->update($validated);

            DB::commit();

            return redirect()
                ->route('dashboard.diorama')
                ->with('success', 'Diorama berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal memperbarui diorama: ' . $e->getMessage())->withInput();
        }
    }


    public function destroy($id)
    {
        $diorama = Diorama::findOrFail($id);

        try {
            DB::beginTransaction();

            if ($diorama->public_id) {
                Cloudinary::uploadApi()->destroy($diorama->public_id);
            }

            $diorama->delete();

            DB::commit();

            return redirect()
                ->route('dashboard.diorama')
                ->with('success', 'Diorama berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menghapus diorama: ' . $e->getMessage());
        }
    }
}
