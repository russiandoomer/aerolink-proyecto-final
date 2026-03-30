<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatosDemoSeeder extends Seeder
{
    public function run(): void
    {
        $timestamp = now();

        DB::table('aerolineas')->upsert([
            [
                'nombre' => 'AeroLink Bolivia',
                'codigo_iata' => 'ALB',
                'pais' => 'Bolivia',
                'telefono' => '+591 3 3344556',
                'email' => 'operaciones@aerolink.test',
                'activa' => true,
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        ], ['codigo_iata'], ['nombre', 'pais', 'telefono', 'email', 'activa', 'deleted_at', 'updated_at']);

        $aerolineaId = DB::table('aerolineas')->where('codigo_iata', 'ALB')->value('id');

        DB::table('aeropuertos')->upsert([
            [
                'nombre' => 'Aeropuerto Internacional Viru Viru',
                'codigo_iata' => 'VVI',
                'codigo_icao' => 'SLVR',
                'ciudad' => 'Santa Cruz',
                'pais' => 'Bolivia',
                'latitud' => -17.6447000,
                'longitud' => -63.1354000,
                'activo' => true,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'nombre' => 'Aeropuerto Internacional El Alto',
                'codigo_iata' => 'LPB',
                'codigo_icao' => 'SLLP',
                'ciudad' => 'La Paz',
                'pais' => 'Bolivia',
                'latitud' => -16.5133000,
                'longitud' => -68.1923000,
                'activo' => true,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'nombre' => 'Aeropuerto Jorge Wilstermann',
                'codigo_iata' => 'CBB',
                'codigo_icao' => 'SLCB',
                'ciudad' => 'Cochabamba',
                'pais' => 'Bolivia',
                'latitud' => -17.4211000,
                'longitud' => -66.1771000,
                'activo' => true,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'nombre' => 'Aeropuerto Internacional Jorge Chavez',
                'codigo_iata' => 'LIM',
                'codigo_icao' => 'SPJC',
                'ciudad' => 'Lima',
                'pais' => 'Peru',
                'latitud' => -12.0219000,
                'longitud' => -77.1143000,
                'activo' => true,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        ], ['codigo_iata'], ['nombre', 'codigo_icao', 'ciudad', 'pais', 'latitud', 'longitud', 'activo', 'updated_at']);

        $vviId = DB::table('aeropuertos')->where('codigo_iata', 'VVI')->value('id');
        $lpbId = DB::table('aeropuertos')->where('codigo_iata', 'LPB')->value('id');
        $cbbId = DB::table('aeropuertos')->where('codigo_iata', 'CBB')->value('id');
        $limId = DB::table('aeropuertos')->where('codigo_iata', 'LIM')->value('id');

        DB::table('aviones')->upsert([
            [
                'aerolinea_id' => $aerolineaId,
                'matricula' => 'CP-3201',
                'modelo' => 'A320-200',
                'fabricante' => 'Airbus',
                'capacidad' => 180,
                'alcance_km' => 6100,
                'estado' => 'activo',
                'ultimo_mantenimiento' => now()->subDays(12)->toDateString(),
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'aerolinea_id' => $aerolineaId,
                'matricula' => 'CP-7378',
                'modelo' => '737-800',
                'fabricante' => 'Boeing',
                'capacidad' => 162,
                'alcance_km' => 5400,
                'estado' => 'activo',
                'ultimo_mantenimiento' => now()->subDays(30)->toDateString(),
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        ], ['matricula'], [
            'aerolinea_id',
            'modelo',
            'fabricante',
            'capacidad',
            'alcance_km',
            'estado',
            'ultimo_mantenimiento',
            'deleted_at',
            'updated_at',
        ]);

        $avionA320Id = DB::table('aviones')->where('matricula', 'CP-3201')->value('id');
        $avionB737Id = DB::table('aviones')->where('matricula', 'CP-7378')->value('id');

        DB::table('rutas')->upsert([
            [
                'codigo' => 'VVI-LPB',
                'aeropuerto_origen_id' => $vviId,
                'aeropuerto_destino_id' => $lpbId,
                'distancia_km' => 550.00,
                'duracion_minutos' => 55,
                'tarifa_base' => 320.00,
                'activa' => true,
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'codigo' => 'LPB-CBB',
                'aeropuerto_origen_id' => $lpbId,
                'aeropuerto_destino_id' => $cbbId,
                'distancia_km' => 230.00,
                'duracion_minutos' => 40,
                'tarifa_base' => 190.00,
                'activa' => true,
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'codigo' => 'VVI-LIM',
                'aeropuerto_origen_id' => $vviId,
                'aeropuerto_destino_id' => $limId,
                'distancia_km' => 1460.00,
                'duracion_minutos' => 150,
                'tarifa_base' => 680.00,
                'activa' => true,
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        ], ['codigo'], [
            'aeropuerto_origen_id',
            'aeropuerto_destino_id',
            'distancia_km',
            'duracion_minutos',
            'tarifa_base',
            'activa',
            'deleted_at',
            'updated_at',
        ]);

        $rutaVviLpbId = DB::table('rutas')->where('codigo', 'VVI-LPB')->value('id');
        $rutaLpbCbbId = DB::table('rutas')->where('codigo', 'LPB-CBB')->value('id');
        $rutaVviLimId = DB::table('rutas')->where('codigo', 'VVI-LIM')->value('id');

        $estadoProgramadoId = DB::table('estados_vuelo')->where('codigo', 'programado')->value('id');
        $estadoEmbarcandoId = DB::table('estados_vuelo')->where('codigo', 'embarcando')->value('id');
        $estadoDemoradoId = DB::table('estados_vuelo')->where('codigo', 'demorado')->value('id');

        DB::table('vuelos')->upsert([
            [
                'aerolinea_id' => $aerolineaId,
                'avion_id' => $avionA320Id,
                'ruta_id' => $rutaVviLpbId,
                'estado_vuelo_id' => $estadoProgramadoId,
                'codigo_vuelo' => 'ALB101',
                'fecha_salida' => now()->addDay()->setTime(7, 30, 0),
                'fecha_llegada' => now()->addDay()->setTime(8, 25, 0),
                'terminal' => 'T1',
                'puerta_embarque' => 'A3',
                'capacidad' => 180,
                'precio_base' => 320.00,
                'observaciones' => 'Operacion regular de la manana.',
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'aerolinea_id' => $aerolineaId,
                'avion_id' => $avionB737Id,
                'ruta_id' => $rutaLpbCbbId,
                'estado_vuelo_id' => $estadoEmbarcandoId,
                'codigo_vuelo' => 'ALB245',
                'fecha_salida' => now()->addDays(2)->setTime(10, 15, 0),
                'fecha_llegada' => now()->addDays(2)->setTime(10, 55, 0),
                'terminal' => 'T2',
                'puerta_embarque' => 'B1',
                'capacidad' => 162,
                'precio_base' => 190.00,
                'observaciones' => 'Ruta nacional de alta rotacion.',
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'aerolinea_id' => $aerolineaId,
                'avion_id' => $avionA320Id,
                'ruta_id' => $rutaVviLimId,
                'estado_vuelo_id' => $estadoDemoradoId,
                'codigo_vuelo' => 'ALB390',
                'fecha_salida' => now()->addDays(3)->setTime(16, 0, 0),
                'fecha_llegada' => now()->addDays(3)->setTime(18, 30, 0),
                'terminal' => 'T1',
                'puerta_embarque' => 'C4',
                'capacidad' => 180,
                'precio_base' => 680.00,
                'observaciones' => 'Demora simulada para pruebas del dashboard.',
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        ], ['codigo_vuelo'], [
            'aerolinea_id',
            'avion_id',
            'ruta_id',
            'estado_vuelo_id',
            'fecha_salida',
            'fecha_llegada',
            'terminal',
            'puerta_embarque',
            'capacidad',
            'precio_base',
            'observaciones',
            'deleted_at',
            'updated_at',
        ]);

        $vueloUnoId = DB::table('vuelos')->where('codigo_vuelo', 'ALB101')->value('id');
        $vueloDosId = DB::table('vuelos')->where('codigo_vuelo', 'ALB245')->value('id');
        $vueloTresId = DB::table('vuelos')->where('codigo_vuelo', 'ALB390')->value('id');

        DB::table('pasajeros')->upsert([
            [
                'nombres' => 'Mariana',
                'apellidos' => 'Suarez Rojas',
                'tipo_documento' => 'CI',
                'numero_documento' => '7845123',
                'fecha_nacimiento' => '1998-04-14',
                'nacionalidad' => 'Boliviana',
                'telefono' => '+591 77334455',
                'email' => 'mariana.suarez@test.com',
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'nombres' => 'Carlos',
                'apellidos' => 'Mendoza Flores',
                'tipo_documento' => 'CI',
                'numero_documento' => '6234189',
                'fecha_nacimiento' => '1995-11-02',
                'nacionalidad' => 'Boliviana',
                'telefono' => '+591 70998877',
                'email' => 'carlos.mendoza@test.com',
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'nombres' => 'Lucia',
                'apellidos' => 'Quinteros Vega',
                'tipo_documento' => 'Pasaporte',
                'numero_documento' => 'PA993847',
                'fecha_nacimiento' => '1992-07-23',
                'nacionalidad' => 'Peruana',
                'telefono' => '+51 955443322',
                'email' => 'lucia.quinteros@test.com',
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        ], ['numero_documento'], [
            'nombres',
            'apellidos',
            'tipo_documento',
            'fecha_nacimiento',
            'nacionalidad',
            'telefono',
            'email',
            'deleted_at',
            'updated_at',
        ]);

        $pasajeroUnoId = DB::table('pasajeros')->where('numero_documento', '7845123')->value('id');
        $pasajeroDosId = DB::table('pasajeros')->where('numero_documento', '6234189')->value('id');
        $pasajeroTresId = DB::table('pasajeros')->where('numero_documento', 'PA993847')->value('id');

        DB::table('reservas')->upsert([
            [
                'vuelo_id' => $vueloUnoId,
                'pasajero_id' => $pasajeroUnoId,
                'user_id' => null,
                'codigo_reserva' => 'RSV-1001',
                'fecha_reserva' => now()->subDays(3),
                'asiento' => '12A',
                'clase' => 'economica',
                'estado' => 'confirmada',
                'precio_total' => 320.00,
                'equipaje_registrado' => true,
                'observaciones' => 'Reserva confirmada sin incidencias.',
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'vuelo_id' => $vueloDosId,
                'pasajero_id' => $pasajeroDosId,
                'user_id' => null,
                'codigo_reserva' => 'RSV-1002',
                'fecha_reserva' => now()->subDays(1),
                'asiento' => '7C',
                'clase' => 'economica',
                'estado' => 'confirmada',
                'precio_total' => 190.00,
                'equipaje_registrado' => false,
                'observaciones' => 'Pasajero frecuente en ruta nacional.',
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'vuelo_id' => $vueloTresId,
                'pasajero_id' => $pasajeroTresId,
                'user_id' => null,
                'codigo_reserva' => 'RSV-1003',
                'fecha_reserva' => now()->subHours(8),
                'asiento' => '3F',
                'clase' => 'ejecutiva',
                'estado' => 'pendiente',
                'precio_total' => 910.00,
                'equipaje_registrado' => true,
                'observaciones' => 'Reserva internacional pendiente de confirmacion final.',
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        ], ['codigo_reserva'], [
            'vuelo_id',
            'pasajero_id',
            'user_id',
            'fecha_reserva',
            'asiento',
            'clase',
            'estado',
            'precio_total',
            'equipaje_registrado',
            'observaciones',
            'deleted_at',
            'updated_at',
        ]);
    }
}
