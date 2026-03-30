<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pasajero;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PasajeroController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Pasajero::query()->withCount('reservas');

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('nombres', 'like', '%' . $search . '%')
                    ->orWhere('apellidos', 'like', '%' . $search . '%')
                    ->orWhere('numero_documento', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('tipo_documento')) {
            $query->where('tipo_documento', $request->input('tipo_documento'));
        }

        return response()->json(
            $query->orderBy('apellidos')->paginate($this->perPage($request))
        );
    }

    public function show(Pasajero $pasajero): JsonResponse
    {
        return response()->json([
            'data' => $pasajero->load([
                'reservas' => fn ($query) => $query
                    ->with([
                        'vuelo' => fn ($vueloQuery) => $vueloQuery->with([
                            'estadoVuelo:id,nombre,color',
                            'ruta.aeropuertoOrigen:id,nombre,codigo_iata,ciudad',
                            'ruta.aeropuertoDestino:id,nombre,codigo_iata,ciudad',
                        ]),
                    ])
                    ->orderByDesc('fecha_reserva'),
            ])->loadCount('reservas'),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombres' => 'required|string|max:80',
            'apellidos' => 'required|string|max:80',
            'tipo_documento' => 'required|string|max:20',
            'numero_documento' => ['required', 'string', 'max:30', Rule::unique('pasajeros', 'numero_documento')],
            'fecha_nacimiento' => 'nullable|date|before:today',
            'nacionalidad' => 'nullable|string|max:80',
            'telefono' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:120',
        ]);

        $pasajero = Pasajero::create($datos);

        return response()->json([
            'message' => 'Pasajero registrado correctamente.',
            'data' => $pasajero,
        ], 201);
    }

    public function update(Request $request, Pasajero $pasajero): JsonResponse
    {
        $datos = $request->validate([
            'nombres' => 'required|string|max:80',
            'apellidos' => 'required|string|max:80',
            'tipo_documento' => 'required|string|max:20',
            'numero_documento' => [
                'required',
                'string',
                'max:30',
                Rule::unique('pasajeros', 'numero_documento')->ignore($pasajero->id),
            ],
            'fecha_nacimiento' => 'nullable|date|before:today',
            'nacionalidad' => 'nullable|string|max:80',
            'telefono' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:120',
        ]);

        $pasajero->update($datos);

        return response()->json([
            'message' => 'Pasajero actualizado correctamente.',
            'data' => $pasajero,
        ]);
    }

    public function destroy(Pasajero $pasajero): JsonResponse
    {
        if ($pasajero->reservas()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar el pasajero porque tiene reservas asociadas.',
            ], 409);
        }

        $pasajero->delete();

        return response()->json([
            'message' => 'Pasajero eliminado correctamente.',
        ]);
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->input('per_page', 10), 50));
    }
}
