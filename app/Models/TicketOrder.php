<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property string $id
 * @property string $transaction_id
 * @property string $ticket_id
 * @property string $buyer_name
 * @property string|null $phone
 * @property string $ticket_type
 * @property float $price
 * @property string|null $qr_code
 * @property \Carbon\Carbon $created_at
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
        'buyer_name',
        'phone',
        'ticket_type',
        'price',
        'qr_code',
    ];

    protected $casts = [
        'price' => 'float',
        'ticket_type' => 'string',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }
}
