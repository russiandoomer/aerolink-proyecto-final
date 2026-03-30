<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AeropuertoCatalogoSeeder extends Seeder
{
    public function run(): void
    {
        $timestamp = now();

        $aeropuertos = [
            ['nombre' => 'Aeropuerto Internacional Viru Viru', 'codigo_iata' => 'VVI', 'codigo_icao' => 'SLVR', 'ciudad' => 'Santa Cruz', 'pais' => 'Bolivia', 'latitud' => -17.6447000, 'longitud' => -63.1354000],
            ['nombre' => 'Aeropuerto Internacional El Alto', 'codigo_iata' => 'LPB', 'codigo_icao' => 'SLLP', 'ciudad' => 'La Paz', 'pais' => 'Bolivia', 'latitud' => -16.5133000, 'longitud' => -68.1923000],
            ['nombre' => 'Aeropuerto Jorge Wilstermann', 'codigo_iata' => 'CBB', 'codigo_icao' => 'SLCB', 'ciudad' => 'Cochabamba', 'pais' => 'Bolivia', 'latitud' => -17.4211000, 'longitud' => -66.1771000],
            ['nombre' => 'Aeropuerto Alcantari', 'codigo_iata' => 'SRE', 'codigo_icao' => 'SLAL', 'ciudad' => 'Sucre', 'pais' => 'Bolivia', 'latitud' => -19.2468000, 'longitud' => -65.1496000],
            ['nombre' => 'Aeropuerto Capitán Oriel Lea Plaza', 'codigo_iata' => 'TJA', 'codigo_icao' => 'SLTJ', 'ciudad' => 'Tarija', 'pais' => 'Bolivia', 'latitud' => -21.5557000, 'longitud' => -64.7013000],
            ['nombre' => 'Aeropuerto Teniente Jorge Henrich Arauz', 'codigo_iata' => 'TDD', 'codigo_icao' => 'SLTR', 'ciudad' => 'Trinidad', 'pais' => 'Bolivia', 'latitud' => -14.8187000, 'longitud' => -64.9180000],
            ['nombre' => 'Aeropuerto Internacional Jorge Chavez', 'codigo_iata' => 'LIM', 'codigo_icao' => 'SPJC', 'ciudad' => 'Lima', 'pais' => 'Peru', 'latitud' => -12.0219000, 'longitud' => -77.1143000],
            ['nombre' => 'Aeropuerto Alejandro Velasco Astete', 'codigo_iata' => 'CUZ', 'codigo_icao' => 'SPZO', 'ciudad' => 'Cusco', 'pais' => 'Peru', 'latitud' => -13.5357000, 'longitud' => -71.9388000],
            ['nombre' => 'Aeropuerto Rodriguez Ballon', 'codigo_iata' => 'AQP', 'codigo_icao' => 'SPQU', 'ciudad' => 'Arequipa', 'pais' => 'Peru', 'latitud' => -16.3411000, 'longitud' => -71.5831000],
            ['nombre' => 'Aeropuerto Arturo Merino Benitez', 'codigo_iata' => 'SCL', 'codigo_icao' => 'SCEL', 'ciudad' => 'Santiago', 'pais' => 'Chile', 'latitud' => -33.3929000, 'longitud' => -70.7858000],
            ['nombre' => 'Aeropuerto Andres Sabella', 'codigo_iata' => 'ANF', 'codigo_icao' => 'SCFA', 'ciudad' => 'Antofagasta', 'pais' => 'Chile', 'latitud' => -23.4445000, 'longitud' => -70.4451000],
            ['nombre' => 'Aeropuerto Diego Aracena', 'codigo_iata' => 'IQQ', 'codigo_icao' => 'SCDA', 'ciudad' => 'Iquique', 'pais' => 'Chile', 'latitud' => -20.5352000, 'longitud' => -70.1813000],
            ['nombre' => 'Aeropuerto Internacional El Tepual', 'codigo_iata' => 'PMC', 'codigo_icao' => 'SCTE', 'ciudad' => 'Puerto Montt', 'pais' => 'Chile', 'latitud' => -41.4389000, 'longitud' => -73.0939000],
            ['nombre' => 'Aeropuerto Internacional Ministro Pistarini', 'codigo_iata' => 'EZE', 'codigo_icao' => 'SAEZ', 'ciudad' => 'Buenos Aires', 'pais' => 'Argentina', 'latitud' => -34.8222000, 'longitud' => -58.5358000],
            ['nombre' => 'Aeroparque Jorge Newbery', 'codigo_iata' => 'AEP', 'codigo_icao' => 'SABE', 'ciudad' => 'Buenos Aires', 'pais' => 'Argentina', 'latitud' => -34.5592000, 'longitud' => -58.4156000],
            ['nombre' => 'Aeropuerto Internacional Ingeniero Ambrosio Taravella', 'codigo_iata' => 'COR', 'codigo_icao' => 'SACO', 'ciudad' => 'Cordoba', 'pais' => 'Argentina', 'latitud' => -31.3236000, 'longitud' => -64.2080000],
            ['nombre' => 'Aeropuerto Internacional El Plumerillo', 'codigo_iata' => 'MDZ', 'codigo_icao' => 'SAME', 'ciudad' => 'Mendoza', 'pais' => 'Argentina', 'latitud' => -32.8317000, 'longitud' => -68.7929000],
            ['nombre' => 'Aeropuerto Internacional de Sao Paulo-Guarulhos', 'codigo_iata' => 'GRU', 'codigo_icao' => 'SBGR', 'ciudad' => 'Sao Paulo', 'pais' => 'Brasil', 'latitud' => -23.4356000, 'longitud' => -46.4731000],
            ['nombre' => 'Aeropuerto Internacional de Galeao', 'codigo_iata' => 'GIG', 'codigo_icao' => 'SBGL', 'ciudad' => 'Rio de Janeiro', 'pais' => 'Brasil', 'latitud' => -22.8090000, 'longitud' => -43.2506000],
            ['nombre' => 'Aeropuerto Internacional de Brasilia', 'codigo_iata' => 'BSB', 'codigo_icao' => 'SBBR', 'ciudad' => 'Brasilia', 'pais' => 'Brasil', 'latitud' => -15.8697000, 'longitud' => -47.9208000],
            ['nombre' => 'Aeropuerto Internacional Eduardo Gomes', 'codigo_iata' => 'MAO', 'codigo_icao' => 'SBEG', 'ciudad' => 'Manaus', 'pais' => 'Brasil', 'latitud' => -3.0386000, 'longitud' => -60.0497000],
            ['nombre' => 'Aeropuerto Internacional El Dorado', 'codigo_iata' => 'BOG', 'codigo_icao' => 'SKBO', 'ciudad' => 'Bogota', 'pais' => 'Colombia', 'latitud' => 4.7016000, 'longitud' => -74.1469000],
            ['nombre' => 'Aeropuerto Internacional Jose Maria Cordova', 'codigo_iata' => 'MDE', 'codigo_icao' => 'SKRG', 'ciudad' => 'Medellin', 'pais' => 'Colombia', 'latitud' => 6.1645000, 'longitud' => -75.4231000],
            ['nombre' => 'Aeropuerto Internacional Rafael Nunez', 'codigo_iata' => 'CTG', 'codigo_icao' => 'SKCG', 'ciudad' => 'Cartagena', 'pais' => 'Colombia', 'latitud' => 10.4424000, 'longitud' => -75.5130000],
            ['nombre' => 'Aeropuerto Internacional Benito Juarez', 'codigo_iata' => 'MEX', 'codigo_icao' => 'MMMX', 'ciudad' => 'Ciudad de Mexico', 'pais' => 'Mexico', 'latitud' => 19.4363000, 'longitud' => -99.0721000],
            ['nombre' => 'Aeropuerto Internacional de Cancun', 'codigo_iata' => 'CUN', 'codigo_icao' => 'MMUN', 'ciudad' => 'Cancun', 'pais' => 'Mexico', 'latitud' => 21.0365000, 'longitud' => -86.8771000],
            ['nombre' => 'Aeropuerto Internacional Miguel Hidalgo y Costilla', 'codigo_iata' => 'GDL', 'codigo_icao' => 'MMGL', 'ciudad' => 'Guadalajara', 'pais' => 'Mexico', 'latitud' => 20.5218000, 'longitud' => -103.3112000],
            ['nombre' => 'Miami International Airport', 'codigo_iata' => 'MIA', 'codigo_icao' => 'KMIA', 'ciudad' => 'Miami', 'pais' => 'Estados Unidos', 'latitud' => 25.7959000, 'longitud' => -80.2870000],
            ['nombre' => 'John F. Kennedy International Airport', 'codigo_iata' => 'JFK', 'codigo_icao' => 'KJFK', 'ciudad' => 'New York', 'pais' => 'Estados Unidos', 'latitud' => 40.6413000, 'longitud' => -73.7781000],
            ['nombre' => 'Los Angeles International Airport', 'codigo_iata' => 'LAX', 'codigo_icao' => 'KLAX', 'ciudad' => 'Los Angeles', 'pais' => 'Estados Unidos', 'latitud' => 33.9416000, 'longitud' => -118.4085000],
            ['nombre' => 'Adolfo Suarez Madrid-Barajas', 'codigo_iata' => 'MAD', 'codigo_icao' => 'LEMD', 'ciudad' => 'Madrid', 'pais' => 'Espana', 'latitud' => 40.4983000, 'longitud' => -3.5676000],
            ['nombre' => 'Aeropuerto Josep Tarradellas Barcelona-El Prat', 'codigo_iata' => 'BCN', 'codigo_icao' => 'LEBL', 'ciudad' => 'Barcelona', 'pais' => 'Espana', 'latitud' => 41.2974000, 'longitud' => 2.0833000],
            ['nombre' => 'Aeropuerto de Malaga-Costa del Sol', 'codigo_iata' => 'AGP', 'codigo_icao' => 'LEMG', 'ciudad' => 'Malaga', 'pais' => 'Espana', 'latitud' => 36.6749000, 'longitud' => -4.4991000],
            ['nombre' => 'Charles de Gaulle Airport', 'codigo_iata' => 'CDG', 'codigo_icao' => 'LFPG', 'ciudad' => 'Paris', 'pais' => 'Francia', 'latitud' => 49.0097000, 'longitud' => 2.5479000],
            ['nombre' => 'Orly Airport', 'codigo_iata' => 'ORY', 'codigo_icao' => 'LFPO', 'ciudad' => 'Paris', 'pais' => 'Francia', 'latitud' => 48.7262000, 'longitud' => 2.3652000],
            ['nombre' => 'Heathrow Airport', 'codigo_iata' => 'LHR', 'codigo_icao' => 'EGLL', 'ciudad' => 'Londres', 'pais' => 'Reino Unido', 'latitud' => 51.4700000, 'longitud' => -0.4543000],
            ['nombre' => 'Gatwick Airport', 'codigo_iata' => 'LGW', 'codigo_icao' => 'EGKK', 'ciudad' => 'Londres', 'pais' => 'Reino Unido', 'latitud' => 51.1537000, 'longitud' => -0.1821000],
            ['nombre' => 'King Mohammed V International Airport', 'codigo_iata' => 'CMN', 'codigo_icao' => 'GMMN', 'ciudad' => 'Casablanca', 'pais' => 'Marruecos', 'latitud' => 33.3675000, 'longitud' => -7.5899700],
            ['nombre' => 'Marrakesh Menara Airport', 'codigo_iata' => 'RAK', 'codigo_icao' => 'GMMX', 'ciudad' => 'Marrakech', 'pais' => 'Marruecos', 'latitud' => 31.6069000, 'longitud' => -8.0363000],
            ['nombre' => 'Cairo International Airport', 'codigo_iata' => 'CAI', 'codigo_icao' => 'HECA', 'ciudad' => 'El Cairo', 'pais' => 'Egipto', 'latitud' => 30.1219000, 'longitud' => 31.4056000],
            ['nombre' => 'Hurghada International Airport', 'codigo_iata' => 'HRG', 'codigo_icao' => 'HEGN', 'ciudad' => 'Hurghada', 'pais' => 'Egipto', 'latitud' => 27.1783000, 'longitud' => 33.7994000],
            ['nombre' => 'O.R. Tambo International Airport', 'codigo_iata' => 'JNB', 'codigo_icao' => 'FAOR', 'ciudad' => 'Johannesburgo', 'pais' => 'Sudafrica', 'latitud' => -26.1337000, 'longitud' => 28.2420000],
            ['nombre' => 'Cape Town International Airport', 'codigo_iata' => 'CPT', 'codigo_icao' => 'FACT', 'ciudad' => 'Ciudad del Cabo', 'pais' => 'Sudafrica', 'latitud' => -33.9715000, 'longitud' => 18.6021000],
            ['nombre' => 'Jomo Kenyatta International Airport', 'codigo_iata' => 'NBO', 'codigo_icao' => 'HKJK', 'ciudad' => 'Nairobi', 'pais' => 'Kenia', 'latitud' => -1.3192000, 'longitud' => 36.9278000],
        ];

        $rows = array_map(static function (array $aeropuerto) use ($timestamp) {
            return [
                ...$aeropuerto,
                'activo' => true,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }, $aeropuertos);

        DB::table('aeropuertos')->upsert(
            $rows,
            ['codigo_iata'],
            [
                'nombre',
                'codigo_icao',
                'ciudad',
                'pais',
                'latitud',
                'longitud',
                'activo',
                'updated_at',
            ]
        );
    }
}
