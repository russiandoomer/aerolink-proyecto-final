import ResourceManager from '../components/modules/ResourceManager';
import StatusBadge from '../components/common/StatusBadge';
import {
    formatCurrency,
    formatRouteLabel,
    formatRouteTypeLabel,
} from '../utils/format';

const ROUTE_TYPE_OPTIONS = [
    { value: 'nacional', label: 'Nacional' },
    { value: 'internacional', label: 'Internacional' },
    { value: 'adicional', label: 'Adicional' },
];

const ROUTE_FREQUENCY_OPTIONS = [
    { value: 'Diaria', label: 'Diaria' },
    { value: 'Interdiaria', label: 'Interdiaria' },
    { value: 'Lun-Mie-Vie', label: 'Lun-Mie-Vie' },
    { value: 'Semanal', label: 'Semanal' },
    { value: 'Bajo demanda', label: 'Bajo demanda' },
];

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

function inferRouteType(catalogs, nextState) {
    if (nextState.tipo_operacion === 'adicional') {
        return 'adicional';
    }

    const originAirport = (catalogs.aeropuertos ?? []).find(
        (airport) => String(airport.id) === String(nextState.aeropuerto_origen_id)
    );
    const destinationAirport = (catalogs.aeropuertos ?? []).find(
        (airport) => String(airport.id) === String(nextState.aeropuerto_destino_id)
    );

    if (!originAirport || !destinationAirport) {
        return nextState.tipo_operacion || 'nacional';
    }

    return originAirport.pais === destinationAirport.pais ? 'nacional' : 'internacional';
}

export default function RutasPage() {
    return (
        <ResourceManager
            title="Gestion de rutas"
            description="Define trayectos entre aeropuertos, clasificalos por tipo operativo y registra una frecuencia referencial."
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
                    name: 'tipo_operacion',
                    label: 'Tipo',
                    type: 'select',
                    options: ROUTE_TYPE_OPTIONS,
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
                    key: 'tipo_operacion',
                    label: 'Tipo',
                    render: (row) => formatRouteTypeLabel(row.tipo_operacion),
                },
                {
                    key: 'frecuencia_referencial',
                    label: 'Frecuencia',
                    render: (row) => row.frecuencia_referencial ?? '--',
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
                    onChange: (value, nextState, catalogs) => {
                        const aeropuerto_origen_id = firstAirportValue(catalogs.aeropuertos, value);
                        const updatedState = {
                            ...nextState,
                            aeropuerto_origen_id,
                        };

                        return {
                            aeropuerto_origen_id,
                            tipo_operacion: inferRouteType(catalogs, updatedState),
                        };
                    },
                },
                {
                    name: 'aeropuerto_origen_id',
                    label: 'Aeropuerto de origen',
                    type: 'select',
                    options: (catalogs, formData) =>
                        airportOptions(airportsByCountry(catalogs.aeropuertos, formData.pais_origen)),
                    placeholder: 'Seleccione un aeropuerto de origen',
                    onChange: (value, nextState, catalogs) => ({
                        tipo_operacion: inferRouteType(catalogs, {
                            ...nextState,
                            aeropuerto_origen_id: value,
                        }),
                    }),
                },
                {
                    name: 'pais_destino',
                    label: 'Pais de destino',
                    type: 'select',
                    options: (catalogs) => countryOptions(catalogs.aeropuertos),
                    placeholder: 'Seleccione un pais',
                    onChange: (value, nextState, catalogs) => {
                        const aeropuerto_destino_id = firstAirportValue(catalogs.aeropuertos, value);
                        const updatedState = {
                            ...nextState,
                            aeropuerto_destino_id,
                        };

                        return {
                            aeropuerto_destino_id,
                            tipo_operacion: inferRouteType(catalogs, updatedState),
                        };
                    },
                },
                {
                    name: 'aeropuerto_destino_id',
                    label: 'Aeropuerto de destino',
                    type: 'select',
                    options: (catalogs, formData) =>
                        airportOptions(airportsByCountry(catalogs.aeropuertos, formData.pais_destino)),
                    placeholder: 'Seleccione un aeropuerto de destino',
                    onChange: (value, nextState, catalogs) => ({
                        tipo_operacion: inferRouteType(catalogs, {
                            ...nextState,
                            aeropuerto_destino_id: value,
                        }),
                    }),
                },
                {
                    name: 'tipo_operacion',
                    label: 'Tipo de operacion',
                    type: 'select',
                    options: ROUTE_TYPE_OPTIONS,
                    helpText: 'Las rutas entre el mismo pais se consideran nacionales; si se trata de una apertura especial, puede marcarse como adicional.',
                },
                {
                    name: 'frecuencia_referencial',
                    label: 'Frecuencia referencial',
                    type: 'select',
                    options: ROUTE_FREQUENCY_OPTIONS,
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
                tipo_operacion: 'internacional',
                frecuencia_referencial: 'Diaria',
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
                tipo_operacion: item.tipo_operacion ?? 'nacional',
                frecuencia_referencial: item.frecuencia_referencial ?? 'Diaria',
                distancia_km: String(item.distancia_km ?? ''),
                duracion_minutos: String(item.duracion_minutos ?? ''),
                tarifa_base: String(item.tarifa_base ?? ''),
                activa: Boolean(item.activa),
            })}
            transformSubmit={(values) => ({
                codigo: values.codigo?.trim(),
                aeropuerto_origen_id: Number(values.aeropuerto_origen_id),
                aeropuerto_destino_id: Number(values.aeropuerto_destino_id),
                tipo_operacion: values.tipo_operacion,
                frecuencia_referencial: values.frecuencia_referencial?.trim() || null,
                distancia_km: Number(values.distancia_km),
                duracion_minutos: Number(values.duracion_minutos),
                tarifa_base: Number(values.tarifa_base),
                activa: Boolean(values.activa),
            })}
        />
    );
}
