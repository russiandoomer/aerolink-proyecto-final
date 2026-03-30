<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vuelos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aerolinea_id')->constrained('aerolineas')->cascadeOnUpdate();
            $table->foreignId('avion_id')->constrained('aviones')->cascadeOnUpdate();
            $table->foreignId('ruta_id')->constrained('rutas')->cascadeOnUpdate();
            $table->foreignId('estado_vuelo_id')->constrained('estados_vuelo')->cascadeOnUpdate();
            $table->string('codigo_vuelo', 20)->unique();
            $table->dateTime('fecha_salida');
            $table->dateTime('fecha_llegada');
            $table->string('terminal', 20)->nullable();
            $table->string('puerta_embarque', 20)->nullable();
            $table->unsignedSmallInteger('capacidad');
            $table->decimal('precio_base', 10, 2)->default(0);
            $table->string('observaciones')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['fecha_salida', 'estado_vuelo_id'], 'vuelos_fecha_estado_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vuelos');
    }
};
