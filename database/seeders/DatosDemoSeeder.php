<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatosDemoSeeder extends Seeder
{
    public function run(): void
    {
        $timestamp = now();

        $aerolineaId = DB::table('aerolineas')->insertGetId([
            'nombre' => 'AeroLink Bolivia',
            'codigo_iata' => 'ALB',
            'pais' => 'Bolivia',
            'telefono' => '+591 3 3344556',
            'email' => 'operaciones@aerolink.test',
            'activa' => true,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        DB::table('aeropuertos')->insert([
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
        ]);

        $vviId = DB::table('aeropuertos')->where('codigo_iata', 'VVI')->value('id');
        $lpbId = DB::table('aeropuertos')->where('codigo_iata', 'LPB')->value('id');
        $cbbId = DB::table('aeropuertos')->where('codigo_iata', 'CBB')->value('id');
        $limId = DB::table('aeropuertos')->where('codigo_iata', 'LIM')->value('id');

        $avionA320Id = DB::table('aviones')->insertGetId([
            'aerolinea_id' => $aerolineaId,
            'matricula' => 'CP-3201',
            'modelo' => 'A320-200',
            'fabricante' => 'Airbus',
            'capacidad' => 180,
            'alcance_km' => 6100,
            'estado' => 'activo',
            'ultimo_mantenimiento' => now()->subDays(12)->toDateString(),
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $avionB737Id = DB::table('aviones')->insertGetId([
            'aerolinea_id' => $aerolineaId,
            'matricula' => 'CP-7378',
            'modelo' => '737-800',
            'fabricante' => 'Boeing',
            'capacidad' => 162,
            'alcance_km' => 5400,
            'estado' => 'activo',
            'ultimo_mantenimiento' => now()->subDays(30)->toDateString(),
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $rutaVviLpbId = DB::table('rutas')->insertGetId([
            'codigo' => 'VVI-LPB',
            'aeropuerto_origen_id' => $vviId,
            'aeropuerto_destino_id' => $lpbId,
            'distancia_km' => 550.00,
            'duracion_minutos' => 55,
            'tarifa_base' => 320.00,
            'activa' => true,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $rutaLpbCbbId = DB::table('rutas')->insertGetId([
            'codigo' => 'LPB-CBB',
            'aeropuerto_origen_id' => $lpbId,
            'aeropuerto_destino_id' => $cbbId,
            'distancia_km' => 230.00,
            'duracion_minutos' => 40,
            'tarifa_base' => 190.00,
            'activa' => true,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $rutaVviLimId = DB::table('rutas')->insertGetId([
            'codigo' => 'VVI-LIM',
            'aeropuerto_origen_id' => $vviId,
            'aeropuerto_destino_id' => $limId,
            'distancia_km' => 1460.00,
            'duracion_minutos' => 150,
            'tarifa_base' => 680.00,
            'activa' => true,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $estadoProgramadoId = DB::table('estados_vuelo')->where('codigo', 'programado')->value('id');
        $estadoEmbarcandoId = DB::table('estados_vuelo')->where('codigo', 'embarcando')->value('id');
        $estadoDemoradoId = DB::table('estados_vuelo')->where('codigo', 'demorado')->value('id');

        $vueloUnoId = DB::table('vuelos')->insertGetId([
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
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $vueloDosId = DB::table('vuelos')->insertGetId([
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
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $vueloTresId = DB::table('vuelos')->insertGetId([
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
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $pasajeroUnoId = DB::table('pasajeros')->insertGetId([
            'nombres' => 'Mariana',
            'apellidos' => 'Suarez Rojas',
            'tipo_documento' => 'CI',
            'numero_documento' => '7845123',
            'fecha_nacimiento' => '1998-04-14',
            'nacionalidad' => 'Boliviana',
            'telefono' => '+591 77334455',
            'email' => 'mariana.suarez@test.com',
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $pasajeroDosId = DB::table('pasajeros')->insertGetId([
            'nombres' => 'Carlos',
            'apellidos' => 'Mendoza Flores',
            'tipo_documento' => 'CI',
            'numero_documento' => '6234189',
            'fecha_nacimiento' => '1995-11-02',
            'nacionalidad' => 'Boliviana',
            'telefono' => '+591 70998877',
            'email' => 'carlos.mendoza@test.com',
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $pasajeroTresId = DB::table('pasajeros')->insertGetId([
            'nombres' => 'Lucia',
            'apellidos' => 'Quinteros Vega',
            'tipo_documento' => 'Pasaporte',
            'numero_documento' => 'PA993847',
            'fecha_nacimiento' => '1992-07-23',
            'nacionalidad' => 'Peruana',
            'telefono' => '+51 955443322',
            'email' => 'lucia.quinteros@test.com',
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        DB::table('reservas')->insert([
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
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        ]);
    }
}
