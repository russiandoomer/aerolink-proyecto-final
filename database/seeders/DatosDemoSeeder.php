<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatosDemoSeeder extends Seeder
{
    public function run(): void
    {
        $timestamp = now();

        $this->seedAirlines($timestamp);

        $airlineIds = DB::table('aerolineas')->pluck('id', 'codigo_iata')->all();
        $airportIds = DB::table('aeropuertos')->pluck('id', 'codigo_iata')->all();
        $stateIds = DB::table('estados_vuelo')->pluck('id', 'codigo')->all();

        $aircraftDefinitions = $this->aircraftDefinitions();
        $routeDefinitions = $this->routeDefinitions();
        $flightDefinitions = $this->flightDefinitions();
        $passengerDefinitions = $this->passengerDefinitions();

        $this->seedAircraft($timestamp, $aircraftDefinitions, $airlineIds);
        $this->seedRoutes($timestamp, $routeDefinitions, $airportIds);
        $this->seedFlights($timestamp, $flightDefinitions, $routeDefinitions, $aircraftDefinitions, $airlineIds, $stateIds);
        $this->seedPassengers($timestamp, $passengerDefinitions);

        $flightIds = DB::table('vuelos')->pluck('id', 'codigo_vuelo')->all();
        $passengerIds = DB::table('pasajeros')->pluck('id', 'numero_documento')->all();

        $this->seedReservations(
            $timestamp,
            $flightDefinitions,
            $routeDefinitions,
            $passengerDefinitions,
            $flightIds,
            $passengerIds
        );
    }

    private function seedAirlines($timestamp): void
    {
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
            [
                'nombre' => 'SkyBridge Andes',
                'codigo_iata' => 'SKA',
                'pais' => 'Peru',
                'telefono' => '+51 1 4459000',
                'email' => 'control@skybridge.test',
                'activa' => true,
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'nombre' => 'Pacifica Air',
                'codigo_iata' => 'PAC',
                'pais' => 'Chile',
                'telefono' => '+56 2 25566000',
                'email' => 'ops@pacifica.test',
                'activa' => true,
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'nombre' => 'Nova Atlantic',
                'codigo_iata' => 'NVA',
                'pais' => 'Sudafrica',
                'telefono' => '+27 11 5502200',
                'email' => 'dispatch@novaatlantic.test',
                'activa' => true,
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        ], ['codigo_iata'], ['nombre', 'pais', 'telefono', 'email', 'activa', 'deleted_at', 'updated_at']);
    }

    private function seedAircraft($timestamp, array $definitions, array $airlineIds): void
    {
        $rows = array_map(function (array $definition) use ($timestamp, $airlineIds) {
            return [
                'aerolinea_id' => $airlineIds[$definition['aerolinea']],
                'matricula' => $definition['matricula'],
                'modelo' => $definition['modelo'],
                'fabricante' => $definition['fabricante'],
                'capacidad' => $definition['capacidad'],
                'alcance_km' => $definition['alcance_km'],
                'estado' => $definition['estado'],
                'ultimo_mantenimiento' => now()->subDays($definition['dias_mantenimiento'])->toDateString(),
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }, $definitions);

        DB::table('aviones')->upsert(
            $rows,
            ['matricula'],
            [
                'aerolinea_id',
                'modelo',
                'fabricante',
                'capacidad',
                'alcance_km',
                'estado',
                'ultimo_mantenimiento',
                'deleted_at',
                'updated_at',
            ]
        );
    }

    private function seedRoutes($timestamp, array $definitions, array $airportIds): void
    {
        $rows = array_map(function (array $definition) use ($timestamp, $airportIds) {
            return [
                'codigo' => $definition['codigo'],
                'aeropuerto_origen_id' => $airportIds[$definition['origen']],
                'aeropuerto_destino_id' => $airportIds[$definition['destino']],
                'distancia_km' => $definition['distancia_km'],
                'duracion_minutos' => $definition['duracion_minutos'],
                'tarifa_base' => $definition['tarifa_base'],
                'tipo_operacion' => $definition['tipo_operacion'],
                'frecuencia_referencial' => $definition['frecuencia_referencial'],
                'activa' => true,
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }, $definitions);

        DB::table('rutas')->upsert(
            $rows,
            ['codigo'],
            [
                'aeropuerto_origen_id',
                'aeropuerto_destino_id',
                'distancia_km',
                'duracion_minutos',
                'tarifa_base',
                'tipo_operacion',
                'frecuencia_referencial',
                'activa',
                'deleted_at',
                'updated_at',
            ]
        );
    }

    private function seedFlights(
        $timestamp,
        array $flightDefinitions,
        array $routeDefinitions,
        array $aircraftDefinitions,
        array $airlineIds,
        array $stateIds
    ): void {
        $routeMap = [];
        foreach ($routeDefinitions as $route) {
            $routeMap[$route['codigo']] = $route;
        }

        $aircraftMap = [];
        foreach ($aircraftDefinitions as $aircraft) {
            $aircraftMap[$aircraft['matricula']] = $aircraft;
        }

        $routeIds = DB::table('rutas')->pluck('id', 'codigo')->all();
        $aircraftIds = DB::table('aviones')->pluck('id', 'matricula')->all();

        $rows = array_map(function (array $definition) use (
            $timestamp,
            $routeMap,
            $aircraftMap,
            $routeIds,
            $aircraftIds,
            $airlineIds,
            $stateIds
        ) {
            $route = $routeMap[$definition['ruta']];
            $aircraft = $aircraftMap[$definition['matricula']];
            $departure = now()->copy()->addDays($definition['dias'])->setTime(
                $definition['hora'],
                $definition['minuto'],
                0
            );
            $arrival = $departure->copy()->addMinutes($route['duracion_minutos'] + ($definition['ajuste_minutos'] ?? 0));

            return [
                'aerolinea_id' => $airlineIds[$definition['aerolinea']],
                'avion_id' => $aircraftIds[$definition['matricula']],
                'ruta_id' => $routeIds[$definition['ruta']],
                'estado_vuelo_id' => $stateIds[$definition['estado']],
                'codigo_vuelo' => $definition['codigo_vuelo'],
                'fecha_salida' => $departure,
                'fecha_llegada' => $arrival,
                'terminal' => $definition['terminal'],
                'puerta_embarque' => $definition['puerta'],
                'capacidad' => $aircraft['capacidad'],
                'precio_base' => round($route['tarifa_base'] * ($definition['factor_tarifa'] ?? 1), 2),
                'observaciones' => $definition['observaciones'],
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }, $flightDefinitions);

        DB::table('vuelos')->upsert(
            $rows,
            ['codigo_vuelo'],
            [
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
            ]
        );
    }

    private function seedPassengers($timestamp, array $definitions): void
    {
        $rows = array_map(function (array $definition) use ($timestamp) {
            return [
                ...$definition,
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }, $definitions);

        DB::table('pasajeros')->upsert(
            $rows,
            ['numero_documento'],
            [
                'nombres',
                'apellidos',
                'tipo_documento',
                'fecha_nacimiento',
                'nacionalidad',
                'telefono',
                'email',
                'deleted_at',
                'updated_at',
            ]
        );
    }

    private function seedReservations(
        $timestamp,
        array $flightDefinitions,
        array $routeDefinitions,
        array $passengerDefinitions,
        array $flightIds,
        array $passengerIds
    ): void {
        $routeMap = [];
        foreach ($routeDefinitions as $route) {
            $routeMap[$route['codigo']] = $route;
        }

        $passengerDocuments = array_column($passengerDefinitions, 'numero_documento');
        $rows = [];
        $reservationNumber = 2001;
        $passengerCursor = 0;

        foreach ($flightDefinitions as $flightIndex => $flight) {
            $route = $routeMap[$flight['ruta']];
            $reservationCount = 2 + ($flightIndex % 2);

            for ($index = 0; $index < $reservationCount; $index++) {
                $document = $passengerDocuments[$passengerCursor % count($passengerDocuments)];
                $class = ($reservationNumber % 5 === 0 || $index === 0 && $flightIndex % 4 === 0)
                    ? 'ejecutiva'
                    : 'economica';
                $state = $flight['estado'] === 'cancelado'
                    ? 'cancelada'
                    : (($flight['estado'] === 'demorado' && $index === 0) || $reservationNumber % 4 === 0
                        ? 'pendiente'
                        : 'confirmada');
                $departure = now()->copy()->addDays($flight['dias'])->setTime($flight['hora'], $flight['minuto'], 0);
                $price = round($route['tarifa_base'] * ($class === 'ejecutiva' ? 1.62 : 1.08), 2);

                $rows[] = [
                    'vuelo_id' => $flightIds[$flight['codigo_vuelo']],
                    'pasajero_id' => $passengerIds[$document],
                    'user_id' => null,
                    'codigo_reserva' => 'RSV-' . $reservationNumber,
                    'fecha_reserva' => $departure->copy()->subDays(2 + ($index % 4))->subHours($flightIndex % 6),
                    'asiento' => $this->seatLabel($index, $class),
                    'clase' => $class,
                    'estado' => $state,
                    'precio_total' => $price,
                    'equipaje_registrado' => $class === 'ejecutiva' || $reservationNumber % 3 !== 0,
                    'observaciones' => $this->reservationObservation($class, $state, $flight['estado']),
                    'deleted_at' => null,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ];

                $reservationNumber++;
                $passengerCursor++;
            }
        }

        DB::table('reservas')->upsert(
            $rows,
            ['codigo_reserva'],
            [
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
            ]
        );
    }

    private function seatLabel(int $index, string $class): string
    {
        $letters = ['A', 'C', 'D', 'F'];
        $rowBase = $class === 'ejecutiva' ? 2 : 10;

        return ($rowBase + $index) . $letters[$index % count($letters)];
    }

    private function reservationObservation(string $class, string $state, string $flightState): string
    {
        if ($state === 'cancelada') {
            return 'Reserva anulada por cancelacion operativa del vuelo.';
        }

        if ($flightState === 'demorado') {
            return 'Reserva afectada por ajuste temporal del itinerario.';
        }

        if ($class === 'ejecutiva') {
            return 'Reserva ejecutiva con prioridad de embarque.';
        }

        if ($state === 'pendiente') {
            return 'Reserva pendiente de verificacion comercial.';
        }

        return 'Reserva registrada correctamente para operacion regular.';
    }

    private function aircraftDefinitions(): array
    {
        return [
            ['aerolinea' => 'ALB', 'matricula' => 'CP-3201', 'modelo' => 'A320-200', 'fabricante' => 'Airbus', 'capacidad' => 180, 'alcance_km' => 6100, 'estado' => 'activo', 'dias_mantenimiento' => 12],
            ['aerolinea' => 'ALB', 'matricula' => 'CP-7378', 'modelo' => '737-800', 'fabricante' => 'Boeing', 'capacidad' => 162, 'alcance_km' => 5400, 'estado' => 'activo', 'dias_mantenimiento' => 30],
            ['aerolinea' => 'ALB', 'matricula' => 'CP-2205', 'modelo' => 'A220-300', 'fabricante' => 'Airbus', 'capacidad' => 145, 'alcance_km' => 6200, 'estado' => 'activo', 'dias_mantenimiento' => 18],
            ['aerolinea' => 'SKA', 'matricula' => 'OB-3210', 'modelo' => 'A321neo', 'fabricante' => 'Airbus', 'capacidad' => 200, 'alcance_km' => 7400, 'estado' => 'activo', 'dias_mantenimiento' => 15],
            ['aerolinea' => 'SKA', 'matricula' => 'OB-1907', 'modelo' => 'E190', 'fabricante' => 'Embraer', 'capacidad' => 112, 'alcance_km' => 4500, 'estado' => 'activo', 'dias_mantenimiento' => 9],
            ['aerolinea' => 'SKA', 'matricula' => 'OB-7871', 'modelo' => '787-8', 'fabricante' => 'Boeing', 'capacidad' => 242, 'alcance_km' => 13620, 'estado' => 'activo', 'dias_mantenimiento' => 22],
            ['aerolinea' => 'PAC', 'matricula' => 'CC-3208', 'modelo' => 'A320neo', 'fabricante' => 'Airbus', 'capacidad' => 186, 'alcance_km' => 6500, 'estado' => 'activo', 'dias_mantenimiento' => 14],
            ['aerolinea' => 'PAC', 'matricula' => 'CC-3217', 'modelo' => 'A321neo', 'fabricante' => 'Airbus', 'capacidad' => 210, 'alcance_km' => 7400, 'estado' => 'activo', 'dias_mantenimiento' => 21],
            ['aerolinea' => 'PAC', 'matricula' => 'CC-3304', 'modelo' => 'A330-300', 'fabricante' => 'Airbus', 'capacidad' => 278, 'alcance_km' => 11750, 'estado' => 'mantenimiento', 'dias_mantenimiento' => 5],
            ['aerolinea' => 'NVA', 'matricula' => 'ZS-7382', 'modelo' => '737-800', 'fabricante' => 'Boeing', 'capacidad' => 168, 'alcance_km' => 5400, 'estado' => 'activo', 'dias_mantenimiento' => 11],
            ['aerolinea' => 'NVA', 'matricula' => 'ZS-3214', 'modelo' => 'A321XLR', 'fabricante' => 'Airbus', 'capacidad' => 206, 'alcance_km' => 8700, 'estado' => 'activo', 'dias_mantenimiento' => 17],
            ['aerolinea' => 'NVA', 'matricula' => 'ZS-7874', 'modelo' => '787-9', 'fabricante' => 'Boeing', 'capacidad' => 290, 'alcance_km' => 14140, 'estado' => 'fuera_servicio', 'dias_mantenimiento' => 42],
        ];
    }

    private function routeDefinitions(): array
    {
        return [
            ['codigo' => 'VVI-LPB', 'origen' => 'VVI', 'destino' => 'LPB', 'distancia_km' => 550.00, 'duracion_minutos' => 55, 'tarifa_base' => 320.00, 'tipo_operacion' => 'nacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'LPB-CBB', 'origen' => 'LPB', 'destino' => 'CBB', 'distancia_km' => 230.00, 'duracion_minutos' => 40, 'tarifa_base' => 190.00, 'tipo_operacion' => 'nacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'VVI-LIM', 'origen' => 'VVI', 'destino' => 'LIM', 'distancia_km' => 1460.00, 'duracion_minutos' => 150, 'tarifa_base' => 680.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'VVI-SCL', 'origen' => 'VVI', 'destino' => 'SCL', 'distancia_km' => 1905.00, 'duracion_minutos' => 185, 'tarifa_base' => 740.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Interdiaria'],
            ['codigo' => 'VVI-EZE', 'origen' => 'VVI', 'destino' => 'EZE', 'distancia_km' => 1930.00, 'duracion_minutos' => 180, 'tarifa_base' => 770.00, 'tipo_operacion' => 'adicional', 'frecuencia_referencial' => 'Bajo demanda'],
            ['codigo' => 'VVI-GRU', 'origen' => 'VVI', 'destino' => 'GRU', 'distancia_km' => 1670.00, 'duracion_minutos' => 170, 'tarifa_base' => 720.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'LPB-CUZ', 'origen' => 'LPB', 'destino' => 'CUZ', 'distancia_km' => 535.00, 'duracion_minutos' => 70, 'tarifa_base' => 340.00, 'tipo_operacion' => 'adicional', 'frecuencia_referencial' => 'Lun-Mie-Vie'],
            ['codigo' => 'LIM-SCL', 'origen' => 'LIM', 'destino' => 'SCL', 'distancia_km' => 2460.00, 'duracion_minutos' => 220, 'tarifa_base' => 860.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'LIM-MAD', 'origen' => 'LIM', 'destino' => 'MAD', 'distancia_km' => 9520.00, 'duracion_minutos' => 720, 'tarifa_base' => 2950.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Semanal'],
            ['codigo' => 'GRU-MAD', 'origen' => 'GRU', 'destino' => 'MAD', 'distancia_km' => 8370.00, 'duracion_minutos' => 640, 'tarifa_base' => 2820.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Semanal'],
            ['codigo' => 'MAD-CDG', 'origen' => 'MAD', 'destino' => 'CDG', 'distancia_km' => 1050.00, 'duracion_minutos' => 125, 'tarifa_base' => 620.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'CDG-LHR', 'origen' => 'CDG', 'destino' => 'LHR', 'distancia_km' => 350.00, 'duracion_minutos' => 75, 'tarifa_base' => 410.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'JNB-NBO', 'origen' => 'JNB', 'destino' => 'NBO', 'distancia_km' => 2920.00, 'duracion_minutos' => 240, 'tarifa_base' => 980.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Interdiaria'],
            ['codigo' => 'CMN-MAD', 'origen' => 'CMN', 'destino' => 'MAD', 'distancia_km' => 845.00, 'duracion_minutos' => 110, 'tarifa_base' => 520.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'CAI-CDG', 'origen' => 'CAI', 'destino' => 'CDG', 'distancia_km' => 3210.00, 'duracion_minutos' => 285, 'tarifa_base' => 1120.00, 'tipo_operacion' => 'adicional', 'frecuencia_referencial' => 'Semanal'],
            ['codigo' => 'MEX-MIA', 'origen' => 'MEX', 'destino' => 'MIA', 'distancia_km' => 2050.00, 'duracion_minutos' => 185, 'tarifa_base' => 890.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Interdiaria'],
            ['codigo' => 'JFK-LHR', 'origen' => 'JFK', 'destino' => 'LHR', 'distancia_km' => 5540.00, 'duracion_minutos' => 420, 'tarifa_base' => 1590.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'BCN-CMN', 'origen' => 'BCN', 'destino' => 'CMN', 'distancia_km' => 1230.00, 'duracion_minutos' => 125, 'tarifa_base' => 590.00, 'tipo_operacion' => 'adicional', 'frecuencia_referencial' => 'Bajo demanda'],
            ['codigo' => 'BOG-MEX', 'origen' => 'BOG', 'destino' => 'MEX', 'distancia_km' => 3150.00, 'duracion_minutos' => 290, 'tarifa_base' => 1080.00, 'tipo_operacion' => 'adicional', 'frecuencia_referencial' => 'Semanal'],
            ['codigo' => 'SCL-EZE', 'origen' => 'SCL', 'destino' => 'EZE', 'distancia_km' => 1140.00, 'duracion_minutos' => 120, 'tarifa_base' => 610.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'MIA-JFK', 'origen' => 'MIA', 'destino' => 'JFK', 'distancia_km' => 1760.00, 'duracion_minutos' => 185, 'tarifa_base' => 760.00, 'tipo_operacion' => 'nacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'CPT-JNB', 'origen' => 'CPT', 'destino' => 'JNB', 'distancia_km' => 1270.00, 'duracion_minutos' => 125, 'tarifa_base' => 430.00, 'tipo_operacion' => 'nacional', 'frecuencia_referencial' => 'Diaria'],
        ];
    }

    private function flightDefinitions(): array
    {
        return [
            ['codigo_vuelo' => 'ALB101', 'aerolinea' => 'ALB', 'matricula' => 'CP-3201', 'ruta' => 'VVI-LPB', 'estado' => 'programado', 'dias' => 1, 'hora' => 7, 'minuto' => 30, 'terminal' => 'T1', 'puerta' => 'A3', 'observaciones' => 'Operacion regular matinal.', 'factor_tarifa' => 1.00],
            ['codigo_vuelo' => 'ALB145', 'aerolinea' => 'ALB', 'matricula' => 'CP-2205', 'ruta' => 'LPB-CBB', 'estado' => 'embarcando', 'dias' => 0, 'hora' => 10, 'minuto' => 5, 'terminal' => 'T2', 'puerta' => 'B1', 'observaciones' => 'Embarque abierto para tramo nacional.', 'factor_tarifa' => 1.00],
            ['codigo_vuelo' => 'ALB220', 'aerolinea' => 'ALB', 'matricula' => 'CP-7378', 'ruta' => 'VVI-LIM', 'estado' => 'demorado', 'dias' => 2, 'hora' => 16, 'minuto' => 20, 'terminal' => 'T1', 'puerta' => 'C4', 'observaciones' => 'Demora operativa para pruebas del panel.', 'factor_tarifa' => 1.08, 'ajuste_minutos' => 25],
            ['codigo_vuelo' => 'ALB305', 'aerolinea' => 'ALB', 'matricula' => 'CP-3201', 'ruta' => 'VVI-GRU', 'estado' => 'programado', 'dias' => 3, 'hora' => 13, 'minuto' => 10, 'terminal' => 'T1', 'puerta' => 'A6', 'observaciones' => 'Tramo internacional regional.', 'factor_tarifa' => 1.04],
            ['codigo_vuelo' => 'ALB390', 'aerolinea' => 'ALB', 'matricula' => 'CP-7378', 'ruta' => 'VVI-SCL', 'estado' => 'programado', 'dias' => 4, 'hora' => 18, 'minuto' => 5, 'terminal' => 'T2', 'puerta' => 'D2', 'observaciones' => 'Operacion de cierre de jornada.', 'factor_tarifa' => 1.06],
            ['codigo_vuelo' => 'ALB442', 'aerolinea' => 'ALB', 'matricula' => 'CP-2205', 'ruta' => 'LPB-CUZ', 'estado' => 'aterrizado', 'dias' => -1, 'hora' => 9, 'minuto' => 15, 'terminal' => 'T1', 'puerta' => 'A2', 'observaciones' => 'Vuelo historico ya completado.', 'factor_tarifa' => 1.00],

            ['codigo_vuelo' => 'SKA118', 'aerolinea' => 'SKA', 'matricula' => 'OB-3210', 'ruta' => 'LIM-SCL', 'estado' => 'programado', 'dias' => 1, 'hora' => 11, 'minuto' => 40, 'terminal' => 'T3', 'puerta' => 'E5', 'observaciones' => 'Conexión andina de alta demanda.', 'factor_tarifa' => 1.05],
            ['codigo_vuelo' => 'SKA204', 'aerolinea' => 'SKA', 'matricula' => 'OB-1907', 'ruta' => 'LPB-CUZ', 'estado' => 'embarcando', 'dias' => 0, 'hora' => 14, 'minuto' => 25, 'terminal' => 'T2', 'puerta' => 'B4', 'observaciones' => 'Salida casi inmediata.', 'factor_tarifa' => 1.00],
            ['codigo_vuelo' => 'SKA310', 'aerolinea' => 'SKA', 'matricula' => 'OB-7871', 'ruta' => 'LIM-MAD', 'estado' => 'programado', 'dias' => 5, 'hora' => 20, 'minuto' => 30, 'terminal' => 'T4', 'puerta' => 'G1', 'observaciones' => 'Trayecto intercontinental largo.', 'factor_tarifa' => 1.10],
            ['codigo_vuelo' => 'SKA488', 'aerolinea' => 'SKA', 'matricula' => 'OB-3210', 'ruta' => 'BOG-MEX', 'estado' => 'demorado', 'dias' => 2, 'hora' => 8, 'minuto' => 55, 'terminal' => 'T3', 'puerta' => 'F2', 'observaciones' => 'Demora por ajuste de slot aeroportuario.', 'factor_tarifa' => 1.07, 'ajuste_minutos' => 35],
            ['codigo_vuelo' => 'SKA512', 'aerolinea' => 'SKA', 'matricula' => 'OB-1907', 'ruta' => 'MEX-MIA', 'estado' => 'programado', 'dias' => 6, 'hora' => 7, 'minuto' => 5, 'terminal' => 'T2', 'puerta' => 'E2', 'observaciones' => 'Vuelo regional hacia Norteamérica.', 'factor_tarifa' => 1.03],
            ['codigo_vuelo' => 'SKA620', 'aerolinea' => 'SKA', 'matricula' => 'OB-7871', 'ruta' => 'JFK-LHR', 'estado' => 'cancelado', 'dias' => 7, 'hora' => 22, 'minuto' => 15, 'terminal' => 'T5', 'puerta' => 'H4', 'observaciones' => 'Cancelacion programada para pruebas de estados.', 'factor_tarifa' => 1.12],

            ['codigo_vuelo' => 'PAC130', 'aerolinea' => 'PAC', 'matricula' => 'CC-3208', 'ruta' => 'SCL-EZE', 'estado' => 'programado', 'dias' => 1, 'hora' => 6, 'minuto' => 50, 'terminal' => 'T1', 'puerta' => 'C1', 'observaciones' => 'Operacion temprana de alta rotacion.', 'factor_tarifa' => 1.00],
            ['codigo_vuelo' => 'PAC220', 'aerolinea' => 'PAC', 'matricula' => 'CC-3217', 'ruta' => 'GRU-MAD', 'estado' => 'programado', 'dias' => 3, 'hora' => 21, 'minuto' => 40, 'terminal' => 'T4', 'puerta' => 'J2', 'observaciones' => 'Servicio nocturno internacional.', 'factor_tarifa' => 1.09],
            ['codigo_vuelo' => 'PAC301', 'aerolinea' => 'PAC', 'matricula' => 'CC-3208', 'ruta' => 'MAD-CDG', 'estado' => 'en_vuelo', 'dias' => 0, 'hora' => 15, 'minuto' => 10, 'terminal' => 'T4', 'puerta' => 'K3', 'observaciones' => 'Vuelo europeo en seguimiento.', 'factor_tarifa' => 1.00],
            ['codigo_vuelo' => 'PAC470', 'aerolinea' => 'PAC', 'matricula' => 'CC-3217', 'ruta' => 'BCN-CMN', 'estado' => 'programado', 'dias' => 4, 'hora' => 12, 'minuto' => 35, 'terminal' => 'T3', 'puerta' => 'C7', 'observaciones' => 'Operacion mediterranea internacional.', 'factor_tarifa' => 1.02],
            ['codigo_vuelo' => 'PAC550', 'aerolinea' => 'PAC', 'matricula' => 'CC-3208', 'ruta' => 'CDG-LHR', 'estado' => 'aterrizado', 'dias' => -2, 'hora' => 17, 'minuto' => 20, 'terminal' => 'T2', 'puerta' => 'B8', 'observaciones' => 'Vuelo ya completado para historico.', 'factor_tarifa' => 1.00],
            ['codigo_vuelo' => 'PAC660', 'aerolinea' => 'PAC', 'matricula' => 'CC-3217', 'ruta' => 'MIA-JFK', 'estado' => 'programado', 'dias' => 8, 'hora' => 9, 'minuto' => 45, 'terminal' => 'T2', 'puerta' => 'D6', 'observaciones' => 'Rotacion comercial con alta demanda de negocios.', 'factor_tarifa' => 1.04],

            ['codigo_vuelo' => 'NVA140', 'aerolinea' => 'NVA', 'matricula' => 'ZS-7382', 'ruta' => 'JNB-NBO', 'estado' => 'programado', 'dias' => 2, 'hora' => 9, 'minuto' => 5, 'terminal' => 'T1', 'puerta' => 'A9', 'observaciones' => 'Conexion africana regional.', 'factor_tarifa' => 1.03],
            ['codigo_vuelo' => 'NVA280', 'aerolinea' => 'NVA', 'matricula' => 'ZS-3214', 'ruta' => 'CPT-JNB', 'estado' => 'embarcando', 'dias' => 0, 'hora' => 18, 'minuto' => 0, 'terminal' => 'T2', 'puerta' => 'B6', 'observaciones' => 'Embarque activo de ruta nacional.', 'factor_tarifa' => 1.00],
            ['codigo_vuelo' => 'NVA360', 'aerolinea' => 'NVA', 'matricula' => 'ZS-3214', 'ruta' => 'CAI-CDG', 'estado' => 'programado', 'dias' => 5, 'hora' => 23, 'minuto' => 15, 'terminal' => 'T3', 'puerta' => 'F8', 'observaciones' => 'Operacion nocturna hacia Europa.', 'factor_tarifa' => 1.08],
            ['codigo_vuelo' => 'NVA490', 'aerolinea' => 'NVA', 'matricula' => 'ZS-7382', 'ruta' => 'CMN-MAD', 'estado' => 'demorado', 'dias' => 1, 'hora' => 19, 'minuto' => 10, 'terminal' => 'T1', 'puerta' => 'C9', 'observaciones' => 'Ajuste operativo en salida por congestion.', 'factor_tarifa' => 1.03, 'ajuste_minutos' => 20],
            ['codigo_vuelo' => 'NVA575', 'aerolinea' => 'NVA', 'matricula' => 'ZS-3214', 'ruta' => 'MEX-MIA', 'estado' => 'programado', 'dias' => 6, 'hora' => 15, 'minuto' => 55, 'terminal' => 'T2', 'puerta' => 'E9', 'observaciones' => 'Servicio de enlace transfronterizo.', 'factor_tarifa' => 1.01],
            ['codigo_vuelo' => 'NVA710', 'aerolinea' => 'NVA', 'matricula' => 'ZS-7382', 'ruta' => 'VVI-EZE', 'estado' => 'programado', 'dias' => 9, 'hora' => 11, 'minuto' => 15, 'terminal' => 'T1', 'puerta' => 'A7', 'observaciones' => 'Ruta sudamericana para pruebas de simulacion.', 'factor_tarifa' => 1.05],
        ];
    }

    private function passengerDefinitions(): array
    {
        $firstNames = [
            'Mariana', 'Carlos', 'Lucia', 'Jorge', 'Daniela', 'Sergio', 'Valeria', 'Andres',
            'Natalia', 'Diego', 'Camila', 'Rodrigo', 'Fernanda', 'Mateo', 'Paola', 'Cristian',
            'Gabriela', 'Luis', 'Erika', 'Martin', 'Sofia', 'Raul', 'Tatiana', 'Bruno',
            'Elena', 'Hector', 'Noelia', 'Ivan', 'Pilar', 'Samuel', 'Renata', 'Alvaro',
            'Micaela', 'Nicolas', 'Ariana', 'Julian',
        ];

        $lastNames = [
            'Suarez', 'Mendoza', 'Quinteros', 'Rojas', 'Flores', 'Vega', 'Lopez', 'Perez',
            'Salazar', 'Navarro', 'Camacho', 'Vargas', 'Gutierrez', 'Torrez', 'Soto', 'Cabrera',
            'Romero', 'Paredes', 'Ortiz', 'Valdez', 'Aguilar', 'Rivera', 'Mamani', 'Arias',
            'Molina', 'Castro', 'Morales', 'Bravo', 'Serrano', 'Luna', 'Medina', 'Herrera',
            'Miranda', 'Alvarez', 'Prieto', 'Rios',
        ];

        $nationalities = [
            'Boliviana', 'Peruana', 'Chilena', 'Argentina', 'Brasileña', 'Colombiana',
            'Mexicana', 'Estadounidense', 'Española', 'Francesa', 'Britanica', 'Sudafricana',
        ];

        $documentTypes = ['CI', 'Pasaporte', 'DNI'];
        $rows = [];

        for ($index = 0; $index < 36; $index++) {
            $type = $documentTypes[$index % count($documentTypes)];
            $firstName = $firstNames[$index];
            $lastNameA = $lastNames[$index];
            $lastNameB = $lastNames[($index + 7) % count($lastNames)];
            $document = $type === 'Pasaporte'
                ? 'PA' . str_pad((string) (930000 + $index), 6, '0', STR_PAD_LEFT)
                : (string) (7000000 + ($index * 137));

            $rows[] = [
                'nombres' => $firstName,
                'apellidos' => $lastNameA . ' ' . $lastNameB,
                'tipo_documento' => $type,
                'numero_documento' => $document,
                'fecha_nacimiento' => now()->subYears(22 + ($index % 17))->subDays($index * 9)->toDateString(),
                'nacionalidad' => $nationalities[$index % count($nationalities)],
                'telefono' => '+591 7' . str_pad((string) (3000000 + $index * 93), 7, '0', STR_PAD_LEFT),
                'email' => strtolower($firstName . '.' . $lastNameA . ($index + 1) . '@demoaero.test'),
            ];
        }

        return $rows;
    }
}
