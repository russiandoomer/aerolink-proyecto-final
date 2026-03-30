<?php

use App\Models\Aerolinea;
use App\Models\Avion;
use App\Models\Pasajero;
use App\Models\Reserva;
use App\Models\Ruta;
use App\Models\Vuelo;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

Route::get('/', function () {
    $tableExists = static fn (string $table): bool => Schema::hasTable($table);

    return view('welcome', [
        'frontendUrl' => env('FRONTEND_URL', 'http://127.0.0.1:5173'),
        'apiUrl' => url('/api/dashboard/resumen'),
        'stats' => [
            [
                'label' => 'Vuelos registrados',
                'value' => $tableExists('vuelos') ? Vuelo::count() : 0,
                'detail' => 'Operacion general del sistema',
            ],
            [
                'label' => 'Reservas cargadas',
                'value' => $tableExists('reservas') ? Reserva::count() : 0,
                'detail' => 'Base comercial simulada',
            ],
            [
                'label' => 'Pasajeros',
                'value' => $tableExists('pasajeros') ? Pasajero::count() : 0,
                'detail' => 'Registros disponibles',
            ],
            [
                'label' => 'Rutas activas',
                'value' => $tableExists('rutas') ? Ruta::where('activa', true)->count() : 0,
                'detail' => 'Trayectos listos para operar',
            ],
            [
                'label' => 'Flota operativa',
                'value' => $tableExists('aviones') ? Avion::where('estado', 'activo')->count() : 0,
                'detail' => 'Aviones activos',
            ],
            [
                'label' => 'Aerolineas',
                'value' => $tableExists('aerolineas') ? Aerolinea::count() : 0,
                'detail' => 'Operadores registrados',
            ],
        ],
    ]);
})->name('dashboard');

Route::get('/inicio', function () {
    return redirect()->route('dashboard');
});

Route::get('/saludo', function () {
    return 'AeroLink API lista para operar.';
});

Route::get('/estado-api', function () {
    return response()->json([
        'status' => 'ok',
        'project' => 'AeroLink',
        'frontend_url' => env('FRONTEND_URL', 'http://127.0.0.1:5173'),
        'api_dashboard' => url('/api/dashboard/resumen'),
    ]);
});
