<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Avion;
use App\Models\EstadoVuelo;
use App\Models\Pasajero;
use App\Models\Reserva;
use App\Models\Ruta;
use App\Models\Vuelo;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function resumen(): JsonResponse
    {
        $totales = [
            'vuelos' => Vuelo::count(),
            'pasajeros' => Pasajero::count(),
            'reservas' => Reserva::count(),
            'flota_activa' => Avion::where('estado', 'activo')->count(),
        ];

        $vuelosPorEstado = EstadoVuelo::query()
            ->withCount('vuelos')
            ->orderBy('orden')
            ->get(['id', 'nombre', 'codigo', 'color']);

        $reservasPorClase = Reserva::query()
            ->selectRaw('clase, COUNT(*) as total')
            ->groupBy('clase')
            ->orderBy('clase')
            ->get();

        $ocupacionVuelos = Vuelo::query()
            ->with([
                'estadoVuelo:id,nombre,color',
                'ruta:id,codigo,aeropuerto_origen_id,aeropuerto_destino_id',
                'ruta.aeropuertoOrigen:id,codigo_iata,ciudad',
                'ruta.aeropuertoDestino:id,codigo_iata,ciudad',
            ])
            ->withCount([
                'reservas as reservas_activas_count' => fn ($query) => $query->where('estado', '!=', 'cancelada'),
            ])
            ->orderByDesc('fecha_salida')
            ->limit(6)
            ->get()
            ->map(function (Vuelo $vuelo) {
                $ruta = $vuelo->ruta;
                $origen = $ruta?->aeropuertoOrigen;
                $destino = $ruta?->aeropuertoDestino;
                $estado = $vuelo->estadoVuelo;
                $porcentaje = $vuelo->capacidad > 0
                    ? round(($vuelo->reservas_activas_count / $vuelo->capacidad) * 100, 1)
                    : 0;

                return [
                    'id' => $vuelo->id,
                    'codigo_vuelo' => $vuelo->codigo_vuelo,
                    'ruta' => ($origen?->codigo_iata ?? 'N/D') . ' - ' . ($destino?->codigo_iata ?? 'N/D'),
                    'estado' => $estado?->nombre ?? 'Sin estado',
                    'color' => $estado?->color ?? 'slate',
                    'capacidad' => $vuelo->capacidad,
                    'reservas_activas' => $vuelo->reservas_activas_count,
                    'ocupacion_porcentaje' => $porcentaje,
                ];
            });

        $rutasMasUsadas = Ruta::query()
            ->with([
                'aeropuertoOrigen:id,codigo_iata,ciudad',
                'aeropuertoDestino:id,codigo_iata,ciudad',
            ])
            ->withCount('vuelos')
            ->orderByDesc('vuelos_count')
            ->limit(5)
            ->get()
            ->map(function (Ruta $ruta) {
                $origen = $ruta->aeropuertoOrigen;
                $destino = $ruta->aeropuertoDestino;

                return [
                    'id' => $ruta->id,
                    'codigo' => $ruta->codigo,
                    'origen' => $origen?->codigo_iata ?? 'N/D',
                    'destino' => $destino?->codigo_iata ?? 'N/D',
                    'ciudad_origen' => $origen?->ciudad ?? 'Sin ciudad',
                    'ciudad_destino' => $destino?->ciudad ?? 'Sin ciudad',
                    'total_vuelos' => $ruta->vuelos_count,
                ];
            });

        $proximosVuelos = Vuelo::query()
            ->with([
                'estadoVuelo:id,nombre,color',
                'ruta:id,aeropuerto_origen_id,aeropuerto_destino_id',
                'ruta.aeropuertoOrigen:id,codigo_iata,ciudad',
                'ruta.aeropuertoDestino:id,codigo_iata,ciudad',
            ])
            ->where('fecha_salida', '>=', now())
            ->orderBy('fecha_salida')
            ->limit(5)
            ->get()
            ->map(function (Vuelo $vuelo) {
                $ruta = $vuelo->ruta;
                $origen = $ruta?->aeropuertoOrigen;
                $destino = $ruta?->aeropuertoDestino;
                $estado = $vuelo->estadoVuelo;

                return [
                    'id' => $vuelo->id,
                    'codigo_vuelo' => $vuelo->codigo_vuelo,
                    'fecha_salida' => $vuelo->fecha_salida,
                    'origen' => $origen?->codigo_iata ?? 'N/D',
                    'destino' => $destino?->codigo_iata ?? 'N/D',
                    'estado' => $estado?->nombre ?? 'Sin estado',
                    'color' => $estado?->color ?? 'slate',
                ];
            });

        return response()->json([
            'data' => [
                'totales' => $totales,
                'vuelos_por_estado' => $vuelosPorEstado,
                'reservas_por_clase' => $reservasPorClase,
                'ocupacion_vuelos' => $ocupacionVuelos,
                'rutas_mas_usadas' => $rutasMasUsadas,
                'proximos_vuelos' => $proximosVuelos,
            ],
        ]);
    }
}
