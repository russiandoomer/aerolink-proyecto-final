<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aviones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aerolinea_id')->constrained('aerolineas')->cascadeOnUpdate();
            $table->string('matricula', 20)->unique();
            $table->string('modelo', 80);
            $table->string('fabricante', 80);
            $table->unsignedSmallInteger('capacidad');
            $table->unsignedInteger('alcance_km')->nullable();
            $table->enum('estado', ['activo', 'mantenimiento', 'fuera_servicio'])->default('activo');
            $table->date('ultimo_mantenimiento')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aviones');
    }
};
