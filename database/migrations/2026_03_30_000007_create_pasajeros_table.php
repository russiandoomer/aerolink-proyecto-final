<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pasajeros', function (Blueprint $table) {
            $table->id();
            $table->string('nombres', 80);
            $table->string('apellidos', 80);
            $table->string('tipo_documento', 20);
            $table->string('numero_documento', 30)->unique();
            $table->date('fecha_nacimiento')->nullable();
            $table->string('nacionalidad', 80)->nullable();
            $table->string('telefono', 30)->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pasajeros');
    }
};
