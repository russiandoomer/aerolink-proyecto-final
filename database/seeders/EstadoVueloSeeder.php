<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstadoVueloSeeder extends Seeder
{
    public function run(): void
    {
        $timestamp = now();

        DB::table('estados_vuelo')->upsert([
            [
                'nombre' => 'Programado',
                'codigo' => 'programado',
                'color' => 'blue',
                'orden' => 1,
                'descripcion' => 'Vuelo creado y confirmado en agenda.',
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'nombre' => 'Embarcando',
                'codigo' => 'embarcando',
                'color' => 'cyan',
                'orden' => 2,
                'descripcion' => 'Vuelo habilitado para abordaje.',
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'nombre' => 'En vuelo',
                'codigo' => 'en_vuelo',
                'color' => 'indigo',
                'orden' => 3,
                'descripcion' => 'Vuelo actualmente en trayecto.',
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'nombre' => 'Demorado',
                'codigo' => 'demorado',
                'color' => 'amber',
                'orden' => 4,
                'descripcion' => 'Vuelo con retraso operativo.',
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'nombre' => 'Aterrizado',
                'codigo' => 'aterrizado',
                'color' => 'emerald',
                'orden' => 5,
                'descripcion' => 'Vuelo completado con llegada registrada.',
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'nombre' => 'Cancelado',
                'codigo' => 'cancelado',
                'color' => 'red',
                'orden' => 6,
                'descripcion' => 'Vuelo cancelado por operacion.',
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        ], ['codigo'], ['nombre', 'color', 'orden', 'descripcion', 'updated_at']);
    }
}
