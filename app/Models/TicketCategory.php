<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property string $id
 * @property string $ticket_id
 * @property string $category_name
 * @property string $description
 * @property float $price
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class TicketCategory extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'ticket_categories';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'ticket_id',
        'category_name',
        'description',
        'price',
    ];

    protected $casts = [
        'price' => 'float',
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }

    public function orders()
    {
        return $this->hasMany(TicketOrder::class, 'ticket_category_id');
    }
}
