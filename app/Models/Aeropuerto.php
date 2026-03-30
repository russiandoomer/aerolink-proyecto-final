<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Aeropuerto extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'codigo_iata',
        'codigo_icao',
        'ciudad',
        'pais',
        'latitud',
        'longitud',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function rutasOrigen(): HasMany
    {
        return $this->hasMany(Ruta::class, 'aeropuerto_origen_id');
    }

    public function rutasDestino(): HasMany
    {
        return $this->hasMany(Ruta::class, 'aeropuerto_destino_id');
    }
}
