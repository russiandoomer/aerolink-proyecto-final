import ResourceManager from '../components/modules/ResourceManager';
import StatusBadge from '../components/common/StatusBadge';
import {
    formatCurrency,
    formatDateTime,
    formatRouteLabel,
    formatRouteTypeLabel,
    toDateTimeLocal,
} from '../utils/format';

const FLEXIBLE_ROUTE_TYPES = new Set(['internacional', 'adicional']);

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
            label: `${item.matricula} | ${item.modelo} | ${item.capacidad} pax`,
        }));
}

function routeIsAvailableForAirline(route, flights = [], selectedAirlineId = '', selectedRouteId = '') {
    if (!selectedAirlineId) {
        return true;
    }

    if (String(route.id) === String(selectedRouteId)) {
        return true;
    }

    if (FLEXIBLE_ROUTE_TYPES.has(route.tipo_operacion)) {
        return true;
    }

    return flights.some(
        (flight) =>
            String(flight.aerolinea_id) === String(selectedAirlineId)
            && String(flight.ruta_id) === String(route.id)
    );
}

function buildRouteOptions(routes = [], flights = [], selectedAirlineId = '', selectedRouteId = '') {
    return routes
        .filter((route) =>
            routeIsAvailableForAirline(route, flights, selectedAirlineId, selectedRouteId)
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
            description="Programa vuelos sobre rutas ya operadas por la aerolinea o sobre rutas internacionales y adicionales habilitadas."
            endpoint="vuelos"
            catalogKeys={['aerolineas', 'aviones', 'rutas', 'estadosVuelo', 'vuelos']}
            searchPlaceholder="Buscar por codigo de vuelo, aerolinea o ruta"
            filters={[
                {
                    name: 'aerolinea_id',
                    label: 'Aerolinea',
                    type: 'select',
                    options: (catalogs) =>
                        (catalogs.aerolineas ?? []).map((item) => ({
                            value: String(item.id),
                            label: item.nombre,
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
                    name: 'aerolinea_id',
                    label: 'Aerolinea',
                    type: 'select',
                    options: (catalogs) =>
                        (catalogs.aerolineas ?? []).map((item) => ({
                            value: String(item.id),
                            label: item.nombre,
                        })),
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
                    helpText: 'Solo se muestran aviones activos de la aerolinea seleccionada.',
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
                            catalogs.vuelos,
                            formData.aerolinea_id,
                            formData.ruta_id
                        ),
                    helpText: 'Las rutas nacionales se habilitan si la aerolinea ya las opera. Las internacionales y adicionales pueden programarse como nuevas.',
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
