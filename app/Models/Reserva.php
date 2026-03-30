<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reserva extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vuelo_id',
        'pasajero_id',
        'user_id',
        'codigo_reserva',
        'fecha_reserva',
        'asiento',
        'clase',
        'estado',
        'precio_total',
        'equipaje_registrado',
        'observaciones',
    ];

    protected $casts = [
        'fecha_reserva' => 'datetime',
        'precio_total' => 'decimal:2',
        'equipaje_registrado' => 'boolean',
    ];

    public function vuelo(): BelongsTo
    {
        return $this->belongsTo(Vuelo::class);
    }

    public function pasajero(): BelongsTo
    {
        return $this->belongsTo(Pasajero::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
