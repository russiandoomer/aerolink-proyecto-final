<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EstadoVuelo extends Model
{
    use HasFactory;

    protected $table = 'estados_vuelo';

    protected $fillable = [
        'nombre',
        'codigo',
        'color',
        'orden',
        'descripcion',
    ];

    public function vuelos(): HasMany
    {
        return $this->hasMany(Vuelo::class);
    }
}
