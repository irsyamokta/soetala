<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property string $id
 * @property string $transaction_id
 * @property string $item_type
 * @property string $item_name
 * @property string $item_id
 * @property int $quantity
 * @property float $price
 * @property array|null $variant_details
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class TransactionItem extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'transaction_items';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'transaction_id',
        'item_type',
        'item_name',
        'item_id',
        'quantity',
        'price',
        'variant_details',
    ];

    protected $casts = [
        'price' => 'float',
        'quantity' => 'integer',
        'item_type' => 'string',
        'variant_details' => 'array',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
