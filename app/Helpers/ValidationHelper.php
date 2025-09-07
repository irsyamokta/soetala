<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Validator;
use App\Models\ProductCategory;

class ValidationHelper
{

    public static function user($data, $isUpdate = false)
    {
        $rules = [
            'avatar' => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
            'phone' => 'required|string|max:15|unique:users',
            'gender' => 'required|string|in:Laki-laki,Perempuan',
            'role' => 'required|string|in:admin,volunteer,visitor',
        ];

        return Validator::make(
            $data,
            $rules,
            [
                'avatar.required' => 'Foto profil wajib diisi.',
                'avatar.image' => 'Foto profil harus berupa gambar.',
                'avatar.mimes' => 'Foto profil harus berupa gambar dengan ekstensi jpg, jpeg, atau png.',
                'avatar.max' => 'Foto profil maksimal 2MB.',

                'name.required' => 'Nama wajib diisi.',
                'name.string' => 'Nama harus berupa teks.',
                'name.max' => 'Nama maksimal 255 karakter.',

                'email.required' => 'Email wajib diisi.',
                'email.string' => 'Email harus berupa teks.',
                'email.email' => 'Format email tidak valid.',
                'email.max' => 'Email maksimal 255 karakter.',
                'email.unique' => 'Email sudah terdaftar.',

                'password.required' => 'Kata sandi wajib diisi.',
                'password.string' => 'Kata sandi harus berupa teks.',
                'password.min' => 'Kata sandi minimal 8 karakter.',
                'password.regex' => 'Kata sandi harus mengandung setidaknya satu huruf besar, satu huruf kecil, satu angka, dan satu karakter khusus (@$!%*?&).',

                'phone.required' => 'Nomor telepon wajib diisi.',
                'phone.string' => 'Nomor telepon harus berupa teks.',
                'phone.max' => 'Nomor telepon maksimal 15 karakter.',
                'phone.unique' => 'Nomor telepon sudah terdaftar.',

                'gender.required' => 'Jenis kelamin wajib diisi.',
                'gender.string' => 'Jenis kelamin harus berupa teks.',
                'gender.in' => 'Jenis kelamin harus Laki-laki atau Perempuan.',

                'role.required' => 'Role wajib diisi.',
                'role.string' => 'Role harus berupa teks.',
                'role.in' => 'Role harus admin, volunteer, atau visitor.',
            ]
        );
    }

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

    public static function transaction($data, $isUpdate = false)
    {
        $rules = [
            'buyer_name' => 'required|string|max:255',
            'payment_method' => 'required|in:cash,qris',
            'total_price' => 'required|numeric|min:0',
            'type' => 'required|in:ticket,merchandise,mixed',
            'channel' => 'required|in:offline',

            'items' => 'required|array|min:1',
            'items.*.item_type' => 'required|in:ticket,product',
            'items.*.item_id' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.color' => 'nullable|string',
            'items.*.size' => 'nullable|string',
            'items.*.note' => 'nullable|string',
            'items.*.variantKey' => 'nullable|string',

            'ticket_details' => 'required_if:type,ticket,mixed|array',
            'ticket_details.*.ticket_category_id' => 'required_if:type,ticket,mixed|exists:ticket_categories,id',
            'ticket_details.*.buyer_name' => 'required_if:type,ticket,mixed|string|max:255',
            'ticket_details.*.price' => 'required_if:type,ticket,mixed|numeric|min:0',
            'ticket_details.*.quantity' => 'required_if:type,ticket,mixed|integer|min:1',
        ];

        return Validator::make(
            $data,
            $rules,
            [
                'buyer_name.required' => 'Nama pembeli wajib diisi.',
                'buyer_name.string' => 'Nama pembeli harus berupa teks.',
                'buyer_name.max' => 'Nama pembeli maksimal 255 karakter.',

                'payment_method.required' => 'Metode pembayaran wajib dipilih.',
                'payment_method.in' => 'Metode pembayaran tidak valid.',

                'total_price.required' => 'Total harga wajib diisi.',
                'total_price.numeric' => 'Total harga harus berupa angka.',
                'total_price.min' => 'Total harga minimal 0.',

                'type.required' => 'Tipe transaksi wajib diisi.',
                'type.in' => 'Tipe transaksi tidak valid.',

                'channel.required' => 'Channel wajib diisi.',
                'channel.in' => 'Channel tidak valid.',

                'items.required' => 'Items wajib diisi minimal 1.',
                'items.array' => 'Items harus berupa array.',
                'items.min' => 'Minimal harus ada 1 item.',

                'items.*.item_type.required' => 'Tipe item wajib diisi.',
                'items.*.item_type.in' => 'Tipe item tidak valid.',
                'items.*.item_id.required' => 'ID item wajib diisi.',
                'items.*.quantity.required' => 'Jumlah item wajib diisi.',
                'items.*.quantity.integer' => 'Jumlah item harus berupa angka bulat.',
                'items.*.quantity.min' => 'Jumlah item minimal 1.',
                'items.*.price.required' => 'Harga item wajib diisi.',
                'items.*.price.numeric' => 'Harga item harus berupa angka.',
                'items.*.price.min' => 'Harga item minimal 0.',

                'ticket_details.required_if' => 'Detail tiket wajib diisi jika type adalah ticket atau mixed.',
                'ticket_details.array' => 'Detail tiket harus berupa array.',

                'ticket_details.*.ticket_category_id.required_if' => 'Kategori tiket wajib diisi.',
                'ticket_details.*.ticket_category_id.exists' => 'Kategori tiket tidak ditemukan.',

                'ticket_details.*.buyer_name.required_if' => 'Nama pembeli tiket wajib diisi.',
                'ticket_details.*.buyer_name.string' => 'Nama pembeli tiket harus berupa teks.',
                'ticket_details.*.buyer_name.max' => 'Nama pembeli tiket maksimal 255 karakter.',

                'ticket_details.*.price.required_if' => 'Harga tiket wajib diisi.',
                'ticket_details.*.price.numeric' => 'Harga tiket harus berupa angka.',
                'ticket_details.*.price.min' => 'Harga tiket minimal 0.',

                'ticket_details.*.quantity.required_if' => 'Jumlah tiket wajib diisi.',
                'ticket_details.*.quantity.integer' => 'Jumlah tiket harus berupa angka bulat.',
                'ticket_details.*.quantity.min' => 'Jumlah tiket minimal 1.',
            ]
        );
    }
}
