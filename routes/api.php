<?php

use App\Http\Controllers\Api\AerolineaController;
use App\Http\Controllers\Api\AeropuertoController;
use App\Http\Controllers\Api\AvionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EstadoVueloController;
use App\Http\Controllers\Api\PasajeroController;
use App\Http\Controllers\Api\ReservaController;
use App\Http\Controllers\Api\RutaController;
use App\Http\Controllers\Api\VueloController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/dashboard/resumen', [DashboardController::class, 'resumen']);
Route::get('/aeropuertos/catalogo', [AeropuertoController::class, 'catalogo']);

Route::apiResource('aerolineas', AerolineaController::class)->only(['index', 'show']);
Route::apiResource('aeropuertos', AeropuertoController::class)->only(['index', 'show']);
Route::apiResource('aviones', AvionController::class)->only(['index', 'show']);
Route::apiResource('rutas', RutaController::class)->only(['index', 'show']);
Route::get('/estados-vuelo', [EstadoVueloController::class, 'index']);
Route::get('/estados-vuelo/{estadoVuelo}', [EstadoVueloController::class, 'show']);
Route::apiResource('vuelos', VueloController::class)->only(['index', 'show']);
Route::apiResource('pasajeros', PasajeroController::class)->only(['index', 'show']);
Route::apiResource('reservas', ReservaController::class)->only(['index', 'show']);

Route::middleware('api.key')->group(function () {
    Route::apiResource('aerolineas', AerolineaController::class)->except(['index', 'show']);
    Route::apiResource('aeropuertos', AeropuertoController::class)->except(['index', 'show']);
    Route::apiResource('aviones', AvionController::class)->except(['index', 'show']);
    Route::apiResource('rutas', RutaController::class)->except(['index', 'show']);
    Route::apiResource('vuelos', VueloController::class)->except(['index', 'show']);
    Route::patch('/vuelos/{vuelo}/estado', [VueloController::class, 'cambiarEstado']);
    Route::apiResource('pasajeros', PasajeroController::class)->except(['index', 'show']);
    Route::apiResource('reservas', ReservaController::class)->except(['index', 'show']);
});
