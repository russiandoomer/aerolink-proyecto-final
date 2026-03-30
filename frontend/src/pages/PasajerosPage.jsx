import ResourceManager from '../components/modules/ResourceManager';
import { formatPassengerName } from '../utils/format';

export default function PasajerosPage() {
    return (
        <ResourceManager
            title="Gestion de pasajeros"
            description="Registra viajeros, documentos, nacionalidad y contacto para futuras reservas."
            endpoint="pasajeros"
            searchPlaceholder="Buscar por nombre, documento o correo"
            filters={[
                {
                    name: 'tipo_documento',
                    label: 'Tipo de documento',
                    type: 'select',
                    options: [
                        { value: 'CI', label: 'Cedula de identidad' },
                        { value: 'Pasaporte', label: 'Pasaporte' },
                        { value: 'DNI', label: 'DNI' },
                    ],
                },
            ]}
            columns={[
                {
                    key: 'nombre_completo',
                    label: 'Pasajero',
                    render: (row) => formatPassengerName(row),
                },
                {
                    key: 'numero_documento',
                    label: 'Documento',
                },
                {
                    key: 'telefono',
                    label: 'Telefono',
                },
                {
                    key: 'email',
                    label: 'Correo',
                },
                {
                    key: 'reservas_count',
                    label: 'Reservas',
                },
            ]}
            fields={[
                {
                    name: 'nombres',
                    label: 'Nombres',
                },
                {
                    name: 'apellidos',
                    label: 'Apellidos',
                },
                {
                    name: 'tipo_documento',
                    label: 'Tipo de documento',
                    type: 'select',
                    options: [
                        { value: 'CI', label: 'Cedula de identidad' },
                        { value: 'Pasaporte', label: 'Pasaporte' },
                        { value: 'DNI', label: 'DNI' },
                    ],
                },
                {
                    name: 'numero_documento',
                    label: 'Numero de documento',
                },
                {
                    name: 'fecha_nacimiento',
                    label: 'Fecha de nacimiento',
                    type: 'date',
                },
                {
                    name: 'nacionalidad',
                    label: 'Nacionalidad',
                },
                {
                    name: 'telefono',
                    label: 'Telefono',
                },
                {
                    name: 'email',
                    label: 'Correo electronico',
                    type: 'email',
                },
            ]}
            initialValues={{
                tipo_documento: 'CI',
            }}
            transformFormData={(item) => ({
                nombres: item.nombres ?? '',
                apellidos: item.apellidos ?? '',
                tipo_documento: item.tipo_documento ?? 'CI',
                numero_documento: item.numero_documento ?? '',
                fecha_nacimiento: item.fecha_nacimiento ?? '',
                nacionalidad: item.nacionalidad ?? '',
                telefono: item.telefono ?? '',
                email: item.email ?? '',
            })}
            transformSubmit={(values) => ({
                nombres: values.nombres?.trim(),
                apellidos: values.apellidos?.trim(),
                tipo_documento: values.tipo_documento,
                numero_documento: values.numero_documento?.trim(),
                fecha_nacimiento: values.fecha_nacimiento || null,
                nacionalidad: values.nacionalidad?.trim() || null,
                telefono: values.telefono?.trim() || null,
                email: values.email?.trim() || null,
            })}
        />
    );
}
