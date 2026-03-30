<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rutas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 20)->unique();
            $table->foreignId('aeropuerto_origen_id')->constrained('aeropuertos')->cascadeOnUpdate();
            $table->foreignId('aeropuerto_destino_id')->constrained('aeropuertos')->cascadeOnUpdate();
            $table->decimal('distancia_km', 8, 2);
            $table->unsignedSmallInteger('duracion_minutos');
            $table->decimal('tarifa_base', 10, 2)->default(0);
            $table->boolean('activa')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(
                ['aeropuerto_origen_id', 'aeropuerto_destino_id'],
                'rutas_origen_destino_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rutas');
    }
};
