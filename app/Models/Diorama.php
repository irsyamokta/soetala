<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property string $id
 * @property string|null $thumbnail
 * @property string|null $public_id
 * @property string $title
 * @property string|null $description
 * @property string|null $author
 * @property bool $visibility
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Diorama extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'dioramas';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'thumbnail',
        'public_id',
        'title',
        'description',
        'author',
        'visibility',
    ];

    protected $casts = [
        'visibility' => 'boolean',
    ];
}
