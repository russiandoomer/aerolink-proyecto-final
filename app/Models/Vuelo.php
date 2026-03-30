<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vuelo extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'aerolinea_id',
        'avion_id',
        'ruta_id',
        'estado_vuelo_id',
        'codigo_vuelo',
        'fecha_salida',
        'fecha_llegada',
        'terminal',
        'puerta_embarque',
        'capacidad',
        'precio_base',
        'observaciones',
    ];

    protected $casts = [
        'fecha_salida' => 'datetime',
        'fecha_llegada' => 'datetime',
        'precio_base' => 'decimal:2',
    ];

    public function aerolinea(): BelongsTo
    {
        return $this->belongsTo(Aerolinea::class);
    }

    public function avion(): BelongsTo
    {
        return $this->belongsTo(Avion::class);
    }

    public function ruta(): BelongsTo
    {
        return $this->belongsTo(Ruta::class);
    }

    public function estadoVuelo(): BelongsTo
    {
        return $this->belongsTo(EstadoVuelo::class);
    }

    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }
}
