<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Aerolinea extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nombre',
        'codigo_iata',
        'pais',
        'telefono',
        'email',
        'activa',
    ];

    protected $casts = [
        'activa' => 'boolean',
    ];

    public function aviones(): HasMany
    {
        return $this->hasMany(Avion::class);
    }

    public function vuelos(): HasMany
    {
        return $this->hasMany(Vuelo::class);
    }
}
