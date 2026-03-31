import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPinned, Play, RotateCcw } from 'lucide-react';
import {
    fetchAirportCatalog,
    fetchSimulationFlights,
} from '../api/resources';
import EmptyState from '../components/common/EmptyState';
import FadeInBlock from '../components/common/FadeInBlock';
import LoadingState from '../components/common/LoadingState';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import SimulationMap from '../components/simulation/SimulationMap';
import {
    formatDateTime,
    formatFlightLabel,
    formatRouteLabel,
} from '../utils/format';

const SPEED_OPTIONS = [
    { value: 'rapida', label: 'Rapida (6 s)', duration: 6000 },
    { value: 'media', label: 'Media (9 s)', duration: 9000 },
    { value: 'presentacion', label: 'Presentacion (12 s)', duration: 12000 },
];

const SIMULATION_MODES = {
    FLIGHT: 'flight',
    MANUAL: 'manual',
};

function normalizeAirport(airport) {
    return {
        ...airport,
        latitud: Number(airport.latitud),
        longitud: Number(airport.longitud),
    };
}

function normalizeFlight(flight) {
    const rawOriginAirport = flight?.ruta?.aeropuertoOrigen ?? flight?.ruta?.aeropuerto_origen;
    const rawDestinationAirport = flight?.ruta?.aeropuertoDestino ?? flight?.ruta?.aeropuerto_destino;
    const originAirport = rawOriginAirport
        ? normalizeAirport(rawOriginAirport)
        : null;
    const destinationAirport = rawDestinationAirport
        ? normalizeAirport(rawDestinationAirport)
        : null;

    return {
        ...flight,
        ruta: {
            ...flight.ruta,
            aeropuertoOrigen: originAirport,
            aeropuertoDestino: destinationAirport,
            aeropuerto_origen: originAirport,
            aeropuerto_destino: destinationAirport,
        },
    };
}

function easeInOutCubic(value) {
    return value < 0.5
        ? 4 * value * value * value
        : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function haversineDistance(origin, destination) {
    const earthRadiusKm = 6371;
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const deltaLat = toRadians(destination.latitud - origin.latitud);
    const deltaLon = toRadians(destination.longitud - origin.longitud);
    const startLat = toRadians(origin.latitud);
    const endLat = toRadians(destination.latitud);

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(startLat) *
            Math.cos(endLat) *
            Math.sin(deltaLon / 2) *
            Math.sin(deltaLon / 2);

    return Math.round(earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function toneFromFlightState(color) {
    return color ?? 'slate';
}

export default function SimulacionPage() {
    const [catalog, setCatalog] = useState(null);
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [simulationMode, setSimulationMode] = useState(SIMULATION_MODES.FLIGHT);
    const [selectedFlightId, setSelectedFlightId] = useState('');
    const [originCountry, setOriginCountry] = useState('');
    const [destinationCountry, setDestinationCountry] = useState('');
    const [originAirportId, setOriginAirportId] = useState('');
    const [destinationAirportId, setDestinationAirportId] = useState('');
    const [speed, setSpeed] = useState(SPEED_OPTIONS[0].value);
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState('idle');
    const animationFrameRef = useRef(null);

    useEffect(() => {
        let active = true;

        async function loadData() {
            try {
                const [airportResponse, flightResponse] = await Promise.all([
                    fetchAirportCatalog(),
                    fetchSimulationFlights(),
                ]);

                if (!active) {
                    return;
                }

                const airports = (airportResponse.airports ?? []).map(normalizeAirport);
                const countries = airportResponse.countries ?? [];
                const normalizedFlights = (flightResponse ?? []).map(normalizeFlight);

                setCatalog({
                    airports,
                    countries,
                });
                setFlights(normalizedFlights);

                const initialOriginCountry = countries.find((item) => item === 'Bolivia') ?? countries[0] ?? '';
                const initialDestinationCountry =
                    countries.find((item) => item === 'Sudafrica') ??
                    countries.find((item) => item !== initialOriginCountry) ??
                    countries[0] ??
                    '';

                setOriginCountry(initialOriginCountry);
                setDestinationCountry(initialDestinationCountry);

                if (normalizedFlights.length > 0) {
                    setSelectedFlightId(String(normalizedFlights[0].id));
                    setSimulationMode(SIMULATION_MODES.FLIGHT);
                } else {
                    setSimulationMode(SIMULATION_MODES.MANUAL);
                }
            } catch (error) {
                if (active) {
                    setCatalog(null);
                    setFlights([]);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadData();

        return () => {
            active = false;

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    const airportsByCountry = useMemo(() => {
        const groups = new Map();

        (catalog?.airports ?? []).forEach((airport) => {
            if (!groups.has(airport.pais)) {
                groups.set(airport.pais, []);
            }

            groups.get(airport.pais).push(airport);
        });

        return groups;
    }, [catalog]);

    const originAirports = useMemo(
        () => airportsByCountry.get(originCountry) ?? [],
        [airportsByCountry, originCountry]
    );

    const destinationAirports = useMemo(
        () => airportsByCountry.get(destinationCountry) ?? [],
        [airportsByCountry, destinationCountry]
    );

    const selectedFlight = useMemo(
        () => flights.find((flight) => String(flight.id) === selectedFlightId) ?? null,
        [flights, selectedFlightId]
    );

    useEffect(() => {
        if (simulationMode !== SIMULATION_MODES.FLIGHT || !selectedFlight) {
            return;
        }

        const origin = selectedFlight.ruta?.aeropuertoOrigen;
        const destination = selectedFlight.ruta?.aeropuertoDestino;

        if (!origin || !destination) {
            return;
        }

        setOriginCountry(origin.pais);
        setDestinationCountry(destination.pais);
        setOriginAirportId(String(origin.id));
        setDestinationAirportId(String(destination.id));
    }, [simulationMode, selectedFlight]);

    useEffect(() => {
        if (!originAirports.some((airport) => String(airport.id) === originAirportId)) {
            setOriginAirportId(originAirports[0] ? String(originAirports[0].id) : '');
        }
    }, [originAirports, originAirportId]);

    useEffect(() => {
        if (!destinationAirports.some((airport) => String(airport.id) === destinationAirportId)) {
            setDestinationAirportId(destinationAirports[0] ? String(destinationAirports[0].id) : '');
        }
    }, [destinationAirports, destinationAirportId]);

    const originAirport = useMemo(
        () => catalog?.airports.find((airport) => String(airport.id) === originAirportId) ?? null,
        [catalog, originAirportId]
    );

    const destinationAirport = useMemo(
        () =>
            catalog?.airports.find((airport) => String(airport.id) === destinationAirportId) ??
            null,
        [catalog, destinationAirportId]
    );

    const selectedSpeed = SPEED_OPTIONS.find((item) => item.value === speed) ?? SPEED_OPTIONS[0];
    const routeDistance =
        originAirport && destinationAirport
            ? haversineDistance(originAirport, destinationAirport)
            : 0;
    const routeDurationMinutes = useMemo(() => {
        const flightDuration = Number(selectedFlight?.ruta?.duracion_minutos ?? 0);

        if (simulationMode === SIMULATION_MODES.FLIGHT && flightDuration > 0) {
            return flightDuration;
        }

        if (!originAirport || !destinationAirport) {
            return 0;
        }

        return Math.max(35, Math.round((routeDistance / 780) * 60));
    }, [
        simulationMode,
        selectedFlight?.ruta?.duracion_minutos,
        originAirport?.id,
        destinationAirport?.id,
        routeDistance,
    ]);

    const canSimulate =
        originAirport &&
        destinationAirport &&
        originAirport.id !== destinationAirport.id &&
        phase !== 'running';

    const displayProgress = phase === 'completed' ? 1 : easeInOutCubic(progress);
    const progressPercent = Math.round(displayProgress * 100);

    useEffect(() => {
        if (!catalog) {
            return;
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        setProgress(0);
        setPhase('idle');
    }, [
        catalog,
        simulationMode,
        selectedFlightId,
        originCountry,
        destinationCountry,
        originAirportId,
        destinationAirportId,
        speed,
    ]);

    function resetSimulation() {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        setProgress(0);
        setPhase('idle');
    }

    function startSimulation() {
        if (!canSimulate) {
            return;
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        setProgress(0);
        setPhase('running');

        const duration = selectedSpeed.duration;
        const start = performance.now();

        const animate = (timestamp) => {
            const nextProgress = Math.min((timestamp - start) / duration, 1);
            setProgress(nextProgress);

            if (nextProgress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
                return;
            }

            animationFrameRef.current = null;
            setPhase('completed');
        };

        animationFrameRef.current = requestAnimationFrame(animate);
    }

    if (loading) {
        return <LoadingState label="Cargando vuelos y catalogo de aeropuertos..." />;
    }

    if (!catalog?.airports?.length) {
        return (
            <EmptyState
                title="No hay aeropuertos disponibles para simular."
                description="Verifica que el catalogo de aeropuertos haya sido sembrado con coordenadas."
            />
        );
    }

    return (
        <section className="simulation-page">
            <PageHeader
                title="Simulacion de vuelo"
                description="Simula vuelos reales registrados en el sistema o construye un recorrido manual usando el catalogo de aeropuertos. La animacion es acelerada y mantiene visible todo el trayecto."
            />

            <div className="simulation-layout">
                <FadeInBlock className="panel-card simulation-panel" delay={0.06}>
                    <div className="section-title">
                        <div>
                            <strong>Fuente de la simulacion</strong>
                            <small>Elige si deseas usar un vuelo registrado o un recorrido manual</small>
                        </div>
                    </div>

                    <div className="simulation-mode-switch">
                        <button
                            type="button"
                            className={`simulation-mode-button ${simulationMode === SIMULATION_MODES.FLIGHT ? 'is-active' : ''}`}
                            onClick={() => setSimulationMode(SIMULATION_MODES.FLIGHT)}
                            disabled={flights.length === 0}
                        >
                            Vuelos registrados
                        </button>
                        <button
                            type="button"
                            className={`simulation-mode-button ${simulationMode === SIMULATION_MODES.MANUAL ? 'is-active' : ''}`}
                            onClick={() => setSimulationMode(SIMULATION_MODES.MANUAL)}
                        >
                            Ruta manual
                        </button>
                    </div>

                    {simulationMode === SIMULATION_MODES.FLIGHT ? (
                        <>
                            <div className="section-title simulation-subtitle">
                                <div>
                                    <strong>Seleccionar vuelo</strong>
                                    <small>Los vuelos creados en el modulo de vuelos aparecen automaticamente aqui</small>
                                </div>
                            </div>

                            <div className="simulation-form-grid">
                                <label className="simulation-field">
                                    <span>Vuelo disponible</span>
                                    <select
                                        value={selectedFlightId}
                                        onChange={(event) => setSelectedFlightId(event.target.value)}
                                    >
                                        {flights.map((flight) => (
                                            <option key={flight.id} value={flight.id}>
                                                {formatFlightLabel(flight)} | {flight.aerolinea?.nombre ?? 'Sin aerolinea'}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="simulation-field">
                                    <span>Velocidad</span>
                                    <select
                                        value={speed}
                                        onChange={(event) => setSpeed(event.target.value)}
                                    >
                                        {SPEED_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            {selectedFlight ? (
                                <article className="simulation-flight-card">
                                    <div className="simulation-flight-card__head">
                                        <div>
                                            <strong>{selectedFlight.codigo_vuelo}</strong>
                                            <small>
                                                {formatRouteLabel(selectedFlight.ruta)} | {selectedFlight.aerolinea?.nombre ?? 'Sin aerolinea'}
                                            </small>
                                        </div>
                                        <StatusBadge
                                            label={selectedFlight.estado_vuelo?.nombre ?? 'Sin estado'}
                                            tone={toneFromFlightState(selectedFlight.estado_vuelo?.color)}
                                        />
                                    </div>

                                    <div className="simulation-flight-card__grid">
                                        <div>
                                            <span>Salida</span>
                                            <strong>{formatDateTime(selectedFlight.fecha_salida)}</strong>
                                        </div>
                                        <div>
                                            <span>Llegada</span>
                                            <strong>{formatDateTime(selectedFlight.fecha_llegada)}</strong>
                                        </div>
                                        <div>
                                            <span>Avion</span>
                                            <strong>{selectedFlight.avion?.matricula ?? '--'}</strong>
                                        </div>
                                        <div>
                                            <span>Reservas activas</span>
                                            <strong>{selectedFlight.reservas_activas_count ?? 0}</strong>
                                        </div>
                                    </div>

                                    <div className="simulation-flight-card__route">
                                        <MapPinned size={16} />
                                        <span>
                                            {selectedFlight.ruta?.aeropuertoOrigen?.ciudad ?? '--'} - {selectedFlight.ruta?.aeropuertoDestino?.ciudad ?? '--'}
                                        </span>
                                    </div>
                                </article>
                            ) : (
                                <EmptyState
                                    title="No hay vuelos simulables."
                                    description="Registra vuelos con rutas cuyos aeropuertos tengan coordenadas para visualizarlos aqui."
                                />
                            )}
                        </>
                    ) : (
                        <>
                            <div className="section-title simulation-subtitle">
                                <div>
                                    <strong>Configurar recorrido manual</strong>
                                    <small>Usa el catalogo de paises y aeropuertos para construir una ruta personalizada</small>
                                </div>
                            </div>

                            <div className="simulation-form-grid">
                                <label className="simulation-field">
                                    <span>Pais de origen</span>
                                    <select
                                        value={originCountry}
                                        onChange={(event) => setOriginCountry(event.target.value)}
                                    >
                                        {catalog.countries.map((country) => (
                                            <option key={country} value={country}>
                                                {country}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="simulation-field">
                                    <span>Aeropuerto de origen</span>
                                    <select
                                        value={originAirportId}
                                        onChange={(event) => setOriginAirportId(event.target.value)}
                                    >
                                        {originAirports.map((airport) => (
                                            <option key={airport.id} value={airport.id}>
                                                {airport.codigo_iata} | {airport.ciudad} - {airport.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="simulation-field">
                                    <span>Pais de destino</span>
                                    <select
                                        value={destinationCountry}
                                        onChange={(event) => setDestinationCountry(event.target.value)}
                                    >
                                        {catalog.countries.map((country) => (
                                            <option key={country} value={country}>
                                                {country}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="simulation-field">
                                    <span>Aeropuerto de destino</span>
                                    <select
                                        value={destinationAirportId}
                                        onChange={(event) => setDestinationAirportId(event.target.value)}
                                    >
                                        {destinationAirports.map((airport) => (
                                            <option key={airport.id} value={airport.id}>
                                                {airport.codigo_iata} | {airport.ciudad} - {airport.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="simulation-field">
                                    <span>Velocidad</span>
                                    <select
                                        value={speed}
                                        onChange={(event) => setSpeed(event.target.value)}
                                    >
                                        {SPEED_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </>
                    )}

                    <div className="simulation-actions">
                        <button
                            type="button"
                            className="button-primary"
                            onClick={startSimulation}
                            disabled={!canSimulate}
                        >
                            <Play size={16} />
                            <span>Iniciar simulacion</span>
                        </button>

                        <button
                            type="button"
                            className="button-secondary"
                            onClick={resetSimulation}
                        >
                            <RotateCcw size={16} />
                            <span>Resetear</span>
                        </button>
                    </div>

                    <div className="simulation-status-card">
                        <div>
                            <strong>
                                {originAirport?.codigo_iata ?? '--'} - {destinationAirport?.codigo_iata ?? '--'}
                            </strong>
                            <small>
                                {originAirport?.ciudad ?? 'Sin origen'} a{' '}
                                {destinationAirport?.ciudad ?? 'Sin destino'}
                            </small>
                        </div>
                        <div>
                            <strong>{routeDistance.toLocaleString()} km</strong>
                            <small>Recorrido estimado</small>
                        </div>
                        <div>
                            <strong>{selectedSpeed.label}</strong>
                            <small>Animacion rapida</small>
                        </div>
                    </div>

                    <div className="simulation-progress-panel">
                        <div className="simulation-progress-copy">
                            <strong>
                                {phase === 'running'
                                    ? 'Vuelo en simulacion'
                                    : phase === 'completed'
                                      ? 'Recorrido completado'
                                      : 'Listo para iniciar'}
                            </strong>
                            <small>
                                {simulationMode === SIMULATION_MODES.FLIGHT
                                    ? 'La simulacion toma los datos del vuelo registrado y reproduce su trayecto de forma acelerada.'
                                    : 'La trayectoria se construye manualmente a partir del catalogo de aeropuertos con coordenadas.'}
                            </small>
                        </div>

                        <div className="simulation-progress-bar">
                            <span style={{ width: `${displayProgress * 100}%` }} />
                        </div>
                    </div>
                </FadeInBlock>

                <div className="panel-card simulation-map-panel">
                    <div className="section-title">
                        <div>
                            <strong>Recorrido visual completo</strong>
                            <small>Vista global con avance continuo, origen, destino y progreso operativo</small>
                        </div>
                    </div>

                    <SimulationMap
                        originAirport={originAirport}
                        destinationAirport={destinationAirport}
                        progress={displayProgress}
                        routeDistance={routeDistance}
                        routeDurationMinutes={routeDurationMinutes}
                        speedLabel={selectedSpeed.label}
                        phase={phase}
                        progressPercent={progressPercent}
                    />
                </div>
            </div>
        </section>
    );
}
