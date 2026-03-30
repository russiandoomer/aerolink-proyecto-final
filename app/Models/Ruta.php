<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ruta extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'codigo',
        'aeropuerto_origen_id',
        'aeropuerto_destino_id',
        'distancia_km',
        'duracion_minutos',
        'tarifa_base',
        'tipo_operacion',
        'frecuencia_referencial',
        'activa',
    ];

    protected $casts = [
        'distancia_km' => 'decimal:2',
        'tarifa_base' => 'decimal:2',
        'activa' => 'boolean',
    ];

    public function aeropuertoOrigen(): BelongsTo
    {
        return $this->belongsTo(Aeropuerto::class, 'aeropuerto_origen_id');
    }

    public function aeropuertoDestino(): BelongsTo
    {
        return $this->belongsTo(Aeropuerto::class, 'aeropuerto_destino_id');
    }

    public function vuelos(): HasMany
    {
        return $this->hasMany(Vuelo::class);
    }
}
