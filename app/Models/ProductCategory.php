<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property string $id
 * @property string $category_name
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class ProductCategory extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'product_categories';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'category_name',
    ];

    public function products()
    {
        return $this->hasMany(Product::class, 'category_id');
    }
}
