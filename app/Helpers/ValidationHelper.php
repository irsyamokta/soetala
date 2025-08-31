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
            'description' => 'required|string|min:265|max:265',
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

                'author.required' => 'Penulis wajib diisi.',
                'author.max' => 'Penulis maksimal 255 karakter.',

                'visibility.required' => 'Visibility wajib diisi.',
                'visibility.boolean' => 'Visibility harus berupa true atau false.',
            ]
        );
    }
}
