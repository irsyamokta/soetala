<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property string $id
 * @property string $transaction_id
 * @property string $ticket_id
 * @property string $ticket_category_id
 * @property string $buyer_name
 * @property string|null $phone
 * @property int $quantity
 * @property float $price
 * @property string|null $used_at
 * @property string|null $qr_code
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class TicketOrder extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'ticket_orders';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'transaction_id',
        'ticket_id',
        'ticket_category_id',
        'buyer_name',
        'phone',
        'quantity',
        'price',
        'used_at',
        'qr_code',
    ];

    protected $casts = [
        'price' => 'float',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }

    public function category()
    {
        return $this->belongsTo(TicketCategory::class, 'ticket_category_id');
    }
}
