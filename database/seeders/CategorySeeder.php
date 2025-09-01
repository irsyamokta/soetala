<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\ProductCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ProductCategory::updateOrCreate(
            [
                'id' => (string) Str::uuid(),
                'category_name' => 'Shirt',
            ]
        );

        ProductCategory::updateOrCreate(
            [
                'id' => (string) Str::uuid(),
                'category_name' => 'Tumblr',
            ]
        );

        ProductCategory::updateOrCreate(
            [
                'id' => (string) Str::uuid(),
                'category_name' => 'Key Chain',
            ]
        );
    }
}
