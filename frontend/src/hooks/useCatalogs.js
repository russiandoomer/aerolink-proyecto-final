import { useEffect, useState } from 'react';
import { fetchCollection } from '../api/resources';

const ENDPOINTS = {
    aerolineas: 'aerolineas',
    aeropuertos: 'aeropuertos',
    aviones: 'aviones',
    rutas: 'rutas',
    estadosVuelo: 'estados-vuelo',
    vuelos: 'vuelos',
    pasajeros: 'pasajeros',
};

export function useCatalogs(keys = []) {
    const [catalogs, setCatalogs] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const catalogKey = keys.join('|');

    useEffect(() => {
        let active = true;

        async function loadCatalogs() {
            if (keys.length === 0) {
                setCatalogs({});
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const entries = await Promise.all(
                    keys.map(async (key) => {
                        const endpoint = ENDPOINTS[key];

                        const response = await fetchCollection(endpoint, {
                            per_page: 200,
                        });

                        return [key, response.items];
                    })
                );

                if (active) {
                    setCatalogs(Object.fromEntries(entries));
                }
            } catch (requestError) {
                if (active) {
                    setError(requestError);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadCatalogs();

        return () => {
            active = false;
        };
    }, [catalogKey]);

    return { catalogs, loading, error };
}
