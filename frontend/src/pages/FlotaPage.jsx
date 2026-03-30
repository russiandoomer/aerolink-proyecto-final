import ResourceManager from '../components/modules/ResourceManager';
import StatusBadge from '../components/common/StatusBadge';

const fleetStateTones = {
    activo: 'emerald',
    mantenimiento: 'amber',
    fuera_servicio: 'red',
};

export default function FlotaPage() {
    return (
        <ResourceManager
            title="Gestion de flota"
            description="Registra aeronaves, capacidad, fabricante y estado operativo de la flota."
            endpoint="aviones"
            catalogKeys={['aerolineas']}
            searchPlaceholder="Buscar por matricula, modelo o fabricante"
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
                    name: 'estado',
                    label: 'Estado',
                    type: 'select',
                    options: [
                        { value: 'activo', label: 'Activo' },
                        { value: 'mantenimiento', label: 'Mantenimiento' },
                        { value: 'fuera_servicio', label: 'Fuera de servicio' },
                    ],
                },
            ]}
            columns={[
                {
                    key: 'matricula',
                    label: 'Matricula',
                },
                {
                    key: 'modelo',
                    label: 'Modelo',
                },
                {
                    key: 'fabricante',
                    label: 'Fabricante',
                },
                {
                    key: 'capacidad',
                    label: 'Capacidad',
                },
                {
                    key: 'estado',
                    label: 'Estado',
                    render: (row) => (
                        <StatusBadge
                            label={row.estado}
                            tone={fleetStateTones[row.estado] ?? 'slate'}
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
                    name: 'matricula',
                    label: 'Matricula',
                    placeholder: 'CP-3201',
                },
                {
                    name: 'modelo',
                    label: 'Modelo',
                    placeholder: 'A320-200',
                },
                {
                    name: 'fabricante',
                    label: 'Fabricante',
                    placeholder: 'Airbus',
                },
                {
                    name: 'capacidad',
                    label: 'Capacidad',
                    type: 'number',
                },
                {
                    name: 'alcance_km',
                    label: 'Alcance (km)',
                    type: 'number',
                },
                {
                    name: 'estado',
                    label: 'Estado operativo',
                    type: 'select',
                    options: [
                        { value: 'activo', label: 'Activo' },
                        { value: 'mantenimiento', label: 'Mantenimiento' },
                        { value: 'fuera_servicio', label: 'Fuera de servicio' },
                    ],
                },
                {
                    name: 'ultimo_mantenimiento',
                    label: 'Ultimo mantenimiento',
                    type: 'date',
                },
            ]}
            initialValues={{
                estado: 'activo',
            }}
            transformFormData={(item) => ({
                aerolinea_id: String(item.aerolinea_id ?? ''),
                matricula: item.matricula ?? '',
                modelo: item.modelo ?? '',
                fabricante: item.fabricante ?? '',
                capacidad: String(item.capacidad ?? ''),
                alcance_km: String(item.alcance_km ?? ''),
                estado: item.estado ?? 'activo',
                ultimo_mantenimiento: item.ultimo_mantenimiento ?? '',
            })}
            transformSubmit={(values) => ({
                aerolinea_id: Number(values.aerolinea_id),
                matricula: values.matricula?.trim(),
                modelo: values.modelo?.trim(),
                fabricante: values.fabricante?.trim(),
                capacidad: Number(values.capacidad),
                alcance_km: values.alcance_km === '' ? null : Number(values.alcance_km),
                estado: values.estado,
                ultimo_mantenimiento: values.ultimo_mantenimiento || null,
            })}
        />
    );
}
