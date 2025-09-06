<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Validator;
use App\Models\ProductCategory;

class ValidationHelper
{
    public static function ticket($data, $isUpdate = false)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
            'visibility' => 'required|boolean',

            'categories' => 'required|array|min:1',
            'categories.*.category_name' => 'required|string',
            'categories.*.price' => 'required|numeric|min:0',
            'categories.*.description' => 'required|string',

        ];

        $rules['thumbnail'] = $isUpdate
            ? 'nullable|image|mimes:jpeg,png,jpg|max:2048'
            : 'required|image|mimes:jpeg,png,jpg|max:2048';

        return Validator::make(
            $data,
            $rules,
            [
                'title.required' => 'Judul wajib diisi.',
                'title.string' => 'Judul harus berupa teks.',
                'title.max' => 'Judul maksimal 255 karakter.',

                'thumbnail.required' => 'Thumbnail wajib diisi.',
                'thumbnail.image' => 'Thumbnail harus berupa gambar.',
                'thumbnail.mimes' => 'Thumbnail hanya boleh berformat jpeg, png, atau jpg.',
                'thumbnail.max' => 'Ukuran thumbnail maksimal 2MB.',

                'description.required' => 'Deskripsi wajib diisi.',
                'description.string' => 'Deskripsi harus berupa teks.',

                'location.required' => 'Lokasi wajib diisi.',
                'location.string' => 'Lokasi harus berupa teks.',

                'start_date.required' => 'Tanggal mulai wajib diisi.',
                'start_date.date' => 'Tanggal mulai harus berupa tanggal yang valid.',

                'end_date.required' => 'Tanggal selesai wajib diisi.',
                'end_date.date' => 'Tanggal selesai harus berupa tanggal yang valid.',
                'end_date.after_or_equal' => 'Tanggal selesai tidak boleh sebelum tanggal mulai.',

                'start_time.required' => 'Waktu mulai wajib diisi.',
                'end_time.required' => 'Waktu selesai wajib diisi.',
                'end_time.after' => 'Waktu selesai tidak boleh sebelum waktu mulai.',

                'visibility.required' => 'Visibility wajib diisi.',
                'visibility.boolean' => 'Visibility harus berupa true atau false.',

                'categories.required' => 'Kategori tiket wajib diisi minimal 1.',
                'categories.array' => 'Kategori tiket harus berupa array.',
                'categories.min' => 'Minimal harus ada 1 kategori tiket.',

                'categories.*.category_name.required' => 'Nama kategori wajib diisi.',
                'categories.*.category_name.string' => 'Nama kategori harus berupa teks.',

                'categories.*.price.required' => 'Harga kategori wajib diisi.',
                'categories.*.price.numeric' => 'Harga kategori harus berupa angka.',
                'categories.*.price.min' => 'Harga kategori tidak boleh kurang dari 0.',

                'categories.*.description.required' => 'Deskripsi kategori wajib diisi.',
                'categories.*.description.string' => 'Deskripsi kategori harus berupa teks.',
            ]
        );
    }

    public static function diorama($data, $isUpdate = false)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:150|max:265',
            'author' => 'required|string|max:255',
            'visibility' => 'required|boolean',
        ];

        $rules['thumbnail'] = $isUpdate
            ? 'nullable|image|mimes:jpeg,png,jpg|max:2048'
            : 'required|image|mimes:jpeg,png,jpg|max:2048';

        return Validator::make(
            $data,
            $rules,
            [
                'thumbnail.required' => 'Thumbnail wajib diisi.',
                'thumbnail.image' => 'Thumbnail harus berupa gambar.',
                'thumbnail.mimes' => 'Thumbnail hanya boleh berformat jpeg, png, atau jpg.',
                'thumbnail.max' => 'Ukuran thumbnail maksimal 2MB.',

                'title.required' => 'Kategori wajib diisi.',
                'title.max' => 'Kategori maksimal 255 karakter.',

                'description.required' => 'Deskripsi wajib diisi.',
                'description.string' => 'Deskripsi harus berupa teks.',
                'description.min' => 'Deskripsi minimal 150 karakter.',
                'description.max' => 'Deskripsi maksimal 150 karakter.',

                'author.required' => 'Pelukis wajib diisi.',
                'author.max' => 'Pelukis maksimal 255 karakter.',

                'visibility.required' => 'Visibility wajib diisi.',
                'visibility.boolean' => 'Visibility harus berupa true atau false.',
            ]
        );
    }

    public static function product($data, $isUpdate = false)
    {
        $baseRules = [
            'product_name' => 'required|string|max:255',
            'description' => 'required|string|min:50|max:255',
            'category_id' => 'required|string|exists:product_categories,id',
            'price' => 'required|numeric|min:0',
            'visibility' => 'required|boolean',
            'images.*' => 'image|mimes:jpg,jpeg,png|max:2048',
            'variants' => 'array',
        ];

        $baseRules['thumbnail'] = $isUpdate ? 'nullable|image|mimes:jpg,jpeg,png|max:2048' : 'required|image|mimes:jpg,jpeg,png|max:2048';

        $category = ProductCategory::find($data['category_id']);
        if ($category) {
            $categoryName = strtolower($category->category_name);
            if ($categoryName === 'Shirt') {
                $baseRules['variants'] = 'required|array|min:1';
                $baseRules['variants.*.size'] = 'required|string|max:50';
                $baseRules['variants.*.color'] = 'required|string|max:50';
                $baseRules['variants.*.stock'] = 'required|integer|min:0';
                $baseRules['variants.*.image'] = 'nullable|image|mimes:jpg,jpeg,png|max:2048';
            } elseif ($categoryName === 'Sticker') {
                $baseRules['variants'] = 'required|array|size:1';
                $baseRules['variants.0.size'] = 'nullable';
                $baseRules['variants.0.color'] = 'nullable';
                $baseRules['variants.0.stock'] = 'required|integer|min:0';
                $baseRules['variants.0.image'] = 'nullable';
            }
        }

        return Validator::make(
            $data,
            $baseRules,
            [
                'thumbnail.required' => 'Thumbnail produk wajib diisi.',
                'thumbnail.image' => 'Thumbnail harus berupa file gambar.',
                'thumbnail.mimes' => 'Thumbnail hanya boleh berformat jpg, jpeg, atau png.',
                'thumbnail.max' => 'Ukuran thumbnail maksimal 2MB.',

                'product_name.required' => 'Nama produk wajib diisi.',
                'product_name.string' => 'Nama produk harus berupa teks.',
                'product_name.max' => 'Nama produk maksimal 255 karakter.',

                'description.required' => 'Deskripsi produk wajib diisi.',
                'description.min' => 'Deskripsi produk minimal 50 karakter.',
                'description.max' => 'Deskripsi produk maksimal 255 karakter.',
                'description.string' => 'Deskripsi harus berupa teks.',

                'category_id.required' => 'Kategori produk wajib diisi.',
                'category_id.exists' => 'Kategori produk tidak valid.',

                'price.required' => 'Harga produk wajib diisi.',
                'price.numeric' => 'Harga produk harus berupa angka.',
                'price.min' => 'Harga produk minimal 0.',

                'visibility.required' => 'Visibility produk wajib diisi.',
                'visibility.boolean' => 'Visibility harus berupa true atau false.',

                'images.*.image' => 'Setiap gambar tambahan harus berupa file gambar.',
                'images.*.mimes' => 'Gambar tambahan hanya boleh berformat jpg, jpeg, atau png.',
                'images.*.max' => 'Ukuran gambar tambahan maksimal 2MB.',

                'variants.array' => 'Varian harus berupa array.',
                'variants.*.size.required' => 'Ukuran varian wajib diisi.',
                'variants.*.size.string' => 'Ukuran varian harus berupa teks.',
                'variants.*.size.max' => 'Ukuran varian maksimal 50 karakter.',
                'variants.*.color.required' => 'Warna varian wajib diisi.',
                'variants.*.color.string' => 'Warna varian harus berupa teks.',
                'variants.*.color.max' => 'Warna varian maksimal 50 karakter.',
                'variants.*.stock.required' => 'Stok varian wajib diisi.',
                'variants.*.stock.integer' => 'Stok varian harus berupa angka bulat.',
                'variants.*.stock.min' => 'Stok varian minimal 0.',
                'variants.*.image.image' => 'Image varian harus berupa file gambar.',
                'variants.*.image.mimes' => 'Image varian hanya boleh berformat jpg, jpeg, atau png.',
                'variants.*.image.max' => 'Ukuran image varian maksimal 2MB.',
            ]
        );
    }
}
