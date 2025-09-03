<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Helpers\ValidationHelper;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Inertia\Inertia;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class ProductController extends Controller
{
    public function index()
    {
        $merchandises = Product::with(['images', 'variants', 'category'])->get();
        $categories = ProductCategory::all();

        return Inertia::render('Admin/Merchandise', compact('merchandises', 'categories'));
    }

    public function store(Request $request)
    {
        $validator = ValidationHelper::product($request->all(), false);
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        $validated = $validator->validated();

        // $validated['id'] = Str::uuid()->toString();

        DB::beginTransaction();
        try {
            if ($request->hasFile('thumbnail')) {
                $uploaded = Cloudinary::uploadApi()->upload($request->file('thumbnail')->getRealPath(), [
                    'folder' => 'images/products/thumbnails'
                ]);
                $validated['thumbnail'] = $uploaded['secure_url'];
                $validated['public_id'] = $uploaded['public_id'];
            }

            $product = Product::create($validated);

            if (!empty($validated['thumbnail']) && !empty($validated['public_id'])) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image' => $validated['thumbnail'],
                    'public_id' => $validated['public_id'],
                ]);
            }

            $images = $request->file('images') ?: [];
            foreach ($images as $img) {
                if ($img->isValid()) {
                    $uploaded = Cloudinary::uploadApi()->upload($img->getRealPath(), [
                        'folder' => 'images/products'
                    ]);
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image' => $uploaded['secure_url'],
                        'public_id' => $uploaded['public_id'],
                    ]);
                }
            }

            if (!empty($validated['variants']) && is_array($validated['variants'])) {
                foreach ($validated['variants'] as $variant) {
                    ProductVariant::create([
                        'product_id' => $product->id,
                        'size' => $variant['size'] ?? null,
                        'color' => $variant['color'] ?? null,
                        'stock' => (int) ($variant['stock'] ?? 0),
                    ]);
                }
            }

            DB::commit();
            return redirect()->route('dashboard.merchandise')
                ->with('success', 'Merchandise berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menambahkan merchandise: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function update(Request $request, $id)
    {
        $validator = ValidationHelper::product($request->all(), true);
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        $validated = $validator->validated();

        DB::beginTransaction();
        try {
            $product = Product::findOrFail($id);

            $product->update([
                'category_id'  => $validated['category_id'],
                'product_name' => $validated['product_name'],
                'description'  => $validated['description'] ?? null,
                'price'        => $validated['price'],
                'visibility'   => $validated['visibility'],
            ]);

            // === Thumbnail ===
            if ($request->hasFile('thumbnail')) {
                $oldThumbnail = $product->images()->first();
                if ($oldThumbnail) {
                    Cloudinary::uploadApi()->destroy($oldThumbnail->public_id);
                    $oldThumbnail->delete();
                }

                $uploaded = Cloudinary::uploadApi()->upload(
                    $request->file('thumbnail')->getRealPath(),
                    ['folder' => 'images/products/thumbnails']
                );

                ProductImage::create([
                    'product_id' => $product->id,
                    'image'      => $uploaded['secure_url'],
                    'public_id'  => $uploaded['public_id'],
                ]);
            }

            // === Images tambahan ===
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $img) {
                    $upload = Cloudinary::uploadApi()->upload(
                        $img->getRealPath(),
                        ['folder' => 'images/products']
                    );

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image'      => $upload['secure_url'],
                        'public_id'  => $upload['public_id'],
                    ]);
                }
            }

            // === Variants ===
            $product->variants()->delete();
            if (!empty($validated['variants'])) {
                foreach ($validated['variants'] as $variant) {
                    ProductVariant::create([
                        'product_id' => $product->id,
                        'size'       => $variant['size'] ?? null,
                        'color'      => $variant['color'] ?? null,
                        'stock'      => (int) ($variant['stock'] ?? 0),
                    ]);
                }
            }

            DB::commit();
            return back()->with('success', 'Merchandise berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal memperbarui merchandise: ' . $e->getMessage())->withInput();
        }
    }


    public function destroyImage($id)
    {
        $image = ProductImage::findOrFail($id);

        try {
            Cloudinary::uploadApi()->destroy($image->public_id);
            $image->delete();
            return back()->with('success', 'Gambar berhasil dihapus');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal hapus gambar: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        try {
            DB::beginTransaction();

            if ($product->public_id) {
                Cloudinary::uploadApi()->destroy($product->public_id);
            }

            $product->delete();

            DB::commit();

            return redirect()
                ->route('dashboard.merchandise')
                ->with('success', 'Merchandise berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menghapus merchandise: ' . $e->getMessage());
        }
    }
}
