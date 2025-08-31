<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;


/**
 * @property string $id
 * @property string|null $thumbnail
 * @property string|null $public_id
 * @property string $category
 * @property string|null $description
 * @property string|null $location
 * @property \Carbon\Carbon|null $start_date
 * @property \Carbon\Carbon|null $end_date
 * @property string|null $start_time
 * @property string|null $end_time
 * @property float $online_price
 * @property float $offline_price
 * @property array $requirement
 * @property bool $visibility
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Ticket extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'tickets';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'thumbnail',
        'public_id',
        'category',
        'description',
        'location',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'online_price',
        'offline_price',
        'requirement',
        'visibility',
    ];

    protected $casts = [
        'online_price' => 'float',
        'offline_price' => 'float',
        'start_date' => 'date',
        'end_date' => 'date',
        'start_time' => 'string',
        'end_time' => 'string',
        'visibility' => 'boolean',
        'requirement' => 'array',
    ];

    public function ticketOrders()
    {
        return $this->hasMany(TicketOrder::class, 'ticket_id');
    }
}
