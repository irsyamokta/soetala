<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Admin User',
                'phone' => '081234567891',
                'gender' => 'Laki-laki',
                'password' => Hash::make('Password123!'),
                'email_verified_at' => now(),
                'role' => 'admin',
                'avatar' => null,
            ]
        );

        $admin->assignRole('admin');

        // Visitor
        $vsitor = User::updateOrCreate(
            ['email' => 'visitor@example.com'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Visitor User',
                'phone' => '081234567892',
                'gender' => 'Perempuan',
                'password' => Hash::make('Password123!'),
                'email_verified_at' => now(),
                'role' => 'visitor',
                'avatar' => null,
            ]
        );

        $vsitor->assignRole('visitor');
    }
}
