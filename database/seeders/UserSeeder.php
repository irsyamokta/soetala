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

        // Visitor 1
        $vsitor1 = User::updateOrCreate(
            ['email' => 'visitor1@example.com'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Visitor 1',
                'phone' => '081094567892',
                'gender' => 'Perempuan',
                'password' => Hash::make('Password123!'),
                'email_verified_at' => now(),
                'role' => 'visitor',
                'avatar' => null,
            ]
        );

        $vsitor1->assignRole('visitor');

        // Visitor 2
        $vsitor2 = User::updateOrCreate(
            ['email' => 'visitor2@example.com'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Visitor 2',
                'phone' => '081287567892',
                'gender' => 'Laki-laki',
                'password' => Hash::make('Password123!'),
                'email_verified_at' => now(),
                'role' => 'visitor',
                'avatar' => null,
            ]
        );

        $vsitor2->assignRole('visitor');

        // Volunteer 1
        $volunteer1 = User::updateOrCreate(
            ['email' => 'volunteer1@example.com'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Volunteer 1',
                'phone' => '081234567894',
                'gender' => 'Laki-laki',
                'password' => Hash::make('Password123!'),
                'email_verified_at' => now(),
                'role' => 'volunteer',
                'avatar' => null,
            ]
        );

        $volunteer1->assignRole('volunteer');

        // Volunteer 2
        $volunteer2 = User::updateOrCreate(
            ['email' => 'volunteer2@example.com'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Volunteer 2',
                'phone' => '081234567890',
                'gender' => 'Perempuan',
                'password' => Hash::make('Password123!'),
                'email_verified_at' => now(),
                'role' => 'volunteer',
                'avatar' => null,
            ]
        );

        $volunteer2->assignRole('volunteer');
    }
}
