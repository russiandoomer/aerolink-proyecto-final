<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aeropuerto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AeropuertoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Aeropuerto::query()->withCount(['rutasOrigen', 'rutasDestino']);

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('nombre', 'like', '%' . $search . '%')
                    ->orWhere('codigo_iata', 'like', '%' . $search . '%')
                    ->orWhere('ciudad', 'like', '%' . $search . '%')
                    ->orWhere('pais', 'like', '%' . $search . '%');
            });
        }

        if ($request->has('activo')) {
            $query->where('activo', $request->boolean('activo'));
        }

        return response()->json(
            $query->orderBy('ciudad')->paginate($this->perPage($request))
        );
    }

    public function show(Aeropuerto $aeropuerto): JsonResponse
    {
        return response()->json([
            'data' => $aeropuerto->loadCount(['rutasOrigen', 'rutasDestino']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:120',
            'codigo_iata' => ['required', 'string', 'size:3', Rule::unique('aeropuertos', 'codigo_iata')],
            'codigo_icao' => ['nullable', 'string', 'size:4', Rule::unique('aeropuertos', 'codigo_icao')],
            'ciudad' => 'required|string|max:80',
            'pais' => 'required|string|max:80',
            'latitud' => 'nullable|numeric|between:-90,90',
            'longitud' => 'nullable|numeric|between:-180,180',
            'activo' => 'nullable|boolean',
        ]);

        $datos['codigo_iata'] = strtoupper($datos['codigo_iata']);
        $datos['codigo_icao'] = $this->upperOrNull($datos, 'codigo_icao');
        $datos['activo'] = $datos['activo'] ?? true;

        $aeropuerto = Aeropuerto::create($datos);

        return response()->json([
            'message' => 'Aeropuerto registrado correctamente.',
            'data' => $aeropuerto,
        ], 201);
    }

    public function update(Request $request, Aeropuerto $aeropuerto): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:120',
            'codigo_iata' => [
                'required',
                'string',
                'size:3',
                Rule::unique('aeropuertos', 'codigo_iata')->ignore($aeropuerto->id),
            ],
            'codigo_icao' => [
                'nullable',
                'string',
                'size:4',
                Rule::unique('aeropuertos', 'codigo_icao')->ignore($aeropuerto->id),
            ],
            'ciudad' => 'required|string|max:80',
            'pais' => 'required|string|max:80',
            'latitud' => 'nullable|numeric|between:-90,90',
            'longitud' => 'nullable|numeric|between:-180,180',
            'activo' => 'required|boolean',
        ]);

        $datos['codigo_iata'] = strtoupper($datos['codigo_iata']);
        $datos['codigo_icao'] = $this->upperOrNull($datos, 'codigo_icao');

        $aeropuerto->update($datos);

        return response()->json([
            'message' => 'Aeropuerto actualizado correctamente.',
            'data' => $aeropuerto,
        ]);
    }

    public function destroy(Aeropuerto $aeropuerto): JsonResponse
    {
        if ($aeropuerto->rutasOrigen()->exists() || $aeropuerto->rutasDestino()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar el aeropuerto porque tiene rutas asociadas.',
            ], 409);
        }

        $aeropuerto->delete();

        return response()->json([
            'message' => 'Aeropuerto eliminado correctamente.',
        ]);
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->input('per_page', 10), 50));
    }

    private function upperOrNull(array $datos, string $campo): ?string
    {
        return isset($datos[$campo]) ? strtoupper($datos[$campo]) : null;
    }
}
