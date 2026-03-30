import http from './http';

function normalizePaginatedResponse(payload, fallbackPerPage = 10) {
    const items = Array.isArray(payload?.data) ? payload.data : [];

    return {
        items,
        meta: {
            currentPage: payload?.current_page ?? 1,
            lastPage: payload?.last_page ?? 1,
            perPage: payload?.per_page ?? fallbackPerPage,
            total: payload?.total ?? items.length,
        },
    };
}

export async function fetchCollection(endpoint, params = {}) {
    const response = await http.get(`/${endpoint}`, { params });

    return normalizePaginatedResponse(response.data, params.per_page);
}

export async function fetchRecord(endpoint, id) {
    const response = await http.get(`/${endpoint}/${id}`);

    return response.data?.data ?? response.data;
}

export async function createRecord(endpoint, payload) {
    const response = await http.post(`/${endpoint}`, payload);

    return response.data?.data ?? response.data;
}

export async function updateRecord(endpoint, id, payload) {
    const response = await http.put(`/${endpoint}/${id}`, payload);

    return response.data?.data ?? response.data;
}

export async function deleteRecord(endpoint, id) {
    const response = await http.delete(`/${endpoint}/${id}`);

    return response.data;
}

export async function patchRecord(endpoint, payload) {
    const response = await http.patch(`/${endpoint}`, payload);

    return response.data?.data ?? response.data;
}

export async function fetchDashboardSummary() {
    const response = await http.get('/dashboard/resumen');

    return response.data?.data ?? response.data;
}

function normalizeSimulationFlights(items) {
    return items.filter((flight) => {
        const origin = flight?.ruta?.aeropuertoOrigen ?? flight?.ruta?.aeropuerto_origen;
        const destination = flight?.ruta?.aeropuertoDestino ?? flight?.ruta?.aeropuerto_destino;

        return (
            origin &&
            destination &&
            origin.latitud !== null &&
            origin.latitud !== undefined &&
            origin.longitud !== null &&
            origin.longitud !== undefined &&
            destination.latitud !== null &&
            destination.latitud !== undefined &&
            destination.longitud !== null &&
            destination.longitud !== undefined
        );
    });
}

function normalizeAirportCatalogPayload(payload) {
    const airports = Array.isArray(payload?.airports)
        ? payload.airports
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

    const filteredAirports = airports.filter(
        (airport) =>
            airport &&
            airport.latitud !== null &&
            airport.latitud !== undefined &&
            airport.longitud !== null &&
            airport.longitud !== undefined
    );

    const countries = Array.isArray(payload?.countries)
        ? payload.countries
        : Array.from(
              new Set(
                  filteredAirports
                      .map((airport) => airport.pais)
                      .filter(Boolean)
              )
          ).sort((left, right) => left.localeCompare(right));

    return {
        countries,
        airports: filteredAirports,
    };
}

export async function fetchAirportCatalog() {
    try {
        const response = await http.get('/aeropuertos/catalogo');

        return normalizeAirportCatalogPayload(response.data?.data ?? response.data);
    } catch (catalogError) {
        const response = await http.get('/aeropuertos', {
            params: {
                per_page: 100,
                activo: true,
            },
        });

        return normalizeAirportCatalogPayload(response.data);
    }
}

export async function fetchSimulationFlights() {
    const response = await fetchCollection('vuelos', {
        per_page: 200,
    });

    return normalizeSimulationFlights(response.items);
}
