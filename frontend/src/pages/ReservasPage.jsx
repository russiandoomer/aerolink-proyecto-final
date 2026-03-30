import ResourceManager from '../components/modules/ResourceManager';
import StatusBadge from '../components/common/StatusBadge';
import {
    formatCurrency,
    formatFlightLabel,
    formatPassengerName,
    toDateTimeLocal,
} from '../utils/format';

const reservationStateTones = {
    confirmada: 'emerald',
    pendiente: 'amber',
    cancelada: 'red',
};

export default function ReservasPage() {
    return (
        <ResourceManager
            title="Gestion de reservas"
            description="Controla pasajeros asignados, clase de vuelo, asientos y estado comercial."
            endpoint="reservas"
            catalogKeys={['vuelos', 'pasajeros']}
            searchPlaceholder="Buscar por codigo, pasajero o vuelo"
            filters={[
                {
                    name: 'estado',
                    label: 'Estado',
                    type: 'select',
                    options: [
                        { value: 'confirmada', label: 'Confirmada' },
                        { value: 'pendiente', label: 'Pendiente' },
                        { value: 'cancelada', label: 'Cancelada' },
                    ],
                },
                {
                    name: 'clase',
                    label: 'Clase',
                    type: 'select',
                    options: [
                        { value: 'economica', label: 'Economica' },
                        { value: 'ejecutiva', label: 'Ejecutiva' },
                    ],
                },
            ]}
            columns={[
                {
                    key: 'codigo_reserva',
                    label: 'Reserva',
                },
                {
                    key: 'pasajero',
                    label: 'Pasajero',
                    render: (row) => formatPassengerName(row.pasajero),
                },
                {
                    key: 'vuelo',
                    label: 'Vuelo',
                    render: (row) => formatFlightLabel(row.vuelo),
                },
                {
                    key: 'clase',
                    label: 'Clase',
                },
                {
                    key: 'estado',
                    label: 'Estado',
                    render: (row) => (
                        <StatusBadge
                            label={row.estado}
                            tone={reservationStateTones[row.estado] ?? 'slate'}
                        />
                    ),
                },
                {
                    key: 'precio_total',
                    label: 'Total',
                    render: (row) => formatCurrency(row.precio_total),
                },
            ]}
            fields={[
                {
                    name: 'vuelo_id',
                    label: 'Vuelo',
                    type: 'select',
                    options: (catalogs) =>
                        (catalogs.vuelos ?? []).map((item) => ({
                            value: String(item.id),
                            label: formatFlightLabel(item),
                        })),
                },
                {
                    name: 'pasajero_id',
                    label: 'Pasajero',
                    type: 'select',
                    options: (catalogs) =>
                        (catalogs.pasajeros ?? []).map((item) => ({
                            value: String(item.id),
                            label: `${formatPassengerName(item)} | ${item.numero_documento}`,
                        })),
                },
                {
                    name: 'codigo_reserva',
                    label: 'Codigo de reserva',
                    placeholder: 'RSV-1004',
                    helpText: 'Puede quedar vacio para generar uno automatico.',
                },
                {
                    name: 'fecha_reserva',
                    label: 'Fecha de reserva',
                    type: 'datetime-local',
                },
                {
                    name: 'asiento',
                    label: 'Asiento',
                    placeholder: '12A',
                },
                {
                    name: 'clase',
                    label: 'Clase',
                    type: 'select',
                    options: [
                        { value: 'economica', label: 'Economica' },
                        { value: 'ejecutiva', label: 'Ejecutiva' },
                    ],
                },
                {
                    name: 'estado',
                    label: 'Estado',
                    type: 'select',
                    options: [
                        { value: 'confirmada', label: 'Confirmada' },
                        { value: 'pendiente', label: 'Pendiente' },
                        { value: 'cancelada', label: 'Cancelada' },
                    ],
                },
                {
                    name: 'precio_total',
                    label: 'Precio total',
                    type: 'number',
                },
                {
                    name: 'equipaje_registrado',
                    label: 'Incluye equipaje registrado',
                    type: 'checkbox',
                },
                {
                    name: 'observaciones',
                    label: 'Observaciones',
                    type: 'textarea',
                    placeholder: 'Detalle de la reserva',
                },
            ]}
            initialValues={{
                clase: 'economica',
                estado: 'confirmada',
                equipaje_registrado: false,
            }}
            transformFormData={(item) => ({
                vuelo_id: String(item.vuelo_id ?? ''),
                pasajero_id: String(item.pasajero_id ?? ''),
                codigo_reserva: item.codigo_reserva ?? '',
                fecha_reserva: toDateTimeLocal(item.fecha_reserva),
                asiento: item.asiento ?? '',
                clase: item.clase ?? 'economica',
                estado: item.estado ?? 'confirmada',
                precio_total: String(item.precio_total ?? ''),
                equipaje_registrado: Boolean(item.equipaje_registrado),
                observaciones: item.observaciones ?? '',
            })}
            transformSubmit={(values) => ({
                vuelo_id: Number(values.vuelo_id),
                pasajero_id: Number(values.pasajero_id),
                codigo_reserva: values.codigo_reserva?.trim() || null,
                fecha_reserva: values.fecha_reserva || null,
                asiento: values.asiento?.trim() || null,
                clase: values.clase,
                estado: values.estado,
                precio_total: Number(values.precio_total),
                equipaje_registrado: Boolean(values.equipaje_registrado),
                observaciones: values.observaciones?.trim() || null,
            })}
        />
    );
}
