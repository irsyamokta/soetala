<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property string $id
 * @property string $user_id
 * @property string|null $responsible_id
 * @property string $type
 * @property string $channel
 * @property float $total_price
 * @property string|null $payment_method
 * @property string $status
 * @property string $pickup_status
 * @property string|null $snap_token
 * @property \Carbon\Carbon $snap_token_expired_at
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
        'type',
        'channel',
        'total_price',
        'payment_method',
        'status',
        'pickup_status',
        'snap_token',
        'snap_token_expired_at',
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
