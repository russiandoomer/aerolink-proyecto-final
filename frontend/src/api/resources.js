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
