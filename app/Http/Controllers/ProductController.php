<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                foreach ($validated['variants'] as $index => $variant) {
                    $imageUrl = null;
                    $imagePublicId = null;

                    if ($request->hasFile("variants.$index.image")) {
                        $file = $request->file("variants.$index.image");
                        $uploaded = Cloudinary::uploadApi()->upload($file->getRealPath(), [
                            'folder' => 'images/products/variants'
                        ]);
                        $imageUrl = $uploaded['secure_url'];
                        $imagePublicId = $uploaded['public_id'];
                    }

                    ProductVariant::create([
                        'product_id' => $product->id,
                        'size' => $variant['size'] ?? null,
                        'color' => $variant['color'] ?? null,
                        'stock' => (int) ($variant['stock'] ?? 0),
                        'image' => $imageUrl,
                        'public_id' => $imagePublicId,
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

            $updateData = [
                'category_id' => $validated['category_id'],
                'product_name' => $validated['product_name'],
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'visibility' => $validated['visibility'],
            ];

            if ($request->hasFile('thumbnail')) {
                if ($product->public_id) {
                    Cloudinary::uploadApi()->destroy($product->public_id);

                    ProductImage::where('product_id', $product->id)
                        ->where('public_id', $product->public_id)
                        ->delete();
                }

                $uploaded = Cloudinary::uploadApi()->upload(
                    $request->file('thumbnail')->getRealPath(),
                    ['folder' => 'images/products/thumbnails']
                );

                $updateData['thumbnail'] = $uploaded['secure_url'];
                $updateData['public_id'] = $uploaded['public_id'];

                ProductImage::create([
                    'product_id' => $product->id,
                    'image' => $uploaded['secure_url'],
                    'public_id' => $uploaded['public_id'],
                ]);
            }

            $product->update($updateData);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $img) {
                    $upload = Cloudinary::uploadApi()->upload(
                        $img->getRealPath(),
                        ['folder' => 'images/products']
                    );
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image' => $upload['secure_url'],
                        'public_id' => $upload['public_id'],
                    ]);
                }
            }

            $existingVariantIds = [];
            if (!empty($validated['variants'])) {
                foreach ($validated['variants'] as $variant) {
                    if (!empty($variant['id'])) {
                        $existingVariantIds[] = $variant['id'];
                    }
                }
            }

            $variantsToDelete = $product->variants()->whereNotIn('id', $existingVariantIds)->get();
            foreach ($variantsToDelete as $variant) {
                if ($variant->public_id) {
                    Cloudinary::uploadApi()->destroy($variant->public_id);
                }
                $variant->delete();
            }

            if (!empty($validated['variants'])) {
                foreach ($validated['variants'] as $index => $variant) {
                    $imageUrl = null;
                    $imagePublicId = null;

                    $existingVariant = null;
                    if (!empty($variant['id'])) {
                        $existingVariant = ProductVariant::find($variant['id']);
                        if ($existingVariant) {
                            $imageUrl = $existingVariant->image;
                            $imagePublicId = $existingVariant->public_id;
                        }
                    }

                    if ($request->hasFile("variants.$index.image")) {
                        if ($existingVariant && $existingVariant->public_id) {
                            Cloudinary::uploadApi()->destroy($existingVariant->public_id);
                        }

                        $file = $request->file("variants.$index.image");
                        $uploaded = Cloudinary::uploadApi()->upload($file->getRealPath(), [
                            'folder' => 'images/products/variants'
                        ]);

                        $imageUrl = $uploaded['secure_url'];
                        $imagePublicId = $uploaded['public_id'];
                    } elseif (isset($variant['existingImage']) && !empty($variant['existingImage'])) {
                        $imageUrl = $variant['existingImage'];
                        $imagePublicId = $variant['existingPublicId'] ?? null;
                    }

                    if ($existingVariant) {
                        $existingVariant->update([
                            'size' => $variant['size'] ?? null,
                            'color' => $variant['color'] ?? null,
                            'stock' => (int) ($variant['stock'] ?? 0),
                            'image' => $imageUrl,
                            'public_id' => $imagePublicId,
                        ]);
                    } else {
                        ProductVariant::create([
                            'product_id' => $product->id,
                            'size' => $variant['size'] ?? null,
                            'color' => $variant['color'] ?? null,
                            'stock' => (int) ($variant['stock'] ?? 0),
                            'image' => $imageUrl,
                            'public_id' => $imagePublicId,
                        ]);
                    }
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
        $product = Product::find($image->product_id);

        try {
            Cloudinary::uploadApi()->destroy($image->public_id);

            if ($product && $product->public_id === $image->public_id) {
                $product->update([
                    'thumbnail' => null,
                    'public_id' => null,
                ]);
            }

            $image->delete();

            return back()->with('success', 'Gambar berhasil dihapus');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal hapus gambar: ' . $e->getMessage());
        }
    }

    public function destroyVariantImage($id)
    {
        $variant = ProductVariant::findOrFail($id);

        try {
            if ($variant->public_id) {
                Cloudinary::uploadApi()->destroy($variant->public_id);
            }

            $variant->update([
                'image' => null,
                'public_id' => null,
            ]);

            return back()->with('success', 'Image variant berhasil dihapus');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal hapus image variant: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        try {
            DB::beginTransaction();

            foreach ($product->images as $image) {
                if ($image->public_id) {
                    Cloudinary::uploadApi()->destroy($image->public_id);
                }
            }

            foreach ($product->variants as $variant) {
                if ($variant->public_id) {
                    Cloudinary::uploadApi()->destroy($variant->public_id);
                }
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
