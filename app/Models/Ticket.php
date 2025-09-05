<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;


/**
 * @property string $id
 * @property string $thumbnail
 * @property string $title
 * @property string $public_id
 * @property string $description
 * @property string $location
 * @property \Carbon\Carbon $start_date
 * @property \Carbon\Carbon $end_date
 * @property string $start_time
 * @property string $end_time
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
        'title',
        'public_id',
        'description',
        'location',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'visibility',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'start_time' => 'string',
        'end_time' => 'string',
        'visibility' => 'boolean',
    ];

    public function categories()
    {
        return $this->hasMany(TicketCategory::class, 'ticket_id');
    }

    public function ticketOrders()
    {
        return $this->hasMany(TicketOrder::class, 'ticket_id');
    }
}
