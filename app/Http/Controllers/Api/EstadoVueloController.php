<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EstadoVuelo;
use Illuminate\Http\JsonResponse;

class EstadoVueloController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => EstadoVuelo::query()
                ->withCount('vuelos')
                ->orderBy('orden')
                ->get(),
        ]);
    }

    public function show(EstadoVuelo $estadoVuelo): JsonResponse
    {
        return response()->json([
            'data' => $estadoVuelo->loadCount('vuelos'),
        ]);
    }
}
