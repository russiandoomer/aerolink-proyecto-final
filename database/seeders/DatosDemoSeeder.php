<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatosDemoSeeder extends Seeder
{
    public function run(): void
    {
        $timestamp = now();
        $airlineDefinitions = $this->airlineDefinitions();

        $this->cleanupLegacyAirlines();
        $this->seedAirlines($timestamp, $airlineDefinitions);

        $airlineIds = DB::table('aerolineas')->pluck('id', 'codigo_iata')->all();
        $this->cleanupDemoOperationalData(array_values($airlineIds));
        $this->cleanupDemoPassengers();
        $airportIds = DB::table('aeropuertos')->pluck('id', 'codigo_iata')->all();
        $airportCountries = DB::table('aeropuertos')->pluck('pais', 'codigo_iata')->all();
        $stateIds = DB::table('estados_vuelo')->pluck('id', 'codigo')->all();

        $aircraftDefinitions = $this->aircraftDefinitions($airlineDefinitions);
        $routeDefinitions = $this->routeDefinitions();
        $flightDefinitions = array_merge(
            $this->manualFlightDefinitions(),
            $this->generatedFlightDefinitions(
                $airlineDefinitions,
                $aircraftDefinitions,
                $routeDefinitions,
                $airportCountries
            )
        );
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

    private function cleanupLegacyAirlines(): void
    {
        $legacyNames = ['BOLIVIA', 'JEFER', 'GOL', 'ALM'];
        $legacyCodes = ['GOL', 'ALM'];

        $airlineIds = DB::table('aerolineas')
            ->whereIn(DB::raw('UPPER(nombre)'), $legacyNames)
            ->orWhereIn(DB::raw('UPPER(COALESCE(codigo_iata, \'\'))'), $legacyCodes)
            ->pluck('id')
            ->all();

        if (count($airlineIds) === 0) {
            return;
        }

        $flightIds = DB::table('vuelos')
            ->whereIn('aerolinea_id', $airlineIds)
            ->pluck('id')
            ->all();

        if (count($flightIds) > 0) {
            DB::table('reservas')->whereIn('vuelo_id', $flightIds)->delete();
            DB::table('vuelos')->whereIn('id', $flightIds)->delete();
        }

        DB::table('aviones')->whereIn('aerolinea_id', $airlineIds)->delete();
        DB::table('aerolineas')->whereIn('id', $airlineIds)->delete();
    }

    private function cleanupDemoOperationalData(array $airlineIds): void
    {
        if (count($airlineIds) === 0) {
            return;
        }

        $flightIds = DB::table('vuelos')
            ->whereIn('aerolinea_id', $airlineIds)
            ->pluck('id')
            ->all();

        if (count($flightIds) > 0) {
            DB::table('reservas')->whereIn('vuelo_id', $flightIds)->delete();
            DB::table('vuelos')->whereIn('id', $flightIds)->delete();
        }

        DB::table('aviones')->whereIn('aerolinea_id', $airlineIds)->delete();
    }

    private function cleanupDemoPassengers(): void
    {
        DB::table('pasajeros')
            ->where('email', 'like', '%@demoaero.test')
            ->delete();
    }

    private function seedAirlines($timestamp, array $definitions): void
    {
        $rows = array_map(function (array $definition) use ($timestamp) {
            return [
                ...$definition,
                'deleted_at' => null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }, $definitions);

        DB::table('aerolineas')->upsert(
            $rows,
            ['codigo_iata'],
            ['nombre', 'pais', 'telefono', 'email', 'activa', 'deleted_at', 'updated_at']
        );
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

    private function airlineDefinitions(): array
    {
        $countryCatalog = [
            'Bolivia' => [
                ['codigo' => 'ALB', 'nombre' => 'AeroLink Andina'],
                ['codigo' => 'BVA', 'nombre' => 'Altiplano Air'],
                ['codigo' => 'BVC', 'nombre' => 'Oriente Connect'],
                ['codigo' => 'BVD', 'nombre' => 'Condor Jet'],
            ],
            'Peru' => [
                ['codigo' => 'SKA', 'nombre' => 'SkyBridge Andes'],
                ['codigo' => 'PEA', 'nombre' => 'Inca Pacific Air'],
                ['codigo' => 'PEB', 'nombre' => 'Sierra Peru Lines'],
                ['codigo' => 'PEC', 'nombre' => 'Costa Peru Jet'],
            ],
            'Chile' => [
                ['codigo' => 'PAC', 'nombre' => 'Pacifica Air'],
                ['codigo' => 'CLA', 'nombre' => 'Cordillera Chile Air'],
                ['codigo' => 'CLB', 'nombre' => 'Atacama Blue'],
                ['codigo' => 'CLC', 'nombre' => 'Sur Chile Connect'],
            ],
            'Argentina' => [
                ['codigo' => 'ARA', 'nombre' => 'Pampas Air'],
                ['codigo' => 'ARB', 'nombre' => 'Rio de la Plata Jet'],
                ['codigo' => 'ARC', 'nombre' => 'Cordoba Connect'],
                ['codigo' => 'ARD', 'nombre' => 'Austral Red'],
            ],
            'Brasil' => [
                ['codigo' => 'BRA', 'nombre' => 'Amazonia Brasil'],
                ['codigo' => 'BRB', 'nombre' => 'Paulista Air'],
                ['codigo' => 'BRC', 'nombre' => 'Costa Brasil Wings'],
                ['codigo' => 'BRD', 'nombre' => 'Verde Azul Airlines'],
            ],
            'Colombia' => [
                ['codigo' => 'COA', 'nombre' => 'Sabana Air'],
                ['codigo' => 'COB', 'nombre' => 'Caribe Colombia'],
                ['codigo' => 'COC', 'nombre' => 'Andina Connect'],
                ['codigo' => 'COD', 'nombre' => 'Nevado Jet'],
            ],
            'Mexico' => [
                ['codigo' => 'MXA', 'nombre' => 'Maya Air'],
                ['codigo' => 'MXB', 'nombre' => 'Azteca Connect'],
                ['codigo' => 'MXC', 'nombre' => 'Pacifico Mex'],
                ['codigo' => 'MXD', 'nombre' => 'Norte Mexico Lines'],
            ],
            'Estados Unidos' => [
                ['codigo' => 'USA', 'nombre' => 'Liberty States Air'],
                ['codigo' => 'USB', 'nombre' => 'Atlantic Union'],
                ['codigo' => 'USC', 'nombre' => 'Coastline America'],
                ['codigo' => 'USD', 'nombre' => 'Skyline Domestic'],
            ],
            'Espana' => [
                ['codigo' => 'ESA', 'nombre' => 'Hispania Air'],
                ['codigo' => 'ESB', 'nombre' => 'Costa Iberica'],
                ['codigo' => 'ESC', 'nombre' => 'Meseta Connect'],
                ['codigo' => 'ESD', 'nombre' => 'Sol Europa'],
            ],
            'Francia' => [
                ['codigo' => 'FRA', 'nombre' => 'Hexagone Air'],
                ['codigo' => 'FRB', 'nombre' => 'Bleu Horizon'],
                ['codigo' => 'FRC', 'nombre' => 'Aero Seine'],
                ['codigo' => 'FRD', 'nombre' => 'Riviera France'],
            ],
            'Reino Unido' => [
                ['codigo' => 'UKA', 'nombre' => 'Crown Air UK'],
                ['codigo' => 'UKB', 'nombre' => 'Albion Connect'],
                ['codigo' => 'UKC', 'nombre' => 'NorthBridge Airways'],
                ['codigo' => 'UKD', 'nombre' => 'Thames Jet'],
            ],
            'Marruecos' => [
                ['codigo' => 'MRA', 'nombre' => 'Atlas Maroc'],
                ['codigo' => 'MRB', 'nombre' => 'Maghreb Air'],
                ['codigo' => 'MRC', 'nombre' => 'Sahara Connect'],
                ['codigo' => 'MRD', 'nombre' => 'Casablanca Wings'],
            ],
            'Egipto' => [
                ['codigo' => 'EGA', 'nombre' => 'Nile Sky'],
                ['codigo' => 'EGB', 'nombre' => 'Pharaoh Air'],
                ['codigo' => 'EGC', 'nombre' => 'Delta Egypt'],
                ['codigo' => 'EGD', 'nombre' => 'Sphinx Airways'],
            ],
            'Sudafrica' => [
                ['codigo' => 'NVA', 'nombre' => 'Nova Atlantic'],
                ['codigo' => 'SZA', 'nombre' => 'CapeConnect'],
                ['codigo' => 'SZB', 'nombre' => 'Safari Jet'],
                ['codigo' => 'SZC', 'nombre' => 'Ubuntu Air'],
            ],
            'Kenia' => [
                ['codigo' => 'KEA', 'nombre' => 'Savanna Air'],
                ['codigo' => 'KEB', 'nombre' => 'Rift Valley Connect'],
                ['codigo' => 'KEC', 'nombre' => 'Nairobi Wings'],
                ['codigo' => 'KED', 'nombre' => 'Equator Jet'],
            ],
        ];

        $dialCodes = [
            'Bolivia' => '+591',
            'Peru' => '+51',
            'Chile' => '+56',
            'Argentina' => '+54',
            'Brasil' => '+55',
            'Colombia' => '+57',
            'Mexico' => '+52',
            'Estados Unidos' => '+1',
            'Espana' => '+34',
            'Francia' => '+33',
            'Reino Unido' => '+44',
            'Marruecos' => '+212',
            'Egipto' => '+20',
            'Sudafrica' => '+27',
            'Kenia' => '+254',
        ];

        $rows = [];

        foreach ($countryCatalog as $country => $airlines) {
            foreach ($airlines as $index => $airline) {
                $rows[] = [
                    'nombre' => $airline['nombre'],
                    'codigo_iata' => $airline['codigo'],
                    'pais' => $country,
                    'telefono' => sprintf('%s %d %06d', $dialCodes[$country], 2 + ($index % 7), 220000 + ($index * 731)),
                    'email' => 'ops.' . strtolower($airline['codigo']) . '@demoaero.test',
                    'activa' => true,
                ];
            }
        }

        return $rows;
    }

    private function aircraftDefinitions(array $airlineDefinitions): array
    {
        $coreFleet = [
            'ALB' => [
                ['matricula' => 'CP-2205', 'modelo' => 'A220-300', 'fabricante' => 'Airbus', 'capacidad' => 145, 'alcance_km' => 6200],
                ['matricula' => 'CP-3201', 'modelo' => 'A320-200', 'fabricante' => 'Airbus', 'capacidad' => 180, 'alcance_km' => 6100],
                ['matricula' => 'CP-7378', 'modelo' => '737-800', 'fabricante' => 'Boeing', 'capacidad' => 162, 'alcance_km' => 5400],
                ['matricula' => 'CP-7871', 'modelo' => '787-8', 'fabricante' => 'Boeing', 'capacidad' => 242, 'alcance_km' => 13620],
            ],
            'SKA' => [
                ['matricula' => 'OB-1907', 'modelo' => 'E190-E2', 'fabricante' => 'Embraer', 'capacidad' => 114, 'alcance_km' => 5278],
                ['matricula' => 'OB-2206', 'modelo' => 'A220-300', 'fabricante' => 'Airbus', 'capacidad' => 145, 'alcance_km' => 6200],
                ['matricula' => 'OB-3210', 'modelo' => 'A321neo', 'fabricante' => 'Airbus', 'capacidad' => 200, 'alcance_km' => 7400],
                ['matricula' => 'OB-7871', 'modelo' => '787-8', 'fabricante' => 'Boeing', 'capacidad' => 242, 'alcance_km' => 13620],
            ],
            'PAC' => [
                ['matricula' => 'CC-2204', 'modelo' => 'A220-300', 'fabricante' => 'Airbus', 'capacidad' => 145, 'alcance_km' => 6200],
                ['matricula' => 'CC-3208', 'modelo' => 'A320neo', 'fabricante' => 'Airbus', 'capacidad' => 186, 'alcance_km' => 6500],
                ['matricula' => 'CC-3217', 'modelo' => 'A321neo', 'fabricante' => 'Airbus', 'capacidad' => 210, 'alcance_km' => 7400],
                ['matricula' => 'CC-7879', 'modelo' => '787-8', 'fabricante' => 'Boeing', 'capacidad' => 242, 'alcance_km' => 13620],
            ],
            'NVA' => [
                ['matricula' => 'ZS-1906', 'modelo' => 'E190-E2', 'fabricante' => 'Embraer', 'capacidad' => 114, 'alcance_km' => 5278],
                ['matricula' => 'ZS-7382', 'modelo' => '737-800', 'fabricante' => 'Boeing', 'capacidad' => 168, 'alcance_km' => 5400],
                ['matricula' => 'ZS-3214', 'modelo' => 'A321XLR', 'fabricante' => 'Airbus', 'capacidad' => 206, 'alcance_km' => 8700],
                ['matricula' => 'ZS-7874', 'modelo' => '787-9', 'fabricante' => 'Boeing', 'capacidad' => 290, 'alcance_km' => 14140],
            ],
        ];

        $profiles = [
            ['modelo' => 'E190-E2', 'fabricante' => 'Embraer', 'capacidad' => 114, 'alcance_km' => 5278],
            ['modelo' => 'A220-300', 'fabricante' => 'Airbus', 'capacidad' => 145, 'alcance_km' => 6200],
            ['modelo' => 'A320neo', 'fabricante' => 'Airbus', 'capacidad' => 186, 'alcance_km' => 6500],
            ['modelo' => '787-8', 'fabricante' => 'Boeing', 'capacidad' => 242, 'alcance_km' => 13620],
        ];

        $definitions = [];

        foreach ($airlineDefinitions as $airlineIndex => $definition) {
            $airlineCode = $definition['codigo_iata'];
            $fleet = $coreFleet[$airlineCode] ?? array_map(
                function (array $profile, int $profileIndex) use ($airlineCode) {
                    return [
                        'matricula' => sprintf('%s-%03d', $airlineCode, 101 + $profileIndex),
                        ...$profile,
                    ];
                },
                $profiles,
                array_keys($profiles)
            );

            foreach ($fleet as $fleetIndex => $aircraft) {
                $definitions[] = [
                    'aerolinea' => $airlineCode,
                    'matricula' => $aircraft['matricula'],
                    'modelo' => $aircraft['modelo'],
                    'fabricante' => $aircraft['fabricante'],
                    'capacidad' => $aircraft['capacidad'],
                    'alcance_km' => $aircraft['alcance_km'],
                    'estado' => 'activo',
                    'dias_mantenimiento' => 7 + (($airlineIndex + $fleetIndex) % 18),
                ];
            }
        }

        return $definitions;
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
            ['codigo' => 'LIM-AQP', 'origen' => 'LIM', 'destino' => 'AQP', 'distancia_km' => 765.00, 'duracion_minutos' => 95, 'tarifa_base' => 280.00, 'tipo_operacion' => 'nacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'LIM-SCL', 'origen' => 'LIM', 'destino' => 'SCL', 'distancia_km' => 2460.00, 'duracion_minutos' => 220, 'tarifa_base' => 860.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'LIM-MAD', 'origen' => 'LIM', 'destino' => 'MAD', 'distancia_km' => 9520.00, 'duracion_minutos' => 720, 'tarifa_base' => 2950.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Semanal'],
            ['codigo' => 'SCL-IQQ', 'origen' => 'SCL', 'destino' => 'IQQ', 'distancia_km' => 1465.00, 'duracion_minutos' => 160, 'tarifa_base' => 530.00, 'tipo_operacion' => 'nacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'GRU-MAD', 'origen' => 'GRU', 'destino' => 'MAD', 'distancia_km' => 8370.00, 'duracion_minutos' => 640, 'tarifa_base' => 2820.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Semanal'],
            ['codigo' => 'GRU-GIG', 'origen' => 'GRU', 'destino' => 'GIG', 'distancia_km' => 360.00, 'duracion_minutos' => 65, 'tarifa_base' => 290.00, 'tipo_operacion' => 'nacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'EZE-COR', 'origen' => 'EZE', 'destino' => 'COR', 'distancia_km' => 650.00, 'duracion_minutos' => 80, 'tarifa_base' => 360.00, 'tipo_operacion' => 'nacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'BOG-MDE', 'origen' => 'BOG', 'destino' => 'MDE', 'distancia_km' => 215.00, 'duracion_minutos' => 55, 'tarifa_base' => 260.00, 'tipo_operacion' => 'nacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'MEX-CUN', 'origen' => 'MEX', 'destino' => 'CUN', 'distancia_km' => 1285.00, 'duracion_minutos' => 155, 'tarifa_base' => 440.00, 'tipo_operacion' => 'nacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'MAD-BCN', 'origen' => 'MAD', 'destino' => 'BCN', 'distancia_km' => 505.00, 'duracion_minutos' => 75, 'tarifa_base' => 340.00, 'tipo_operacion' => 'nacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'MAD-CDG', 'origen' => 'MAD', 'destino' => 'CDG', 'distancia_km' => 1050.00, 'duracion_minutos' => 125, 'tarifa_base' => 620.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'CDG-LHR', 'origen' => 'CDG', 'destino' => 'LHR', 'distancia_km' => 350.00, 'duracion_minutos' => 75, 'tarifa_base' => 410.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'JNB-NBO', 'origen' => 'JNB', 'destino' => 'NBO', 'distancia_km' => 2920.00, 'duracion_minutos' => 240, 'tarifa_base' => 980.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Interdiaria'],
            ['codigo' => 'CMN-RAK', 'origen' => 'CMN', 'destino' => 'RAK', 'distancia_km' => 220.00, 'duracion_minutos' => 55, 'tarifa_base' => 240.00, 'tipo_operacion' => 'nacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'CMN-MAD', 'origen' => 'CMN', 'destino' => 'MAD', 'distancia_km' => 845.00, 'duracion_minutos' => 110, 'tarifa_base' => 520.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'CAI-HRG', 'origen' => 'CAI', 'destino' => 'HRG', 'distancia_km' => 400.00, 'duracion_minutos' => 65, 'tarifa_base' => 300.00, 'tipo_operacion' => 'nacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'CAI-CDG', 'origen' => 'CAI', 'destino' => 'CDG', 'distancia_km' => 3210.00, 'duracion_minutos' => 285, 'tarifa_base' => 1120.00, 'tipo_operacion' => 'adicional', 'frecuencia_referencial' => 'Semanal'],
            ['codigo' => 'MEX-MIA', 'origen' => 'MEX', 'destino' => 'MIA', 'distancia_km' => 2050.00, 'duracion_minutos' => 185, 'tarifa_base' => 890.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Interdiaria'],
            ['codigo' => 'JFK-LHR', 'origen' => 'JFK', 'destino' => 'LHR', 'distancia_km' => 5540.00, 'duracion_minutos' => 420, 'tarifa_base' => 1590.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'BCN-CMN', 'origen' => 'BCN', 'destino' => 'CMN', 'distancia_km' => 1230.00, 'duracion_minutos' => 125, 'tarifa_base' => 590.00, 'tipo_operacion' => 'adicional', 'frecuencia_referencial' => 'Bajo demanda'],
            ['codigo' => 'BOG-MEX', 'origen' => 'BOG', 'destino' => 'MEX', 'distancia_km' => 3150.00, 'duracion_minutos' => 290, 'tarifa_base' => 1080.00, 'tipo_operacion' => 'adicional', 'frecuencia_referencial' => 'Semanal'],
            ['codigo' => 'SCL-EZE', 'origen' => 'SCL', 'destino' => 'EZE', 'distancia_km' => 1140.00, 'duracion_minutos' => 120, 'tarifa_base' => 610.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'MIA-JFK', 'origen' => 'MIA', 'destino' => 'JFK', 'distancia_km' => 1760.00, 'duracion_minutos' => 185, 'tarifa_base' => 760.00, 'tipo_operacion' => 'nacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'CPT-JNB', 'origen' => 'CPT', 'destino' => 'JNB', 'distancia_km' => 1270.00, 'duracion_minutos' => 125, 'tarifa_base' => 430.00, 'tipo_operacion' => 'nacional', 'frecuencia_referencial' => 'Diaria'],
            ['codigo' => 'NBO-CAI', 'origen' => 'NBO', 'destino' => 'CAI', 'distancia_km' => 3530.00, 'duracion_minutos' => 305, 'tarifa_base' => 1170.00, 'tipo_operacion' => 'internacional', 'frecuencia_referencial' => 'Semanal'],
        ];
    }

    private function manualFlightDefinitions(): array
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

    private function generatedFlightDefinitions(
        array $airlineDefinitions,
        array $aircraftDefinitions,
        array $routeDefinitions,
        array $airportCountries
    ): array {
        $manualAirlineCodes = ['ALB', 'SKA', 'PAC', 'NVA'];
        $aircraftByAirline = [];

        foreach ($aircraftDefinitions as $aircraft) {
            $aircraftByAirline[$aircraft['aerolinea']][] = $aircraft;
        }

        $routeCatalog = array_map(function (array $route) use ($airportCountries) {
            return [
                ...$route,
                'pais_origen' => $airportCountries[$route['origen']] ?? '',
                'pais_destino' => $airportCountries[$route['destino']] ?? '',
            ];
        }, $routeDefinitions);

        $generatedFlights = [];

        foreach ($airlineDefinitions as $airlineIndex => $definition) {
            $airlineCode = $definition['codigo_iata'];

            if (in_array($airlineCode, $manualAirlineCodes, true)) {
                continue;
            }

            $preferredRoutes = array_slice(
                $this->selectPreferredRoutesForCountry($definition['pais'], $routeCatalog),
                0,
                2
            );

            foreach ($preferredRoutes as $routeIndex => $route) {
                $aircraft = $this->selectAircraftForRoute(
                    $aircraftByAirline[$airlineCode] ?? [],
                    (float) $route['distancia_km'],
                    $routeIndex
                );

                if (!$aircraft) {
                    continue;
                }

                $flightNumber = 100 + (($airlineIndex % 8) * 20) + ($routeIndex * 7) + 1;
                $hour = 6 + (($airlineIndex + ($routeIndex * 3)) % 12);
                $minute = $routeIndex === 0 ? 10 : 45;
                $states = ['programado', 'embarcando', 'programado', 'demorado'];
                $state = $states[($airlineIndex + $routeIndex) % count($states)];

                $generatedFlights[] = [
                    'codigo_vuelo' => $airlineCode . str_pad((string) $flightNumber, 3, '0', STR_PAD_LEFT),
                    'aerolinea' => $airlineCode,
                    'matricula' => $aircraft['matricula'],
                    'ruta' => $route['codigo'],
                    'estado' => $state,
                    'dias' => 1 + (($airlineIndex + $routeIndex) % 6),
                    'hora' => $hour,
                    'minuto' => $minute,
                    'terminal' => 'T' . (1 + (($airlineIndex + $routeIndex) % 4)),
                    'puerta' => chr(65 + (($airlineIndex + $routeIndex) % 6)) . (2 + (($airlineIndex + $routeIndex) % 8)),
                    'observaciones' => sprintf(
                        'Vuelo demo de %s operando la ruta %s.',
                        $definition['nombre'],
                        $route['codigo']
                    ),
                    'factor_tarifa' => 1 + ((($airlineIndex + $routeIndex) % 4) * 0.03),
                    'ajuste_minutos' => $state === 'demorado' ? 20 : 0,
                ];
            }
        }

        return $generatedFlights;
    }

    private function selectPreferredRoutesForCountry(string $country, array $routeCatalog): array
    {
        $compatibleRoutes = array_values(array_filter($routeCatalog, function (array $route) use ($country) {
            if ($route['tipo_operacion'] === 'nacional') {
                return $route['pais_origen'] === $country && $route['pais_destino'] === $country;
            }

            return $route['pais_origen'] === $country || $route['pais_destino'] === $country;
        }));

        usort($compatibleRoutes, function (array $left, array $right) use ($country) {
            $leftScore = $this->routePriorityForCountry($country, $left);
            $rightScore = $this->routePriorityForCountry($country, $right);

            if ($leftScore !== $rightScore) {
                return $rightScore <=> $leftScore;
            }

            return strcmp($left['codigo'], $right['codigo']);
        });

        return $compatibleRoutes;
    }

    private function routePriorityForCountry(string $country, array $route): int
    {
        $score = 0;

        if ($route['tipo_operacion'] === 'nacional') {
            $score += 8;
        }

        if ($route['tipo_operacion'] === 'internacional') {
            $score += 4;
        }

        if ($route['pais_origen'] === $country) {
            $score += 5;
        }

        if ($route['pais_destino'] === $country) {
            $score += 4;
        }

        return $score;
    }

    private function selectAircraftForRoute(array $aircraft, float $distanceKm, int $routeIndex): ?array
    {
        $eligibleAircraft = array_values(array_filter($aircraft, function (array $item) use ($distanceKm) {
            return ($item['estado'] ?? 'activo') === 'activo'
                && (float) $item['alcance_km'] >= $distanceKm + 350;
        }));

        if (count($eligibleAircraft) === 0) {
            return null;
        }

        usort($eligibleAircraft, fn (array $left, array $right) => $left['alcance_km'] <=> $right['alcance_km']);

        return $eligibleAircraft[min($routeIndex, count($eligibleAircraft) - 1)];
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

        for ($index = 0; $index < 72; $index++) {
            $type = $documentTypes[$index % count($documentTypes)];
            $firstName = $firstNames[$index % count($firstNames)];
            $lastNameA = $lastNames[$index % count($lastNames)];
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
