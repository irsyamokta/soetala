<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        // Permissions
        Permission::firstOrCreate(['name' => 'view dashboard']);
        Permission::firstOrCreate(['name' => 'manage users']);
        Permission::firstOrCreate(['name' => 'view self profile']);

        // Roles
        $admin   = Role::firstOrCreate(['name' => 'admin']);
        $visitor  = Role::firstOrCreate(['name' => 'visitor']);

        // Grant permissions
        $admin->givePermissionTo(['view dashboard', 'manage users']);
        $visitor->givePermissionTo(['view self profile']);
    }
}
