import ResourceManager from '../components/modules/ResourceManager';
import StatusBadge from '../components/common/StatusBadge';
import { formatCurrency, formatRouteLabel } from '../utils/format';

function airportOptions(airports = []) {
    return airports.map((airport) => ({
        value: String(airport.id),
        label: `${airport.codigo_iata} | ${airport.ciudad}`,
    }));
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
                    name: 'aeropuerto_origen_id',
                    label: 'Aeropuerto de origen',
                    type: 'select',
                    options: (catalogs) => airportOptions(catalogs.aeropuertos),
                },
                {
                    name: 'aeropuerto_destino_id',
                    label: 'Aeropuerto de destino',
                    type: 'select',
                    options: (catalogs) => airportOptions(catalogs.aeropuertos),
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
            }}
            transformFormData={(item) => ({
                codigo: item.codigo ?? '',
                aeropuerto_origen_id: String(item.aeropuerto_origen_id ?? ''),
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
