<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Validator;

class ValidationHelper
{
    public static function ticket($data, $isUpdate = false)
    {
        $rules = [
            'category' => 'required|in:adult,child',
            'description' => 'required|string',
            'location' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
            'online_price' => 'required|numeric|min:0|max:100000',
            'offline_price' => 'required|numeric|min:0|max:100000',
            'requirement' => ['required', 'array'],
            'requirement.*' => ['string'],
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

                'category.required' => 'Kategori wajib diisi.',
                'category.in' => 'Kategori hanya boleh bernilai adult atau child.',

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

                'online_price.required' => 'Harga online wajib diisi.',
                'online_price.numeric' => 'Harga online harus berupa angka.',
                'online_price.min' => 'Harga online minimal 0.',
                'online_price.max' => 'Harga online maksimal 100.000.',

                'offline_price.required' => 'Harga offline wajib diisi.',
                'offline_price.numeric' => 'Harga offline harus berupa angka.',
                'offline_price.min' => 'Harga offline minimal 0.',
                'offline_price.max' => 'Harga offline maksimal 100.000.',

                'requirement.required' => 'Syarat wajib diisi.',
                'requirement.array' => 'Syarat harus berupa daftar teks.',
                'requirement.*.string' => 'Setiap syarat harus berupa teks.',

                'visibility.required' => 'Visibility wajib diisi.',
                'visibility.boolean' => 'Visibility harus berupa true atau false.',
            ]
        );
    }

    public static function diorama($data, $isUpdate = false)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:200|max:265',
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
                'description.min' => 'Deskripsi minimal 265 karakter.',
                'description.max' => 'Deskripsi maksimal 265 karakter.',

                'author.required' => 'Pelukis wajib diisi.',
                'author.max' => 'Pelukis maksimal 255 karakter.',

                'visibility.required' => 'Visibility wajib diisi.',
                'visibility.boolean' => 'Visibility harus berupa true atau false.',
            ]
        );
    }

    public static function product($data, $isUpdate = false)
    {
        $rules = [
            'product_name'  => 'required|string|max:255',
            'description'   => 'required|string|min:50|max:255',
            'category_id'   => 'required|string|exists:product_categories,id',
            'price'         => 'required|numeric|min:0',
            'visibility'    => 'required|boolean',
            'images.*'      => 'image|mimes:jpg,jpeg,png|max:2048',
            'variants'      => 'array',
            'variants.*.size'  => 'required|string|max:50',
            'variants.*.color' => 'required|string|max:50',
            'variants.*.stock' => 'required|numeric|min:0',
        ];

        $rules['thumbnail'] = $isUpdate
            ? 'nullable|image|mimes:jpg,jpeg,png|max:2048'
            : 'required|image|mimes:jpg,jpeg,png|max:2048';

        return Validator::make(
            $data,
            $rules,
            [
                'thumbnail.required' => 'Thumbnail produk wajib diisi.',
                'thumbnail.image'    => 'Thumbnail harus berupa file gambar.',
                'thumbnail.mimes'    => 'Thumbnail hanya boleh berformat jpg, jpeg, atau png.',
                'thumbnail.max'      => 'Ukuran thumbnail maksimal 2MB.',

                'product_name.required' => 'Nama produk wajib diisi.',
                'product_name.string'   => 'Nama produk harus berupa teks.',
                'product_name.max'      => 'Nama produk maksimal 255 karakter.',

                'description.required' => 'Deskripsi produk wajib diisi.',
                'description.min'      => 'Deskripsi produk minimal 500 karakter.',
                'description.max'      => 'Deskripsi produk maksimal 255 karakter.',
                'description.string' => 'Deskripsi harus berupa teks.',

                'category_id.required' => 'Kategori produk wajib diisi.',
                'category_id.exists'   => 'Kategori produk tidak valid.',

                'price.required' => 'Harga produk wajib diisi.',
                'price.numeric'  => 'Harga produk harus berupa angka.',
                'price.min'      => 'Harga produk minimal 0.',

                'visibility.required' => 'Visibility produk wajib diisi.',
                'visibility.boolean'  => 'Visibility harus berupa true atau false.',

                'images.*.image' => 'Setiap gambar tambahan harus berupa file gambar.',
                'images.*.mimes' => 'Gambar tambahan hanya boleh berformat jpg, jpeg, atau png.',
                'images.*.max'   => 'Ukuran gambar tambahan maksimal 2MB.',

                'variants.array'         => 'Varian harus berupa array.',
                'variants.*.size.required' => 'Ukuran varian wajib diisi.',
                'variants.*.size.string' => 'Ukuran varian harus berupa teks.',
                'variants.*.size.max'    => 'Ukuran varian maksimal 50 karakter.',
                'variants.*.color.required' => 'Warna varian wajib diisi.',
                'variants.*.color.string' => 'Warna varian harus berupa teks.',
                'variants.*.color.max'   => 'Warna varian maksimal 50 karakter.',
                'variants.*.stock.required' => 'Stok varian wajib diisi.',
                'variants.*.stock.numeric' => 'Stok varian harus berupa angka.',
                'variants.*.stock.min'    => 'Stok varian minimal 0.',
            ]
        );
    }
}
