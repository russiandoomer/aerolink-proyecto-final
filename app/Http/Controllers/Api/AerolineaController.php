<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aerolinea;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AerolineaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Aerolinea::query()->withCount(['aviones', 'vuelos']);

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('nombre', 'like', '%' . $search . '%')
                    ->orWhere('codigo_iata', 'like', '%' . $search . '%')
                    ->orWhere('pais', 'like', '%' . $search . '%');
            });
        }

        if ($request->has('activa')) {
            $query->where('activa', $request->boolean('activa'));
        }

        return response()->json(
            $query->orderBy('nombre')->paginate($this->perPage($request))
        );
    }

    public function show(Aerolinea $aerolinea): JsonResponse
    {
        return response()->json([
            'data' => $aerolinea->loadCount(['aviones', 'vuelos']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:120',
            'codigo_iata' => ['nullable', 'string', 'size:3', Rule::unique('aerolineas', 'codigo_iata')],
            'pais' => 'required|string|max:80',
            'telefono' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:120',
            'activa' => 'nullable|boolean',
        ]);

        $datos['codigo_iata'] = $this->upperOrNull($datos, 'codigo_iata');
        $datos['activa'] = $datos['activa'] ?? true;

        $aerolinea = Aerolinea::create($datos);

        return response()->json([
            'message' => 'Aerolinea registrada correctamente.',
            'data' => $aerolinea->loadCount(['aviones', 'vuelos']),
        ], 201);
    }

    public function update(Request $request, Aerolinea $aerolinea): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:120',
            'codigo_iata' => [
                'nullable',
                'string',
                'size:3',
                Rule::unique('aerolineas', 'codigo_iata')->ignore($aerolinea->id),
            ],
            'pais' => 'required|string|max:80',
            'telefono' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:120',
            'activa' => 'required|boolean',
        ]);

        $datos['codigo_iata'] = $this->upperOrNull($datos, 'codigo_iata');

        $aerolinea->update($datos);

        return response()->json([
            'message' => 'Aerolinea actualizada correctamente.',
            'data' => $aerolinea->loadCount(['aviones', 'vuelos']),
        ]);
    }

    public function destroy(Aerolinea $aerolinea): JsonResponse
    {
        if ($aerolinea->aviones()->exists() || $aerolinea->vuelos()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar la aerolinea porque tiene registros asociados.',
            ], 409);
        }

        $aerolinea->delete();

        return response()->json([
            'message' => 'Aerolinea eliminada correctamente.',
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
