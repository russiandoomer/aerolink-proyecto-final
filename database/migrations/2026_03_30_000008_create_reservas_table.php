<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vuelo_id')->constrained('vuelos')->cascadeOnUpdate();
            $table->foreignId('pasajero_id')->constrained('pasajeros')->cascadeOnUpdate();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('codigo_reserva', 20)->unique();
            $table->dateTime('fecha_reserva');
            $table->string('asiento', 10)->nullable();
            $table->enum('clase', ['economica', 'ejecutiva'])->default('economica');
            $table->enum('estado', ['confirmada', 'pendiente', 'cancelada'])->default('confirmada');
            $table->decimal('precio_total', 10, 2);
            $table->boolean('equipaje_registrado')->default(false);
            $table->string('observaciones')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['vuelo_id', 'estado'], 'reservas_vuelo_estado_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
