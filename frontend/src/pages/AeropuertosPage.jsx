import ResourceManager from '../components/modules/ResourceManager';
import StatusBadge from '../components/common/StatusBadge';

export default function AeropuertosPage() {
    return (
        <ResourceManager
            title="Gestion de aeropuertos"
            description="Mantiene el catalogo de terminales, ciudades, paises y codigos operativos."
            endpoint="aeropuertos"
            searchPlaceholder="Buscar por nombre, ciudad, pais o codigo"
            filters={[
                {
                    name: 'activo',
                    label: 'Estado',
                    type: 'select',
                    options: [
                        { value: '1', label: 'Activo' },
                        { value: '0', label: 'Inactivo' },
                    ],
                },
            ]}
            columns={[
                {
                    key: 'codigo_iata',
                    label: 'IATA',
                },
                {
                    key: 'nombre',
                    label: 'Aeropuerto',
                },
                {
                    key: 'ciudad',
                    label: 'Ciudad',
                },
                {
                    key: 'pais',
                    label: 'Pais',
                },
                {
                    key: 'activo',
                    label: 'Estado',
                    render: (row) => (
                        <StatusBadge
                            label={row.activo ? 'Activo' : 'Inactivo'}
                            tone={row.activo ? 'emerald' : 'red'}
                        />
                    ),
                },
            ]}
            fields={[
                {
                    name: 'nombre',
                    label: 'Nombre del aeropuerto',
                },
                {
                    name: 'codigo_iata',
                    label: 'Codigo IATA',
                    placeholder: 'VVI',
                },
                {
                    name: 'codigo_icao',
                    label: 'Codigo ICAO',
                    placeholder: 'SLVR',
                },
                {
                    name: 'ciudad',
                    label: 'Ciudad',
                },
                {
                    name: 'pais',
                    label: 'Pais',
                },
                {
                    name: 'latitud',
                    label: 'Latitud',
                    type: 'number',
                },
                {
                    name: 'longitud',
                    label: 'Longitud',
                    type: 'number',
                },
                {
                    name: 'activo',
                    label: 'Aeropuerto activo',
                    type: 'checkbox',
                },
            ]}
            initialValues={{
                activo: true,
            }}
            transformFormData={(item) => ({
                nombre: item.nombre ?? '',
                codigo_iata: item.codigo_iata ?? '',
                codigo_icao: item.codigo_icao ?? '',
                ciudad: item.ciudad ?? '',
                pais: item.pais ?? '',
                latitud: String(item.latitud ?? ''),
                longitud: String(item.longitud ?? ''),
                activo: Boolean(item.activo),
            })}
            transformSubmit={(values) => ({
                nombre: values.nombre?.trim(),
                codigo_iata: values.codigo_iata?.trim(),
                codigo_icao: values.codigo_icao?.trim() || null,
                ciudad: values.ciudad?.trim(),
                pais: values.pais?.trim(),
                latitud: values.latitud === '' ? null : Number(values.latitud),
                longitud: values.longitud === '' ? null : Number(values.longitud),
                activo: Boolean(values.activo),
            })}
        />
    );
}
