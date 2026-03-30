<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aerolinea;
use App\Models\Avion;
use App\Models\Ruta;
use App\Models\Vuelo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class VueloController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Vuelo::query()
            ->with([
                'aerolinea:id,nombre,codigo_iata,pais',
                'avion:id,matricula,modelo',
                'estadoVuelo:id,nombre,color,codigo',
                'ruta:id,codigo,tipo_operacion,frecuencia_referencial,distancia_km,aeropuerto_origen_id,aeropuerto_destino_id',
                'ruta.aeropuertoOrigen:id,nombre,codigo_iata,ciudad,pais,latitud,longitud',
                'ruta.aeropuertoDestino:id,nombre,codigo_iata,ciudad,pais,latitud,longitud',
            ])
            ->withCount([
                'reservas',
                'reservas as reservas_activas_count' => fn ($query) => $query->where('estado', '!=', 'cancelada'),
            ]);

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('codigo_vuelo', 'like', '%' . $search . '%')
                    ->orWhereHas('aerolinea', function ($relacion) use ($search) {
                        $relacion
                            ->where('nombre', 'like', '%' . $search . '%')
                            ->orWhere('codigo_iata', 'like', '%' . $search . '%');
                    })
                    ->orWhereHas('ruta', function ($relacion) use ($search) {
                        $relacion->where('codigo', 'like', '%' . $search . '%');
                    });
            });
        }

        foreach (['aerolinea_id', 'avion_id', 'ruta_id', 'estado_vuelo_id'] as $campo) {
            if ($request->filled($campo)) {
                $query->where($campo, $request->input($campo));
            }
        }

        if ($request->filled('pais_aerolinea')) {
            $query->whereHas('aerolinea', function ($relation) use ($request) {
                $relation->where('pais', $request->input('pais_aerolinea'));
            });
        }

        if ($request->filled('fecha_salida')) {
            $query->whereDate('fecha_salida', $request->input('fecha_salida'));
        }

        return response()->json(
            $query->orderBy('fecha_salida')->paginate($this->perPage($request))
        );
    }

    public function show(Vuelo $vuelo): JsonResponse
    {
        return response()->json([
            'data' => $vuelo->load([
                'aerolinea:id,nombre,codigo_iata,pais',
                'avion:id,matricula,modelo,fabricante,capacidad',
                'estadoVuelo:id,nombre,color,codigo,descripcion',
                'ruta:id,codigo,distancia_km,duracion_minutos,tarifa_base,tipo_operacion,frecuencia_referencial,aeropuerto_origen_id,aeropuerto_destino_id',
                'ruta.aeropuertoOrigen:id,nombre,codigo_iata,ciudad,pais,latitud,longitud',
                'ruta.aeropuertoDestino:id,nombre,codigo_iata,ciudad,pais,latitud,longitud',
                'reservas' => fn ($query) => $query
                    ->with('pasajero:id,nombres,apellidos,numero_documento')
                    ->orderByDesc('fecha_reserva'),
            ])->loadCount([
                'reservas',
                'reservas as reservas_activas_count' => fn ($query) => $query->where('estado', '!=', 'cancelada'),
            ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $this->validarDatos($request);

        $vuelo = Vuelo::create($datos);

        return response()->json([
            'message' => 'Vuelo registrado correctamente.',
            'data' => $this->cargarVuelo($vuelo),
        ], 201);
    }

    public function update(Request $request, Vuelo $vuelo): JsonResponse
    {
        $datos = $this->validarDatos($request, $vuelo);

        $vuelo->update($datos);

        return response()->json([
            'message' => 'Vuelo actualizado correctamente.',
            'data' => $this->cargarVuelo($vuelo),
        ]);
    }

    public function destroy(Vuelo $vuelo): JsonResponse
    {
        if ($vuelo->reservas()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar el vuelo porque tiene reservas asociadas.',
            ], 409);
        }

        $vuelo->delete();

        return response()->json([
            'message' => 'Vuelo eliminado correctamente.',
        ]);
    }

    public function cambiarEstado(Request $request, Vuelo $vuelo): JsonResponse
    {
        $datos = $request->validate([
            'estado_vuelo_id' => 'required|exists:estados_vuelo,id',
            'observaciones' => 'nullable|string|max:255',
        ]);

        $vuelo->update([
            'estado_vuelo_id' => $datos['estado_vuelo_id'],
            'observaciones' => $datos['observaciones'] ?? $vuelo->observaciones,
        ]);

        return response()->json([
            'message' => 'Estado del vuelo actualizado correctamente.',
            'data' => $this->cargarVuelo($vuelo),
        ]);
    }

    private function validarDatos(Request $request, ?Vuelo $vuelo = null): array
    {
        $datos = $request->validate([
            'aerolinea_id' => 'required|exists:aerolineas,id',
            'avion_id' => 'required|exists:aviones,id',
            'ruta_id' => 'required|exists:rutas,id',
            'estado_vuelo_id' => 'required|exists:estados_vuelo,id',
            'codigo_vuelo' => [
                'required',
                'string',
                'max:20',
                Rule::unique('vuelos', 'codigo_vuelo')->ignore($vuelo?->id),
            ],
            'fecha_salida' => 'required|date',
            'fecha_llegada' => 'required|date|after:fecha_salida',
            'terminal' => 'nullable|string|max:20',
            'puerta_embarque' => 'nullable|string|max:20',
            'capacidad' => 'required|integer|min:1|max:999',
            'precio_base' => 'required|numeric|min:0',
            'observaciones' => 'nullable|string|max:255',
        ]);

        $datos['codigo_vuelo'] = strtoupper($datos['codigo_vuelo']);

        $aerolinea = Aerolinea::findOrFail($datos['aerolinea_id']);
        $avion = Avion::findOrFail($datos['avion_id']);
        $ruta = Ruta::with([
            'aeropuertoOrigen:id,pais',
            'aeropuertoDestino:id,pais',
        ])->findOrFail($datos['ruta_id']);

        if ((int) $avion->aerolinea_id !== (int) $datos['aerolinea_id']) {
            throw ValidationException::withMessages([
                'avion_id' => 'El avion seleccionado no pertenece a la aerolinea indicada.',
            ]);
        }

        if ($avion->estado !== 'activo') {
            throw ValidationException::withMessages([
                'avion_id' => 'Solo se pueden asignar aviones con estado activo.',
            ]);
        }

        if (! $ruta->activa) {
            throw ValidationException::withMessages([
                'ruta_id' => 'La ruta seleccionada no se encuentra activa.',
            ]);
        }

        if ((int) $datos['capacidad'] > (int) $avion->capacidad) {
            throw ValidationException::withMessages([
                'capacidad' => 'La capacidad del vuelo no puede superar la capacidad del avion.',
            ]);
        }

        if ($avion->alcance_km && (float) $ruta->distancia_km > (float) $avion->alcance_km) {
            throw ValidationException::withMessages([
                'ruta_id' => 'La distancia de la ruta supera el alcance operativo del avion seleccionado.',
            ]);
        }

        if (
            $ruta->tipo_operacion === 'nacional'
            && (
                $ruta->aeropuertoOrigen?->pais !== $aerolinea->pais
                || $ruta->aeropuertoDestino?->pais !== $aerolinea->pais
            )
        ) {
            throw ValidationException::withMessages([
                'ruta_id' => 'Las rutas nacionales solo pueden programarse con aerolineas del mismo pais de origen y destino.',
            ]);
        }

        return $datos;
    }

    private function cargarVuelo(Vuelo $vuelo): Vuelo
    {
        return $vuelo->load([
            'aerolinea:id,nombre,codigo_iata,pais',
            'avion:id,matricula,modelo,capacidad',
            'estadoVuelo:id,nombre,color,codigo',
            'ruta:id,codigo,tipo_operacion,frecuencia_referencial,distancia_km,aeropuerto_origen_id,aeropuerto_destino_id',
            'ruta.aeropuertoOrigen:id,nombre,codigo_iata,ciudad,pais,latitud,longitud',
            'ruta.aeropuertoDestino:id,nombre,codigo_iata,ciudad,pais,latitud,longitud',
        ])->loadCount([
            'reservas',
            'reservas as reservas_activas_count' => fn ($query) => $query->where('estado', '!=', 'cancelada'),
        ]);
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->input('per_page', 10), 50));
    }
}
