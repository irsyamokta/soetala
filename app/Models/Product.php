<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property string $id
 * @property string $thumbnail
 * @property string $public_id
 * @property string|null $category_id
 * @property string $product_name
 * @property string|null $description
 * @property float $price
 * @property bool $visibility
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Product extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'products';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'category_id',
        'thumbnail',
        'public_id',
        'product_name',
        'description',
        'price',
        'visibility',
    ];

    protected $casts = [
        'price' => 'float',
        'visibility' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class, 'product_id');
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'product_id');
    }
}
