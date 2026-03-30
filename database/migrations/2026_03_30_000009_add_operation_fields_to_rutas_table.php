<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rutas', function (Blueprint $table) {
            $table->string('tipo_operacion', 20)->default('nacional')->after('tarifa_base');
            $table->string('frecuencia_referencial', 40)->nullable()->after('tipo_operacion');
        });

        $routes = DB::table('rutas')
            ->join('aeropuertos as origen', 'origen.id', '=', 'rutas.aeropuerto_origen_id')
            ->join('aeropuertos as destino', 'destino.id', '=', 'rutas.aeropuerto_destino_id')
            ->select([
                'rutas.id',
                'origen.pais as pais_origen',
                'destino.pais as pais_destino',
            ])
            ->get();

        foreach ($routes as $route) {
            $isDomestic = $route->pais_origen === $route->pais_destino;

            DB::table('rutas')
                ->where('id', $route->id)
                ->update([
                    'tipo_operacion' => $isDomestic ? 'nacional' : 'internacional',
                    'frecuencia_referencial' => $isDomestic ? 'Diaria' : 'Interdiaria',
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('rutas', function (Blueprint $table) {
            $table->dropColumn(['tipo_operacion', 'frecuencia_referencial']);
        });
    }
};
