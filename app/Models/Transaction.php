<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property string $id
 * @property string $user_id
 * @property string|null $responsible_id
 * @property string|null $buyer_name
 * @property string $type
 * @property string $channel
 * @property float $total_price
 * @property string|null $payment_method
 * @property string $status
 * @property string $pickup_status
 * @property string|null $checkout_url
 * @property string|null $reference
 * @property array|null $raw_response
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
        'responsible_id',
        'buyer_name',
        'type',
        'channel',
        'total_price',
        'payment_method',
        'status',
        'pickup_status',
        'checkout_url',
        'reference',
        'raw_response',
    ];

    protected $casts = [
        'total_price' => 'float',
        'type' => 'string',
        'channel' => 'string',
        'status' => 'string',
        'snap_token_expired_at' => 'datetime',
        'raw_response' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function responsible()
    {
        return $this->belongsTo(User::class, 'responsible_id');
    }

    public function items()
    {
        return $this->hasMany(TransactionItem::class, 'transaction_id');
    }

    public function ticketOrders()
    {
        return $this->hasMany(TicketOrder::class, 'transaction_id');
    }
}
