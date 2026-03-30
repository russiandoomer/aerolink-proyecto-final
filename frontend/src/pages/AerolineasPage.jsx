import ResourceManager from '../components/modules/ResourceManager';
import StatusBadge from '../components/common/StatusBadge';

export default function AerolineasPage() {
    return (
        <ResourceManager
            title="Gestion de aerolineas"
            description="Controla operadores, codigos IATA y estado general de las empresas registradas."
            endpoint="aerolineas"
            searchPlaceholder="Buscar por nombre, pais o codigo"
            filters={[
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
                    key: 'nombre',
                    label: 'Aerolinea',
                },
                {
                    key: 'codigo_iata',
                    label: 'Codigo',
                },
                {
                    key: 'pais',
                    label: 'Pais',
                },
                {
                    key: 'vuelos_count',
                    label: 'Vuelos',
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
                    name: 'nombre',
                    label: 'Nombre comercial',
                },
                {
                    name: 'codigo_iata',
                    label: 'Codigo IATA',
                    placeholder: 'ALB',
                },
                {
                    name: 'pais',
                    label: 'Pais',
                },
                {
                    name: 'telefono',
                    label: 'Telefono',
                },
                {
                    name: 'email',
                    label: 'Correo corporativo',
                    type: 'email',
                },
                {
                    name: 'activa',
                    label: 'Aerolinea activa',
                    type: 'checkbox',
                },
            ]}
            initialValues={{
                activa: true,
            }}
            transformFormData={(item) => ({
                nombre: item.nombre ?? '',
                codigo_iata: item.codigo_iata ?? '',
                pais: item.pais ?? '',
                telefono: item.telefono ?? '',
                email: item.email ?? '',
                activa: Boolean(item.activa),
            })}
            transformSubmit={(values) => ({
                nombre: values.nombre?.trim(),
                codigo_iata: values.codigo_iata?.trim() || null,
                pais: values.pais?.trim(),
                telefono: values.telefono?.trim() || null,
                email: values.email?.trim() || null,
                activa: Boolean(values.activa),
            })}
        />
    );
}
