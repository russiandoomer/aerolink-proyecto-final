<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Avion extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'aerolinea_id',
        'matricula',
        'modelo',
        'fabricante',
        'capacidad',
        'alcance_km',
        'estado',
        'ultimo_mantenimiento',
    ];

    protected $casts = [
        'ultimo_mantenimiento' => 'date',
    ];

    public function aerolinea(): BelongsTo
    {
        return $this->belongsTo(Aerolinea::class);
    }

    public function vuelos(): HasMany
    {
        return $this->hasMany(Vuelo::class);
    }
}
