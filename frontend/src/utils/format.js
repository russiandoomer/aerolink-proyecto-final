export function formatDateTime(value) {
    if (!value) {
        return '--';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('es-BO', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

export function toDateTimeLocal(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const pad = (part) => String(part).padStart(2, '0');

    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
    ].join('-')
        + 'T'
        + [pad(date.getHours()), pad(date.getMinutes())].join(':');
}

export function formatCurrency(value) {
    const amount = Number(value);

    if (Number.isNaN(amount)) {
        return '--';
    }

    return new Intl.NumberFormat('es-BO', {
        style: 'currency',
        currency: 'BOB',
        minimumFractionDigits: 2,
    }).format(amount);
}

export function formatPassengerName(passenger) {
    if (!passenger) {
        return '--';
    }

    return `${passenger.nombres ?? ''} ${passenger.apellidos ?? ''}`.trim();
}

export function formatRouteLabel(route) {
    const origin = route?.aeropuerto_origen?.codigo_iata
        ?? route?.aeropuertoOrigen?.codigo_iata
        ?? '--';
    const destination = route?.aeropuerto_destino?.codigo_iata
        ?? route?.aeropuertoDestino?.codigo_iata
        ?? '--';

    return `${origin} - ${destination}`;
}

export function formatRouteTypeLabel(value) {
    const labels = {
        nacional: 'Nacional',
        internacional: 'Internacional',
        adicional: 'Adicional',
    };

    return labels[value] ?? 'Sin clasificar';
}

export function formatFlightLabel(flight) {
    if (!flight) {
        return '--';
    }

    const route = formatRouteLabel(flight.ruta);

    return `${flight.codigo_vuelo ?? '--'} | ${route}`;
}

export function formatBooleanLabel(value, active = 'Activo', inactive = 'Inactivo') {
    return value ? active : inactive;
}

export function resolveAircraftProfile(aircraft) {
    const range = Number(aircraft?.alcance_km ?? 0);
    const capacity = Number(aircraft?.capacidad ?? 0);

    if (range >= 11000 || capacity >= 230) {
        return 'largo_alcance';
    }

    if (range >= 7000 || capacity >= 200) {
        return 'internacional';
    }

    if (range >= 5800 || capacity >= 160) {
        return 'troncal';
    }

    return 'regional';
}

export function formatAircraftProfileLabel(aircraft) {
    const labels = {
        regional: 'Regional',
        troncal: 'Troncal',
        internacional: 'Internacional extendido',
        largo_alcance: 'Largo alcance',
    };

    return labels[resolveAircraftProfile(aircraft)] ?? 'Operativo';
}

export function formatAircraftPurposeLabel(aircraft) {
    const labels = {
        regional: 'Ideal para tramos cortos y ciudades secundarias.',
        troncal: 'Pensado para rutas nacionales e internacionales regionales.',
        internacional: 'Adecuado para rutas de mayor distancia y demanda media-alta.',
        largo_alcance: 'Orientado a rutas intercontinentales o de gran autonomia.',
    };

    return labels[resolveAircraftProfile(aircraft)] ?? 'Uso operacional general.';
}

export function formatAircraftCapabilityLabel(aircraft) {
    const capacity = Number(aircraft?.capacidad ?? 0);
    const range = Number(aircraft?.alcance_km ?? 0);

    if (!capacity && !range) {
        return '--';
    }

    return `${capacity.toLocaleString('es-BO')} pax · ${range.toLocaleString('es-BO')} km`;
}

export function extractApiMessage(error, fallback = 'Ocurrio un error inesperado.') {
    return (
        error?.response?.data?.message
        || error?.message
        || fallback
    );
}

export function extractValidationErrors(error) {
    return error?.response?.data?.errors ?? {};
}
