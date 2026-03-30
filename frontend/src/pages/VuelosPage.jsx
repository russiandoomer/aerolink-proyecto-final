import ResourceManager from '../components/modules/ResourceManager';
import StatusBadge from '../components/common/StatusBadge';
import {
    formatCurrency,
    formatDateTime,
    formatRouteLabel,
    toDateTimeLocal,
} from '../utils/format';

function buildRouteOptions(routes = []) {
    return routes.map((route) => ({
        value: String(route.id),
        label: `${route.codigo} | ${formatRouteLabel(route)}`,
    }));
}

export default function VuelosPage() {
    return (
        <ResourceManager
            title="Gestion de vuelos"
            description="Administra salidas, horarios, estados operativos y asignacion de flota."
            endpoint="vuelos"
            catalogKeys={['aerolineas', 'aviones', 'rutas', 'estadosVuelo']}
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
                    render: (row) => formatRouteLabel(row.ruta),
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
                },
                {
                    name: 'avion_id',
                    label: 'Avion',
                    type: 'select',
                    options: (catalogs) =>
                        (catalogs.aviones ?? []).map((item) => ({
                            value: String(item.id),
                            label: `${item.matricula} | ${item.modelo}`,
                        })),
                },
                {
                    name: 'ruta_id',
                    label: 'Ruta',
                    type: 'select',
                    options: (catalogs) => buildRouteOptions(catalogs.rutas),
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
