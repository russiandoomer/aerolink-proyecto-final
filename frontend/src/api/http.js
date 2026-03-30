import axios from 'axios';

const http = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

http.interceptors.request.use((config) => {
    const apiKey = import.meta.env.VITE_API_KEY;

    if (apiKey) {
        config.headers['X-API-KEY'] = apiKey;
    }

    return config;
});

export default http;
