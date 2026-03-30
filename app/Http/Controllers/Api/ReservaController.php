<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use App\Models\Vuelo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ReservaController extends Controller
{
    private const CLASES = ['economica', 'ejecutiva'];

    private const ESTADOS = ['confirmada', 'pendiente', 'cancelada'];

    public function index(Request $request): JsonResponse
    {
        $query = Reserva::query()->with([
            'pasajero:id,nombres,apellidos,numero_documento',
            'vuelo:id,codigo_vuelo,fecha_salida,estado_vuelo_id,ruta_id',
            'vuelo.estadoVuelo:id,nombre,color',
            'vuelo.ruta:id,codigo,aeropuerto_origen_id,aeropuerto_destino_id',
            'vuelo.ruta.aeropuertoOrigen:id,codigo_iata,ciudad',
            'vuelo.ruta.aeropuertoDestino:id,codigo_iata,ciudad',
        ]);

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('codigo_reserva', 'like', '%' . $search . '%')
                    ->orWhereHas('pasajero', function ($relacion) use ($search) {
                        $relacion
                            ->where('nombres', 'like', '%' . $search . '%')
                            ->orWhere('apellidos', 'like', '%' . $search . '%')
                            ->orWhere('numero_documento', 'like', '%' . $search . '%');
                    })
                    ->orWhereHas('vuelo', function ($relacion) use ($search) {
                        $relacion->where('codigo_vuelo', 'like', '%' . $search . '%');
                    });
            });
        }

        foreach (['vuelo_id', 'pasajero_id'] as $campo) {
            if ($request->filled($campo)) {
                $query->where($campo, $request->input($campo));
            }
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        if ($request->filled('clase')) {
            $query->where('clase', $request->input('clase'));
        }

        return response()->json(
            $query->orderByDesc('fecha_reserva')->paginate($this->perPage($request))
        );
    }

    public function show(Reserva $reserva): JsonResponse
    {
        return response()->json([
            'data' => $this->cargarReserva($reserva),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $this->validarDatos($request);

        $reserva = Reserva::create($datos);

        return response()->json([
            'message' => 'Reserva registrada correctamente.',
            'data' => $this->cargarReserva($reserva),
        ], 201);
    }

    public function update(Request $request, Reserva $reserva): JsonResponse
    {
        $datos = $this->validarDatos($request, $reserva);

        $reserva->update($datos);

        return response()->json([
            'message' => 'Reserva actualizada correctamente.',
            'data' => $this->cargarReserva($reserva),
        ]);
    }

    public function destroy(Reserva $reserva): JsonResponse
    {
        $reserva->delete();

        return response()->json([
            'message' => 'Reserva eliminada correctamente.',
        ]);
    }

    private function validarDatos(Request $request, ?Reserva $reserva = null): array
    {
        $datos = $request->validate([
            'vuelo_id' => 'required|exists:vuelos,id',
            'pasajero_id' => 'required|exists:pasajeros,id',
            'user_id' => 'nullable|exists:users,id',
            'codigo_reserva' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('reservas', 'codigo_reserva')->ignore($reserva?->id),
            ],
            'fecha_reserva' => 'nullable|date',
            'asiento' => 'nullable|string|max:10',
            'clase' => ['required', Rule::in(self::CLASES)],
            'estado' => ['required', Rule::in(self::ESTADOS)],
            'precio_total' => 'required|numeric|min:0',
            'equipaje_registrado' => 'nullable|boolean',
            'observaciones' => 'nullable|string|max:255',
        ]);

        $datos['codigo_reserva'] = isset($datos['codigo_reserva']) && $datos['codigo_reserva'] !== ''
            ? strtoupper($datos['codigo_reserva'])
            : ($reserva?->codigo_reserva ?? $this->generarCodigoReserva());
        $datos['fecha_reserva'] = $datos['fecha_reserva'] ?? now();
        $datos['equipaje_registrado'] = $datos['equipaje_registrado'] ?? false;
        $datos['asiento'] = isset($datos['asiento']) ? strtoupper($datos['asiento']) : null;

        $vuelo = Vuelo::with('estadoVuelo:id,codigo')->findOrFail($datos['vuelo_id']);

        if (
            in_array($vuelo->estadoVuelo?->codigo, ['cancelado', 'aterrizado'], true)
            && $datos['estado'] !== 'cancelada'
        ) {
            throw ValidationException::withMessages([
                'vuelo_id' => 'No se pueden registrar reservas para un vuelo cancelado o finalizado.',
            ]);
        }

        $reservaActivaExistente = Reserva::query()
            ->where('vuelo_id', $datos['vuelo_id'])
            ->where('pasajero_id', $datos['pasajero_id'])
            ->where('estado', '!=', 'cancelada')
            ->when($reserva, fn ($query) => $query->where('id', '!=', $reserva->id))
            ->exists();

        if ($datos['estado'] !== 'cancelada' && $reservaActivaExistente) {
            throw ValidationException::withMessages([
                'pasajero_id' => 'El pasajero ya tiene una reserva activa para este vuelo.',
            ]);
        }

        if (! empty($datos['asiento']) && $datos['estado'] !== 'cancelada') {
            $asientoOcupado = Reserva::query()
                ->where('vuelo_id', $datos['vuelo_id'])
                ->where('asiento', $datos['asiento'])
                ->where('estado', '!=', 'cancelada')
                ->when($reserva, fn ($query) => $query->where('id', '!=', $reserva->id))
                ->exists();

            if ($asientoOcupado) {
                throw ValidationException::withMessages([
                    'asiento' => 'El asiento seleccionado ya esta ocupado para este vuelo.',
                ]);
            }
        }

        $reservasActivas = Reserva::query()
            ->where('vuelo_id', $datos['vuelo_id'])
            ->where('estado', '!=', 'cancelada')
            ->when($reserva, fn ($query) => $query->where('id', '!=', $reserva->id))
            ->count();

        if ($datos['estado'] !== 'cancelada' && $reservasActivas >= $vuelo->capacidad) {
            throw ValidationException::withMessages([
                'vuelo_id' => 'El vuelo ya alcanzo la capacidad disponible.',
            ]);
        }

        return $datos;
    }

    private function generarCodigoReserva(): string
    {
        return 'RSV-' . Str::upper(Str::random(6));
    }

    private function cargarReserva(Reserva $reserva): Reserva
    {
        return $reserva->load([
            'pasajero:id,nombres,apellidos,tipo_documento,numero_documento,email,telefono',
            'vuelo:id,codigo_vuelo,fecha_salida,fecha_llegada,estado_vuelo_id,ruta_id,avion_id',
            'vuelo.estadoVuelo:id,nombre,color,codigo',
            'vuelo.avion:id,matricula,modelo',
            'vuelo.ruta:id,codigo,aeropuerto_origen_id,aeropuerto_destino_id',
            'vuelo.ruta.aeropuertoOrigen:id,nombre,codigo_iata,ciudad',
            'vuelo.ruta.aeropuertoDestino:id,nombre,codigo_iata,ciudad',
            'user:id,name,email',
        ]);
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->input('per_page', 10), 50));
    }
}
