<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property string $id
 * @property string $transaction_id
 * @property string $item_type
 * @property string $item_id
 * @property int $quantity
 * @property float $price
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
        'item_id',
        'quantity',
        'price',
    ];

    protected $casts = [
        'price' => 'float',
        'quantity' => 'integer',
        'item_type' => 'string',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }
}
