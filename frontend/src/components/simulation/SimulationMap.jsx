import { useEffect, useState } from 'react';
import {
    geoGraticule10,
    geoInterpolate,
    geoNaturalEarth1,
    geoPath,
} from 'd3-geo';
import { feature } from 'topojson-client';
import worldAtlas from 'world-atlas/countries-110m.json';

const BOARD_WIDTH = 1120;
const BOARD_HEIGHT = 560;
const VIEW_MODE = {
    GLOBAL: 'global',
    FOCUSED: 'focused',
};
const MIN_ZOOM = 1;
const MAX_ZOOM = 12;

const projection = geoNaturalEarth1().fitExtent(
    [
        [26, 26],
        [BOARD_WIDTH - 26, BOARD_HEIGHT - 128],
    ],
    { type: 'Sphere' }
);

const pathGenerator = geoPath(projection);
const worldCountries = feature(worldAtlas, worldAtlas.objects.countries).features;
const spherePath = pathGenerator({ type: 'Sphere' });
const graticulePath = pathGenerator(geoGraticule10());
const GLOBAL_VIEWBOX = {
    minX: 0,
    minY: 0,
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
};

const COUNTRY_NAME_MAP = {
    Bolivia: 'Bolivia',
    Peru: 'Peru',
    Chile: 'Chile',
    Argentina: 'Argentina',
    Brasil: 'Brazil',
    Colombia: 'Colombia',
    Mexico: 'Mexico',
    'Estados Unidos': 'United States of America',
    Espana: 'Spain',
    Francia: 'France',
    'Reino Unido': 'United Kingdom',
    Marruecos: 'Morocco',
    Egipto: 'Egypt',
    Sudafrica: 'South Africa',
    Kenia: 'Kenya',
};

const COUNTRY_LABELS = [
    { id: 'bolivia', label: 'Bolivia', latitud: -16.7, longitud: -64.8 },
    { id: 'peru', label: 'Peru', latitud: -10.1, longitud: -75.0 },
    { id: 'chile', label: 'Chile', latitud: -29.8, longitud: -71.0 },
    { id: 'argentina', label: 'Argentina', latitud: -37.0, longitud: -64.5 },
    { id: 'brasil', label: 'Brasil', latitud: -12.5, longitud: -53.0 },
    { id: 'colombia', label: 'Colombia', latitud: 4.6, longitud: -73.8 },
    { id: 'mexico', label: 'Mexico', latitud: 22.8, longitud: -102.0 },
    { id: 'usa', label: 'Estados Unidos', latitud: 38.0, longitud: -98.0 },
    { id: 'espana', label: 'Espana', latitud: 40.2, longitud: -3.7 },
    { id: 'francia', label: 'Francia', latitud: 46.0, longitud: 2.0 },
    { id: 'uk', label: 'Reino Unido', latitud: 54.4, longitud: -2.8 },
    { id: 'marruecos', label: 'Marruecos', latitud: 31.8, longitud: -7.1 },
    { id: 'egipto', label: 'Egipto', latitud: 26.5, longitud: 29.8 },
    { id: 'sudafrica', label: 'Sudafrica', latitud: -29.0, longitud: 24.0 },
    { id: 'kenia', label: 'Kenia', latitud: 0.2, longitud: 37.8 },
];

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function resolveInfoDotX(label) {
    return clamp(14 + label.length * 5.15 + 9, 118, 172);
}

function projectCoordinate(latitud, longitud) {
    const point = projection([Number(longitud), Number(latitud)]);

    if (!point) {
        return { x: 0, y: 0 };
    }

    return {
        x: point[0],
        y: point[1],
    };
}

function buildPathFromPoints(points) {
    return points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ');
}

function buildRoutePoints(originAirport, destinationAirport, segments = 68) {
    const interpolate = geoInterpolate(
        [Number(originAirport.longitud), Number(originAirport.latitud)],
        [Number(destinationAirport.longitud), Number(destinationAirport.latitud)]
    );

    return Array.from({ length: segments }, (_, index) => {
        const position = interpolate(index / (segments - 1));

        return projectCoordinate(position[1], position[0]);
    });
}

function resolveCountryLabel(country, originAirport, destinationAirport) {
    const isOrigin = country.label === originAirport.pais;
    const isDestination = country.label === destinationAirport.pais;
    const isSelected = isOrigin || isDestination;

    return {
        ...country,
        ...projectCoordinate(country.latitud, country.longitud),
        isSelected,
    };
}

function resolveHighlightedCountryNames(originAirport, destinationAirport) {
    return new Set([
        COUNTRY_NAME_MAP[originAirport.pais] ?? originAirport.pais,
        COUNTRY_NAME_MAP[destinationAirport.pais] ?? destinationAirport.pais,
    ]);
}

function resolveCountryPaths(highlightedCountries) {
    return worldCountries
        .map((country) => ({
            id: country.id,
            name: country.properties?.name ?? '',
            d: pathGenerator(country),
            highlighted: highlightedCountries.has(country.properties?.name ?? ''),
        }))
        .filter((country) => country.d);
}

function resolveDefaultZoomLevel(routeDistance) {
    if (routeDistance <= 250) {
        return 10;
    }

    if (routeDistance <= 700) {
        return 8;
    }

    if (routeDistance <= 1600) {
        return 6;
    }

    if (routeDistance <= 3200) {
        return 4;
    }

    return 2;
}

function resolveFocusedViewBox(targetPoints, zoomLevel) {
    const safeZoom = Math.max(1, zoomLevel);
    const aspectRatio = BOARD_WIDTH / BOARD_HEIGHT;
    const padding = Math.max(10, 170 / safeZoom);
    const minWidth = Math.max(36, 420 / safeZoom);
    const minHeight = Math.max(26, 250 / safeZoom);
    const xs = targetPoints.map((point) => point.x);
    const ys = targetPoints.map((point) => point.y);
    const rawWidth = Math.max(...xs) - Math.min(...xs);
    const rawHeight = Math.max(...ys) - Math.min(...ys);
    let width = Math.max(rawWidth + padding * 2, minWidth);
    let height = Math.max(rawHeight + padding * 2, minHeight);

    if (width / height > aspectRatio) {
        height = width / aspectRatio;
    } else {
        width = height * aspectRatio;
    }

    width = Math.min(width, BOARD_WIDTH);
    height = Math.min(height, BOARD_HEIGHT);

    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;

    return {
        minX: width >= BOARD_WIDTH ? 0 : clamp(centerX - width / 2, 0, BOARD_WIDTH - width),
        minY: height >= BOARD_HEIGHT ? 0 : clamp(centerY - height / 2, 0, BOARD_HEIGHT - height),
        width,
        height,
    };
}

function formatViewBox(viewBox) {
    return `${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`;
}

export default function SimulationMap({
    originAirport,
    destinationAirport,
    progress,
    routeDistance,
    routeDurationMinutes,
    speedLabel,
    phase,
    progressPercent,
}) {
    const [viewMode, setViewMode] = useState(VIEW_MODE.GLOBAL);
    const [zoomLevel, setZoomLevel] = useState(MIN_ZOOM);

    useEffect(() => {
        if (!originAirport || !destinationAirport) {
            setViewMode(VIEW_MODE.GLOBAL);
            setZoomLevel(MIN_ZOOM);
            return;
        }

        const nextZoomLevel = resolveDefaultZoomLevel(routeDistance);
        const nextViewMode = routeDistance <= 4200 ? VIEW_MODE.FOCUSED : VIEW_MODE.GLOBAL;

        setZoomLevel(nextZoomLevel);
        setViewMode(nextViewMode);
    }, [originAirport?.id, destinationAirport?.id, routeDistance]);

    function handleZoomChange(delta) {
        setViewMode(VIEW_MODE.FOCUSED);
        setZoomLevel((value) => clamp(value + delta, MIN_ZOOM, MAX_ZOOM));
    }

    function handleWheel(event) {
        if (viewMode !== VIEW_MODE.FOCUSED) {
            return;
        }

        event.preventDefault();
        handleZoomChange(event.deltaY < 0 ? 1 : -1);
    }

    if (!originAirport || !destinationAirport) {
        return (
            <div className="simulation-board simulation-board-empty">
                <p>Selecciona origen y destino para visualizar el recorrido.</p>
            </div>
        );
    }

    const highlightedCountries = resolveHighlightedCountryNames(originAirport, destinationAirport);
    const countryPaths = resolveCountryPaths(highlightedCountries);
    const countryLabels = COUNTRY_LABELS.map((country) =>
        resolveCountryLabel(country, originAirport, destinationAirport)
    );
    const routePoints = buildRoutePoints(originAirport, destinationAirport);
    const currentIndex = clamp(
        Math.round(progress * (routePoints.length - 1)),
        0,
        routePoints.length - 1
    );
    const current = routePoints[currentIndex];
    const previous = routePoints[Math.max(currentIndex - 1, 0)];
    const start = routePoints[0];
    const end = routePoints[routePoints.length - 1];
    const angle = (Math.atan2(current.y - previous.y, current.x - previous.x) * 180) / Math.PI;
    const fullRoutePath = buildPathFromPoints(routePoints);
    const completedRoutePath = buildPathFromPoints(routePoints.slice(0, currentIndex + 1));
    const originLabelX = clamp(start.x + 16, 18, BOARD_WIDTH - 206);
    const originLabelY = clamp(start.y - 56, 18, BOARD_HEIGHT - 62);
    const destinationLabelX = clamp(end.x - 206, 18, BOARD_WIDTH - 206);
    const destinationLabelY = clamp(end.y - 56, 18, BOARD_HEIGHT - 62);
    const originInfoLine = `${originAirport.ciudad}, ${originAirport.pais}`;
    const destinationInfoLine = `${destinationAirport.ciudad}, ${destinationAirport.pais}`;
    const originInfoDotX = resolveInfoDotX(originInfoLine);
    const destinationInfoDotX = resolveInfoDotX(destinationInfoLine);
    const isVeryShortRoute = routeDurationMinutes > 0 && routeDurationMinutes <= 120;
    const isShortRoute = routeDurationMinutes > 120 && routeDurationMinutes <= 300;
    const markerRadius = isVeryShortRoute ? 3.2 : isShortRoute ? 4.4 : 8;
    const pulseRadius = isVeryShortRoute ? 6.5 : isShortRoute ? 9.5 : 18;
    const planeGlowRadius = isVeryShortRoute ? 5.2 : isShortRoute ? 7.2 : 14;
    const planeCoreRadius = isVeryShortRoute ? 4.8 : isShortRoute ? 6.4 : 12;
    const planeFontSize = isVeryShortRoute ? 9 : isShortRoute ? 12 : 20;
    const planeStrokeWidth = isVeryShortRoute ? 1 : isShortRoute ? 1.2 : 1.6;
    const pulseOpacity = isVeryShortRoute ? 0.12 : isShortRoute ? 0.18 : undefined;
    const phaseLabel =
        phase === 'running'
            ? 'EN RUTA'
            : phase === 'completed'
              ? 'COMPLETADO'
              : 'LISTO';

    const focusedTargets = routePoints;

    const activeViewBox =
        viewMode === VIEW_MODE.FOCUSED
            ? resolveFocusedViewBox(focusedTargets, zoomLevel)
            : GLOBAL_VIEWBOX;

    const visibleCountryLabels =
        viewMode === VIEW_MODE.FOCUSED
            ? countryLabels.filter((country) => country.isSelected)
            : countryLabels;

    return (
        <div className="simulation-map-frame">
            <div className="simulation-board">
                <div className="simulation-board__meta">
                    <span>Origen · {originAirport.codigo_iata}</span>
                    <span>Destino · {destinationAirport.codigo_iata}</span>
                </div>

                <div className="simulation-board__status">
                    <span className={`simulation-board__status-badge is-${phase}`}>
                        {phaseLabel}
                    </span>
                </div>

                <div className="simulation-board__controls">
                    <button
                        type="button"
                        className={`simulation-board__control ${viewMode === VIEW_MODE.GLOBAL ? 'is-active' : ''}`}
                        onClick={() => setViewMode(VIEW_MODE.GLOBAL)}
                    >
                        Vista global
                    </button>
                    <button
                        type="button"
                        className={`simulation-board__control ${viewMode === VIEW_MODE.FOCUSED ? 'is-active' : ''}`}
                        onClick={() => setViewMode(VIEW_MODE.FOCUSED)}
                    >
                        Zoom ruta
                    </button>
                    <span className="simulation-board__zoom-badge">Zoom x{zoomLevel}</span>
                    <button
                        type="button"
                        className="simulation-board__control simulation-board__control-mini"
                        onClick={() => handleZoomChange(-1)}
                        disabled={viewMode !== VIEW_MODE.FOCUSED || zoomLevel <= MIN_ZOOM}
                    >
                        -
                    </button>
                    <button
                        type="button"
                        className="simulation-board__control simulation-board__control-mini"
                        onClick={() => handleZoomChange(1)}
                        disabled={viewMode !== VIEW_MODE.FOCUSED || zoomLevel >= MAX_ZOOM}
                    >
                        +
                    </button>
                </div>

                <svg
                    className="simulation-board__svg"
                    viewBox={formatViewBox(activeViewBox)}
                    role="img"
                    aria-label={`Recorrido entre ${originAirport.codigo_iata} y ${destinationAirport.codigo_iata}`}
                    onWheel={handleWheel}
                >
                <defs>
                    <linearGradient id="simulationOceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#09121d" />
                        <stop offset="55%" stopColor="#0d1a28" />
                        <stop offset="100%" stopColor="#09121a" />
                    </linearGradient>
                    <linearGradient id="simulationLandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d3dde5" />
                        <stop offset="100%" stopColor="#aebdca" />
                    </linearGradient>
                    <linearGradient id="simulationRouteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#67e8f9" />
                        <stop offset="55%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>
                </defs>

                <rect
                    x="0"
                    y="0"
                    width={BOARD_WIDTH}
                    height={BOARD_HEIGHT}
                    rx="28"
                    className="simulation-board__background"
                />

                <path d={spherePath} className="simulation-board__sphere" />
                <path d={graticulePath} className="simulation-board__graticule" />

                {countryPaths.map((country) => (
                    <path
                        key={country.id}
                        d={country.d}
                        className={
                            country.highlighted
                                ? 'simulation-board__country is-highlighted'
                                : 'simulation-board__country'
                        }
                    />
                ))}

                {visibleCountryLabels.map((country) => (
                    <g
                        key={country.id}
                        transform={`translate(${country.x} ${country.y})`}
                        className={
                            country.isSelected
                                ? 'simulation-board__country-label is-selected'
                                : 'simulation-board__country-label'
                        }
                    >
                        <text textAnchor="middle" dominantBaseline="central">
                            {country.label}
                        </text>
                    </g>
                ))}

                <path d={fullRoutePath} className="simulation-board__route-halo" />
                <path d={fullRoutePath} className="simulation-board__route" />
                <path
                    d={completedRoutePath}
                    className="simulation-board__route simulation-board__route-completed"
                />

                <circle
                    cx={start.x}
                    cy={start.y}
                    r={markerRadius}
                    className="simulation-board__marker simulation-board__marker-origin"
                />
                <circle
                    cx={start.x}
                    cy={start.y}
                    r={pulseRadius}
                    className="simulation-board__pulse simulation-board__pulse-origin"
                    style={pulseOpacity ? { opacity: pulseOpacity } : undefined}
                />
                <circle
                    cx={end.x}
                    cy={end.y}
                    r={markerRadius}
                    className="simulation-board__marker simulation-board__marker-destination"
                />
                <circle
                    cx={end.x}
                    cy={end.y}
                    r={pulseRadius}
                    className="simulation-board__pulse simulation-board__pulse-destination"
                    style={pulseOpacity ? { opacity: pulseOpacity } : undefined}
                />

                <circle
                    cx={current.x}
                    cy={current.y}
                    r={planeGlowRadius}
                    className="simulation-board__marker simulation-board__marker-plane-glow"
                />

                <g transform={`translate(${current.x} ${current.y}) rotate(${angle})`}>
                    <circle
                        r={planeCoreRadius}
                        className="simulation-board__plane-core"
                        style={{ strokeWidth: planeStrokeWidth }}
                    />
                    <text
                        className="simulation-board__plane-icon"
                        style={{ fontSize: `${planeFontSize}px` }}
                        textAnchor="middle"
                        dominantBaseline="central"
                    >
                        ✈
                    </text>
                </g>

                <g transform={`translate(${originLabelX} ${originLabelY})`}>
                    <rect width="190" height="46" rx="14" className="simulation-board__label" />
                    <text x="14" y="18" className="simulation-board__label-code">
                        {originAirport.codigo_iata}
                    </text>
                    <text x="14" y="33" className="simulation-board__label-city">
                        {originInfoLine}
                    </text>
                    <circle
                        cx={originInfoDotX}
                        cy="29"
                        r="4"
                        className="simulation-board__label-dot simulation-board__label-dot-origin"
                    />
                </g>

                <g transform={`translate(${destinationLabelX} ${destinationLabelY})`}>
                    <rect width="190" height="46" rx="14" className="simulation-board__label" />
                    <text x="14" y="18" className="simulation-board__label-code">
                        {destinationAirport.codigo_iata}
                    </text>
                    <text x="14" y="33" className="simulation-board__label-city">
                        {destinationInfoLine}
                    </text>
                    <circle
                        cx={destinationInfoDotX}
                        cy="29"
                        r="4"
                        className="simulation-board__label-dot simulation-board__label-dot-destination"
                    />
                </g>
                </svg>
            </div>

            <div className="simulation-board__hud simulation-board__hud-external">
                <div className="simulation-board__hud-copy">
                    <span className="simulation-board__eyebrow">Global Route Monitor</span>
                    <strong>
                        {originAirport.ciudad}, {originAirport.pais} a {destinationAirport.ciudad},{' '}
                        {destinationAirport.pais}
                    </strong>
                    <small>
                        La vista puede cambiar entre mapa completo y enfoque de tramo. Ademas,
                        en modo de zoom puedes usar los botones + y - varias veces para acercarte
                        mucho mas a rutas cortas como VVI-LPB o LPB-CBB.
                    </small>
                </div>

                <div className="simulation-board__hud-grid">
                    <div className="simulation-board__hud-kpi">
                        <span>Distancia</span>
                        <strong>{routeDistance.toLocaleString()} km</strong>
                    </div>
                    <div className="simulation-board__hud-kpi">
                        <span>Velocidad visual</span>
                        <strong>{speedLabel}</strong>
                    </div>
                    <div className="simulation-board__hud-kpi">
                        <span>Progreso</span>
                        <strong>{progressPercent}%</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}
