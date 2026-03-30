<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Avion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AvionController extends Controller
{
    private const ESTADOS = ['activo', 'mantenimiento', 'fuera_servicio'];

    public function index(Request $request): JsonResponse
    {
        $query = Avion::query()->with('aerolinea:id,nombre,codigo_iata,pais')->withCount('vuelos');

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('matricula', 'like', '%' . $search . '%')
                    ->orWhere('modelo', 'like', '%' . $search . '%')
                    ->orWhere('fabricante', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('aerolinea_id')) {
            $query->where('aerolinea_id', $request->input('aerolinea_id'));
        }

        if ($request->filled('pais')) {
            $query->whereHas('aerolinea', function ($relation) use ($request) {
                $relation->where('pais', $request->input('pais'));
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        return response()->json(
            $query->orderByDesc('id')->paginate($this->perPage($request))
        );
    }

    public function show(Avion $avion): JsonResponse
    {
        return response()->json([
            'data' => $avion->load([
                'aerolinea:id,nombre,codigo_iata,pais',
                'vuelos' => fn ($query) => $query
                    ->with('estadoVuelo:id,nombre,color')
                    ->orderByDesc('fecha_salida')
                    ->limit(5),
            ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'aerolinea_id' => 'required|exists:aerolineas,id',
            'matricula' => ['required', 'string', 'max:20', Rule::unique('aviones', 'matricula')],
            'modelo' => 'required|string|max:80',
            'fabricante' => 'required|string|max:80',
            'capacidad' => 'required|integer|min:1|max:999',
            'alcance_km' => 'nullable|integer|min:1',
            'estado' => ['required', Rule::in(self::ESTADOS)],
            'ultimo_mantenimiento' => 'nullable|date',
        ]);

        $datos['matricula'] = strtoupper($datos['matricula']);

        $avion = Avion::create($datos);

        return response()->json([
            'message' => 'Avion registrado correctamente.',
            'data' => $avion->load('aerolinea:id,nombre,codigo_iata,pais'),
        ], 201);
    }

    public function update(Request $request, Avion $avion): JsonResponse
    {
        $datos = $request->validate([
            'aerolinea_id' => 'required|exists:aerolineas,id',
            'matricula' => [
                'required',
                'string',
                'max:20',
                Rule::unique('aviones', 'matricula')->ignore($avion->id),
            ],
            'modelo' => 'required|string|max:80',
            'fabricante' => 'required|string|max:80',
            'capacidad' => 'required|integer|min:1|max:999',
            'alcance_km' => 'nullable|integer|min:1',
            'estado' => ['required', Rule::in(self::ESTADOS)],
            'ultimo_mantenimiento' => 'nullable|date',
        ]);

        $datos['matricula'] = strtoupper($datos['matricula']);

        $avion->update($datos);

        return response()->json([
            'message' => 'Avion actualizado correctamente.',
            'data' => $avion->load('aerolinea:id,nombre,codigo_iata,pais'),
        ]);
    }

    public function destroy(Avion $avion): JsonResponse
    {
        if ($avion->vuelos()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar el avion porque tiene vuelos asociados.',
            ], 409);
        }

        $avion->delete();

        return response()->json([
            'message' => 'Avion eliminado correctamente.',
        ]);
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->input('per_page', 10), 50));
    }
}
