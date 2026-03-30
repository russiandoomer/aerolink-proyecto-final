import ResourceManager from '../components/modules/ResourceManager';
import StatusBadge from '../components/common/StatusBadge';
import { formatCurrency, formatRouteLabel } from '../utils/format';

function airportOptions(airports = []) {
    return airports.map((airport) => ({
        value: String(airport.id),
        label: `${airport.codigo_iata} | ${airport.ciudad}`,
    }));
}

function countryOptions(airports = []) {
    return Array.from(new Set((airports ?? []).map((airport) => airport.pais).filter(Boolean)))
        .sort((left, right) => left.localeCompare(right))
        .map((country) => ({
            value: country,
            label: country,
        }));
}

function airportsByCountry(airports = [], country = '') {
    if (!country) {
        return [];
    }

    return airports.filter((airport) => airport.pais === country);
}

function firstAirportValue(airports = [], country = '') {
    const match = airportsByCountry(airports, country)[0];

    return match ? String(match.id) : '';
}

export default function RutasPage() {
    return (
        <ResourceManager
            title="Gestion de rutas"
            description="Define trayectos entre aeropuertos, tiempos estimados y tarifas base."
            endpoint="rutas"
            catalogKeys={['aeropuertos']}
            searchPlaceholder="Buscar por codigo, ciudad o aeropuerto"
            filters={[
                {
                    name: 'aeropuerto_origen_id',
                    label: 'Origen',
                    type: 'select',
                    options: (catalogs) => airportOptions(catalogs.aeropuertos),
                },
                {
                    name: 'aeropuerto_destino_id',
                    label: 'Destino',
                    type: 'select',
                    options: (catalogs) => airportOptions(catalogs.aeropuertos),
                },
                {
                    name: 'activa',
                    label: 'Estado',
                    type: 'select',
                    options: [
                        { value: '1', label: 'Activa' },
                        { value: '0', label: 'Inactiva' },
                    ],
                },
            ]}
            columns={[
                {
                    key: 'codigo',
                    label: 'Codigo',
                },
                {
                    key: 'trayecto',
                    label: 'Trayecto',
                    render: (row) => formatRouteLabel(row),
                },
                {
                    key: 'duracion_minutos',
                    label: 'Duracion',
                    render: (row) => `${row.duracion_minutos} min`,
                },
                {
                    key: 'tarifa_base',
                    label: 'Tarifa base',
                    render: (row) => formatCurrency(row.tarifa_base),
                },
                {
                    key: 'activa',
                    label: 'Estado',
                    render: (row) => (
                        <StatusBadge
                            label={row.activa ? 'Activa' : 'Inactiva'}
                            tone={row.activa ? 'emerald' : 'red'}
                        />
                    ),
                },
            ]}
            fields={[
                {
                    name: 'codigo',
                    label: 'Codigo de ruta',
                    placeholder: 'VVI-LPB',
                },
                {
                    name: 'pais_origen',
                    label: 'Pais de origen',
                    type: 'select',
                    options: (catalogs) => countryOptions(catalogs.aeropuertos),
                    placeholder: 'Seleccione un pais',
                    onChange: (value, _nextState, catalogs) => ({
                        aeropuerto_origen_id: firstAirportValue(catalogs.aeropuertos, value),
                    }),
                },
                {
                    name: 'aeropuerto_origen_id',
                    label: 'Aeropuerto de origen',
                    type: 'select',
                    options: (catalogs, formData) =>
                        airportOptions(airportsByCountry(catalogs.aeropuertos, formData.pais_origen)),
                    placeholder: 'Seleccione un aeropuerto de origen',
                },
                {
                    name: 'pais_destino',
                    label: 'Pais de destino',
                    type: 'select',
                    options: (catalogs) => countryOptions(catalogs.aeropuertos),
                    placeholder: 'Seleccione un pais',
                    onChange: (value, _nextState, catalogs) => ({
                        aeropuerto_destino_id: firstAirportValue(catalogs.aeropuertos, value),
                    }),
                },
                {
                    name: 'aeropuerto_destino_id',
                    label: 'Aeropuerto de destino',
                    type: 'select',
                    options: (catalogs, formData) =>
                        airportOptions(airportsByCountry(catalogs.aeropuertos, formData.pais_destino)),
                    placeholder: 'Seleccione un aeropuerto de destino',
                },
                {
                    name: 'distancia_km',
                    label: 'Distancia (km)',
                    type: 'number',
                },
                {
                    name: 'duracion_minutos',
                    label: 'Duracion estimada',
                    type: 'number',
                },
                {
                    name: 'tarifa_base',
                    label: 'Tarifa base',
                    type: 'number',
                },
                {
                    name: 'activa',
                    label: 'Ruta activa',
                    type: 'checkbox',
                },
            ]}
            initialValues={{
                activa: true,
                pais_origen: 'Bolivia',
                pais_destino: 'Chile',
            }}
            transformFormData={(item) => ({
                codigo: item.codigo ?? '',
                pais_origen:
                    item.aeropuerto_origen?.pais
                    ?? item.aeropuertoOrigen?.pais
                    ?? '',
                aeropuerto_origen_id: String(item.aeropuerto_origen_id ?? ''),
                pais_destino:
                    item.aeropuerto_destino?.pais
                    ?? item.aeropuertoDestino?.pais
                    ?? '',
                aeropuerto_destino_id: String(item.aeropuerto_destino_id ?? ''),
                distancia_km: String(item.distancia_km ?? ''),
                duracion_minutos: String(item.duracion_minutos ?? ''),
                tarifa_base: String(item.tarifa_base ?? ''),
                activa: Boolean(item.activa),
            })}
            transformSubmit={(values) => ({
                codigo: values.codigo?.trim(),
                aeropuerto_origen_id: Number(values.aeropuerto_origen_id),
                aeropuerto_destino_id: Number(values.aeropuerto_destino_id),
                distancia_km: Number(values.distancia_km),
                duracion_minutos: Number(values.duracion_minutos),
                tarifa_base: Number(values.tarifa_base),
                activa: Boolean(values.activa),
            })}
        />
    );
}
