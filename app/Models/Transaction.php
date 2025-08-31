<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property string $id
 * @property string $user_id
 * @property string $type
 * @property string $channel
 * @property float $total_price
 * @property string|null $payment_method
 * @property string $status
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Transaction extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'transactions';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'type',
        'channel',
        'total_price',
        'payment_method',
        'status',
    ];

    protected $casts = [
        'total_price' => 'float',
        'type' => 'string',
        'channel' => 'string',
        'status' => 'string',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function transactionItems()
    {
        return $this->hasMany(TransactionItem::class, 'transaction_id');
    }

    public function ticketOrders()
    {
        return $this->hasMany(TicketOrder::class, 'transaction_id');
    }
}
