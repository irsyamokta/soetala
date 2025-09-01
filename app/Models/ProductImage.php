<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property string $id
 * @property string $product_id
 * @property string $image
 * @property string $public_id
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class ProductImage extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'product_images';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'product_id',
        'image',
        'public_id',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
