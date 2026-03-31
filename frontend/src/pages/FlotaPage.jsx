import ResourceManager from '../components/modules/ResourceManager';
import StatusBadge from '../components/common/StatusBadge';
import {
    formatAircraftCapabilityLabel,
    formatAircraftProfileLabel,
    formatAircraftPurposeLabel,
} from '../utils/format';

const fleetStateTones = {
    activo: 'emerald',
    mantenimiento: 'amber',
    fuera_servicio: 'red',
};

const AIRCRAFT_PROFILE_PRESETS = [
    {
        value: 'regional',
        label: 'Regional | E190-E2',
        defaults: {
            modelo: 'E190-E2',
            fabricante: 'Embraer',
            capacidad: '114',
            alcance_km: '5278',
        },
    },
    {
        value: 'regional_plus',
        label: 'Regional extendido | A220-300',
        defaults: {
            modelo: 'A220-300',
            fabricante: 'Airbus',
            capacidad: '145',
            alcance_km: '6200',
        },
    },
    {
        value: 'troncal',
        label: 'Troncal | A320neo / 737',
        defaults: {
            modelo: 'A320neo',
            fabricante: 'Airbus',
            capacidad: '186',
            alcance_km: '6500',
        },
    },
    {
        value: 'largo_alcance',
        label: 'Largo alcance | 787-8',
        defaults: {
            modelo: '787-8',
            fabricante: 'Boeing',
            capacidad: '242',
            alcance_km: '13620',
        },
    },
];

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

function resolveAircraftPreset(model = '') {
    const normalizedModel = String(model).toUpperCase();

    if (normalizedModel.includes('787') || normalizedModel.includes('A330')) {
        return 'largo_alcance';
    }

    if (normalizedModel.includes('A220')) {
        return 'regional_plus';
    }

    if (normalizedModel.includes('E190') || normalizedModel.includes('ATR')) {
        return 'regional';
    }

    return 'troncal';
}

function resolvePresetDefaults(value) {
    return AIRCRAFT_PROFILE_PRESETS.find((item) => item.value === value)?.defaults ?? {};
}

export default function FlotaPage() {
    return (
        <ResourceManager
            title="Gestion de flota"
            description="Organiza la flota por pais y aerolinea. Cada aeronave muestra un perfil operativo para que sea facil distinguir si sirve para rutas regionales, troncales o de largo alcance."
            endpoint="aviones"
            catalogKeys={['aerolineas']}
            searchPlaceholder="Buscar por matricula, modelo o fabricante"
            filters={[
                {
                    name: 'pais',
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
                    key: 'perfil_operativo',
                    label: 'Perfil',
                    render: (row) => (
                        <div className="cell-stack">
                            <strong>{formatAircraftProfileLabel(row)}</strong>
                            <small>{formatAircraftPurposeLabel(row)}</small>
                        </div>
                    ),
                },
                {
                    key: 'fabricante',
                    label: 'Fabricante',
                },
                {
                    key: 'capacidad',
                    label: 'Capacidad',
                    render: (row) => formatAircraftCapabilityLabel(row),
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
                    name: 'perfil_base',
                    label: 'Tipo de avion sugerido',
                    type: 'select',
                    options: AIRCRAFT_PROFILE_PRESETS.map((preset) => ({
                        value: preset.value,
                        label: preset.label,
                    })),
                    helpText: 'Selecciona un perfil para autocompletar modelo, fabricante, capacidad y alcance.',
                    onChange: (value) => resolvePresetDefaults(value),
                },
                {
                    name: 'pais_aerolinea',
                    label: 'Pais de la aerolinea',
                    type: 'select',
                    options: (catalogs) => airlineCountryOptions(catalogs.aerolineas),
                    placeholder: 'Seleccione un pais',
                    onChange: () => ({
                        aerolinea_id: '',
                    }),
                },
                {
                    name: 'aerolinea_id',
                    label: 'Aerolinea',
                    type: 'select',
                    options: (catalogs, formData) =>
                        airlineOptionsByCountry(catalogs.aerolineas, formData.pais_aerolinea),
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
                    helpText: 'Ejemplos recomendados: E190-E2, A220-300, A320neo, 787-8.',
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
                    helpText: 'El alcance ayuda a saber si el avion sirve para tramos cortos, regionales o de largo recorrido.',
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
                perfil_base: '',
                pais_aerolinea: 'Bolivia',
                estado: 'activo',
            }}
            transformFormData={(item) => ({
                perfil_base: resolveAircraftPreset(item.modelo),
                pais_aerolinea: item.aerolinea?.pais ?? '',
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
