<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ruta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class RutaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Ruta::query()
            ->with([
                'aeropuertoOrigen:id,nombre,codigo_iata,ciudad',
                'aeropuertoDestino:id,nombre,codigo_iata,ciudad',
            ])
            ->withCount('vuelos');

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('codigo', 'like', '%' . $search . '%')
                    ->orWhereHas('aeropuertoOrigen', function ($relacion) use ($search) {
                        $relacion
                            ->where('nombre', 'like', '%' . $search . '%')
                            ->orWhere('ciudad', 'like', '%' . $search . '%')
                            ->orWhere('codigo_iata', 'like', '%' . $search . '%');
                    })
                    ->orWhereHas('aeropuertoDestino', function ($relacion) use ($search) {
                        $relacion
                            ->where('nombre', 'like', '%' . $search . '%')
                            ->orWhere('ciudad', 'like', '%' . $search . '%')
                            ->orWhere('codigo_iata', 'like', '%' . $search . '%');
                    });
            });
        }

        if ($request->filled('aeropuerto_origen_id')) {
            $query->where('aeropuerto_origen_id', $request->input('aeropuerto_origen_id'));
        }

        if ($request->filled('aeropuerto_destino_id')) {
            $query->where('aeropuerto_destino_id', $request->input('aeropuerto_destino_id'));
        }

        if ($request->has('activa')) {
            $query->where('activa', $request->boolean('activa'));
        }

        return response()->json(
            $query->orderBy('codigo')->paginate($this->perPage($request))
        );
    }

    public function show(Ruta $ruta): JsonResponse
    {
        return response()->json([
            'data' => $ruta->load([
                'aeropuertoOrigen:id,nombre,codigo_iata,ciudad,pais',
                'aeropuertoDestino:id,nombre,codigo_iata,ciudad,pais',
            ])->loadCount('vuelos'),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $this->validarDatos($request);

        $ruta = Ruta::create($datos);

        return response()->json([
            'message' => 'Ruta registrada correctamente.',
            'data' => $ruta->load([
                'aeropuertoOrigen:id,nombre,codigo_iata,ciudad',
                'aeropuertoDestino:id,nombre,codigo_iata,ciudad',
            ]),
        ], 201);
    }

    public function update(Request $request, Ruta $ruta): JsonResponse
    {
        $datos = $this->validarDatos($request, $ruta);

        $ruta->update($datos);

        return response()->json([
            'message' => 'Ruta actualizada correctamente.',
            'data' => $ruta->load([
                'aeropuertoOrigen:id,nombre,codigo_iata,ciudad',
                'aeropuertoDestino:id,nombre,codigo_iata,ciudad',
            ]),
        ]);
    }

    public function destroy(Ruta $ruta): JsonResponse
    {
        if ($ruta->vuelos()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar la ruta porque tiene vuelos asociados.',
            ], 409);
        }

        $ruta->delete();

        return response()->json([
            'message' => 'Ruta eliminada correctamente.',
        ]);
    }

    private function validarDatos(Request $request, ?Ruta $ruta = null): array
    {
        $datos = $request->validate([
            'codigo' => [
                'required',
                'string',
                'max:20',
                Rule::unique('rutas', 'codigo')->ignore($ruta?->id),
            ],
            'aeropuerto_origen_id' => 'required|exists:aeropuertos,id',
            'aeropuerto_destino_id' => 'required|exists:aeropuertos,id|different:aeropuerto_origen_id',
            'distancia_km' => 'required|numeric|min:1',
            'duracion_minutos' => 'required|integer|min:1',
            'tarifa_base' => 'required|numeric|min:0',
            'activa' => 'nullable|boolean',
        ]);

        $datos['codigo'] = strtoupper($datos['codigo']);
        $datos['activa'] = $datos['activa'] ?? true;

        $existeRuta = Ruta::query()
            ->where('aeropuerto_origen_id', $datos['aeropuerto_origen_id'])
            ->where('aeropuerto_destino_id', $datos['aeropuerto_destino_id'])
            ->when($ruta, fn ($query) => $query->where('id', '!=', $ruta->id))
            ->exists();

        if ($existeRuta) {
            throw ValidationException::withMessages([
                'aeropuerto_destino_id' => 'Ya existe una ruta registrada con ese origen y destino.',
            ]);
        }

        return $datos;
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->input('per_page', 10), 50));
    }
}
