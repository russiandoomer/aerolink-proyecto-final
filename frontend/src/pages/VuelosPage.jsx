import ResourceManager from '../components/modules/ResourceManager';
import StatusBadge from '../components/common/StatusBadge';
import {
    formatAircraftProfileLabel,
    formatCurrency,
    formatDateTime,
    formatRouteLabel,
    formatRouteTypeLabel,
    toDateTimeLocal,
} from '../utils/format';

const FLEXIBLE_ROUTE_TYPES = new Set(['internacional', 'adicional']);

function airlineCountryOptions(airlines = []) {
    return Array.from(new Set((airlines ?? []).map((item) => item.pais).filter(Boolean)))
        .sort((left, right) => left.localeCompare(right))
        .map((country) => ({
            value: country,
            label: country,
        }));
}

function airlineOptionsByCountry(airlines = [], country = '') {
    return (airlines ?? [])
        .filter((item) => !country || item.pais === country)
        .map((item) => ({
            value: String(item.id),
            label: `${item.nombre} | ${item.codigo_iata ?? '---'}`,
        }));
}

function resolveAirlineCountry(airlines = [], airlineId = '') {
    const match = airlines.find((item) => String(item.id) === String(airlineId));

    return match?.pais ?? '';
}

function airlineAircraftOptions(aircraft = [], selectedAirlineId = '', selectedAircraftId = '') {
    return aircraft
        .filter((item) => {
            const sameAirline =
                !selectedAirlineId || String(item.aerolinea_id) === String(selectedAirlineId);
            const available = item.estado === 'activo' || String(item.id) === String(selectedAircraftId);

            return sameAirline && available;
        })
        .map((item) => ({
            value: String(item.id),
            label:
                `${item.matricula} | ${item.modelo} | ${formatAircraftProfileLabel(item)} | `
                + `${item.capacidad} pax`,
        }));
}

function routeIsAvailableForAirline(
    route,
    airlines = [],
    selectedAirlineId = '',
    selectedRouteId = ''
) {
    if (!selectedAirlineId) {
        return true;
    }

    if (String(route.id) === String(selectedRouteId)) {
        return true;
    }

    if (FLEXIBLE_ROUTE_TYPES.has(route.tipo_operacion)) {
        return true;
    }

    const airlineCountry = resolveAirlineCountry(airlines, selectedAirlineId);
    const originCountry = route?.aeropuerto_origen?.pais ?? route?.aeropuertoOrigen?.pais ?? '';
    const destinationCountry = route?.aeropuerto_destino?.pais ?? route?.aeropuertoDestino?.pais ?? '';

    return airlineCountry !== '' && airlineCountry === originCountry && airlineCountry === destinationCountry;
}

function buildRouteOptions(routes = [], airlines = [], selectedAirlineId = '', selectedRouteId = '') {
    return routes
        .filter((route) =>
            routeIsAvailableForAirline(route, airlines, selectedAirlineId, selectedRouteId)
        )
        .map((route) => ({
            value: String(route.id),
            label:
                `${route.codigo} | ${formatRouteLabel(route)} | `
                + `${formatRouteTypeLabel(route.tipo_operacion)} | `
                + `${route.frecuencia_referencial ?? 'Sin frecuencia'}`,
        }));
}

function resolveAircraftCapacity(aircraft = [], aircraftId = '') {
    const match = aircraft.find((item) => String(item.id) === String(aircraftId));

    return match ? String(match.capacidad) : '';
}

function resolveRouteBaseFare(routes = [], routeId = '') {
    const match = routes.find((item) => String(item.id) === String(routeId));

    return match ? String(match.tarifa_base) : '';
}

export default function VuelosPage() {
    return (
        <ResourceManager
            title="Gestion de vuelos"
            description="Programa vuelos eligiendo primero el pais de la aerolinea, luego la compania, su avion y una ruta compatible con su operacion."
            endpoint="vuelos"
            catalogKeys={['aerolineas', 'aviones', 'rutas', 'estadosVuelo']}
            searchPlaceholder="Buscar por codigo de vuelo, aerolinea o ruta"
            filters={[
                {
                    name: 'pais_aerolinea',
                    label: 'Pais',
                    type: 'select',
                    options: (catalogs) => airlineCountryOptions(catalogs.aerolineas),
                },
                {
                    name: 'aerolinea_id',
                    label: 'Aerolinea',
                    type: 'select',
                    options: (catalogs) =>
                        (catalogs.aerolineas ?? []).map((item) => ({
                            value: String(item.id),
                            label: `${item.pais} | ${item.nombre}`,
                        })),
                },
                {
                    name: 'estado_vuelo_id',
                    label: 'Estado',
                    type: 'select',
                    options: (catalogs) =>
                        (catalogs.estadosVuelo ?? []).map((item) => ({
                            value: String(item.id),
                            label: item.nombre,
                        })),
                },
                {
                    name: 'fecha_salida',
                    label: 'Fecha de salida',
                    type: 'date',
                },
            ]}
            columns={[
                {
                    key: 'codigo_vuelo',
                    label: 'Vuelo',
                },
                {
                    key: 'ruta',
                    label: 'Ruta',
                    render: (row) =>
                        `${formatRouteLabel(row.ruta)} · ${formatRouteTypeLabel(row.ruta?.tipo_operacion)}`,
                },
                {
                    key: 'avion',
                    label: 'Avion',
                    render: (row) =>
                        `${row.avion?.matricula ?? '--'} | ${row.avion?.modelo ?? '--'}`,
                },
                {
                    key: 'fecha_salida',
                    label: 'Salida',
                    render: (row) => formatDateTime(row.fecha_salida),
                },
                {
                    key: 'precio_base',
                    label: 'Tarifa',
                    render: (row) => formatCurrency(row.precio_base),
                },
                {
                    key: 'estado',
                    label: 'Estado',
                    render: (row) => (
                        <StatusBadge
                            label={row.estado_vuelo?.nombre ?? 'Sin estado'}
                            tone={row.estado_vuelo?.color ?? 'slate'}
                        />
                    ),
                },
            ]}
            fields={[
                {
                    name: 'pais_aerolinea',
                    label: 'Pais de la aerolinea',
                    type: 'select',
                    options: (catalogs) => airlineCountryOptions(catalogs.aerolineas),
                    placeholder: 'Seleccione un pais',
                    onChange: () => ({
                        aerolinea_id: '',
                        avion_id: '',
                        ruta_id: '',
                        capacidad: '',
                    }),
                },
                {
                    name: 'aerolinea_id',
                    label: 'Aerolinea',
                    type: 'select',
                    options: (catalogs, formData) =>
                        airlineOptionsByCountry(catalogs.aerolineas, formData.pais_aerolinea),
                    onChange: () => ({
                        avion_id: '',
                        ruta_id: '',
                        capacidad: '',
                    }),
                },
                {
                    name: 'avion_id',
                    label: 'Avion',
                    type: 'select',
                    options: (catalogs, formData) =>
                        airlineAircraftOptions(
                            catalogs.aviones,
                            formData.aerolinea_id,
                            formData.avion_id
                        ),
                    helpText: 'Solo se muestran aviones activos. La etiqueta indica si el equipo es regional, troncal o de largo alcance.',
                    onChange: (value, _nextState, catalogs) => ({
                        capacidad: resolveAircraftCapacity(catalogs.aviones, value),
                    }),
                },
                {
                    name: 'ruta_id',
                    label: 'Ruta',
                    type: 'select',
                    options: (catalogs, formData) =>
                        buildRouteOptions(
                            catalogs.rutas,
                            catalogs.aerolineas,
                            formData.aerolinea_id,
                            formData.ruta_id
                        ),
                    helpText: 'Las rutas nacionales se habilitan para aerolineas del mismo pais. Las internacionales y adicionales pueden programarse para nuevas operaciones.',
                    onChange: (value, _nextState, catalogs) => ({
                        precio_base: resolveRouteBaseFare(catalogs.rutas, value),
                    }),
                },
                {
                    name: 'estado_vuelo_id',
                    label: 'Estado operativo',
                    type: 'select',
                    options: (catalogs) =>
                        (catalogs.estadosVuelo ?? []).map((item) => ({
                            value: String(item.id),
                            label: item.nombre,
                        })),
                },
                {
                    name: 'codigo_vuelo',
                    label: 'Codigo de vuelo',
                    placeholder: 'ALB101',
                },
                {
                    name: 'fecha_salida',
                    label: 'Fecha y hora de salida',
                    type: 'datetime-local',
                },
                {
                    name: 'fecha_llegada',
                    label: 'Fecha y hora de llegada',
                    type: 'datetime-local',
                },
                {
                    name: 'terminal',
                    label: 'Terminal',
                    placeholder: 'T1',
                },
                {
                    name: 'puerta_embarque',
                    label: 'Puerta',
                    placeholder: 'A4',
                },
                {
                    name: 'capacidad',
                    label: 'Capacidad',
                    type: 'number',
                },
                {
                    name: 'precio_base',
                    label: 'Precio base',
                    type: 'number',
                },
                {
                    name: 'observaciones',
                    label: 'Observaciones',
                    type: 'textarea',
                    placeholder: 'Detalle operativo adicional',
                },
            ]}
            transformFormData={(item) => ({
                pais_aerolinea: item.aerolinea?.pais ?? '',
                aerolinea_id: String(item.aerolinea_id ?? ''),
                avion_id: String(item.avion_id ?? ''),
                ruta_id: String(item.ruta_id ?? ''),
                estado_vuelo_id: String(item.estado_vuelo_id ?? ''),
                codigo_vuelo: item.codigo_vuelo ?? '',
                fecha_salida: toDateTimeLocal(item.fecha_salida),
                fecha_llegada: toDateTimeLocal(item.fecha_llegada),
                terminal: item.terminal ?? '',
                puerta_embarque: item.puerta_embarque ?? '',
                capacidad: String(item.capacidad ?? ''),
                precio_base: String(item.precio_base ?? ''),
                observaciones: item.observaciones ?? '',
            })}
            transformSubmit={(values) => ({
                aerolinea_id: Number(values.aerolinea_id),
                avion_id: Number(values.avion_id),
                ruta_id: Number(values.ruta_id),
                estado_vuelo_id: Number(values.estado_vuelo_id),
                codigo_vuelo: values.codigo_vuelo?.trim(),
                fecha_salida: values.fecha_salida,
                fecha_llegada: values.fecha_llegada,
                terminal: values.terminal?.trim() || null,
                puerta_embarque: values.puerta_embarque?.trim() || null,
                capacidad: Number(values.capacidad),
                precio_base: Number(values.precio_base),
                observaciones: values.observaciones?.trim() || null,
            })}
        />
    );
}
