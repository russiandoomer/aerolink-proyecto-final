import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { geoInterpolate } from 'd3-geo';

const VIEW_MODE = {
    GLOBAL: 'global',
    FOCUSED: 'focused',
};

const WORLD_CENTER = [18, -24];
const GLOBAL_ZOOM = 2;
const MIN_ZOOM = 2;
const MAX_ZOOM = 14;
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors';

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function buildGreatCirclePoints(originAirport, destinationAirport, segments = 96) {
    const interpolate = geoInterpolate(
        [Number(originAirport.longitud), Number(originAirport.latitud)],
        [Number(destinationAirport.longitud), Number(destinationAirport.latitud)]
    );

    return Array.from({ length: segments }, (_, index) => {
        const position = interpolate(index / (segments - 1));

        return [position[1], position[0]];
    });
}

function routePointAtProgress(routePoints, progress) {
    if (routePoints.length === 0) {
        return null;
    }

    if (routePoints.length === 1) {
        return routePoints[0];
    }

    const scaledIndex = clamp(progress, 0, 1) * (routePoints.length - 1);
    const lowerIndex = Math.floor(scaledIndex);
    const upperIndex = Math.min(Math.ceil(scaledIndex), routePoints.length - 1);
    const weight = scaledIndex - lowerIndex;
    const start = routePoints[lowerIndex];
    const end = routePoints[upperIndex];

    if (lowerIndex === upperIndex) {
        return start;
    }

    return [
        start[0] + (end[0] - start[0]) * weight,
        start[1] + (end[1] - start[1]) * weight,
    ];
}

function routePointsUntilProgress(routePoints, progress) {
    if (routePoints.length === 0) {
        return [];
    }

    const scaledIndex = clamp(progress, 0, 1) * (routePoints.length - 1);
    const completedIndex = Math.floor(scaledIndex);
    const partialPoint = routePointAtProgress(routePoints, progress);
    const slice = routePoints.slice(0, completedIndex + 1);

    if (partialPoint) {
        slice.push(partialPoint);
    }

    return slice;
}

function computeBearing(startPoint, endPoint) {
    if (!startPoint || !endPoint) {
        return 0;
    }

    const startLat = (startPoint[0] * Math.PI) / 180;
    const startLng = (startPoint[1] * Math.PI) / 180;
    const endLat = (endPoint[0] * Math.PI) / 180;
    const endLng = (endPoint[1] * Math.PI) / 180;
    const deltaLng = endLng - startLng;

    const y = Math.sin(deltaLng) * Math.cos(endLat);
    const x =
        Math.cos(startLat) * Math.sin(endLat) -
        Math.sin(startLat) * Math.cos(endLat) * Math.cos(deltaLng);

    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function resolveDefaultZoomLevel(routeDistance) {
    if (routeDistance <= 250) {
        return 9;
    }

    if (routeDistance <= 700) {
        return 8;
    }

    if (routeDistance <= 1600) {
        return 6;
    }

    if (routeDistance <= 3200) {
        return 5;
    }

    if (routeDistance <= 6400) {
        return 4;
    }

    return 3;
}

function resolveFocusPadding(routeDistance) {
    if (routeDistance <= 250) {
        return [110, 110];
    }

    if (routeDistance <= 700) {
        return [95, 95];
    }

    if (routeDistance <= 1600) {
        return [82, 82];
    }

    return [72, 72];
}

function resolveMarkerScale(routeDurationMinutes) {
    if (routeDurationMinutes > 0 && routeDurationMinutes <= 120) {
        return {
            pointSize: 12,
            pulseSize: 26,
            planeSize: 28,
            planeGlyph: 11,
            haloSize: 38,
        };
    }

    if (routeDurationMinutes > 120 && routeDurationMinutes <= 300) {
        return {
            pointSize: 15,
            pulseSize: 30,
            planeSize: 34,
            planeGlyph: 13,
            haloSize: 44,
        };
    }

    return {
        pointSize: 19,
        pulseSize: 36,
        planeSize: 42,
        planeGlyph: 16,
        haloSize: 54,
    };
}

function createAirportIcon(type, markerScale) {
    return L.divIcon({
        className: '',
        html: `
            <div class="simulation-map-marker simulation-map-marker--${type}" style="--point-size:${markerScale.pointSize}px; --pulse-size:${markerScale.pulseSize}px;">
                <span class="simulation-map-marker__pulse"></span>
                <span class="simulation-map-marker__dot"></span>
            </div>
        `,
        iconSize: [markerScale.pulseSize, markerScale.pulseSize],
        iconAnchor: [markerScale.pulseSize / 2, markerScale.pulseSize / 2],
    });
}

function createPlaneIcon(angle, markerScale) {
    return L.divIcon({
        className: '',
        html: `
            <div class="simulation-plane" style="--plane-size:${markerScale.planeSize}px; --plane-glyph:${markerScale.planeGlyph}px; --plane-halo:${markerScale.haloSize}px;">
                <span class="simulation-plane__halo"></span>
                <span class="simulation-plane__body">
                    <span class="simulation-plane__glyph" style="transform: rotate(${angle}deg);">✈</span>
                </span>
            </div>
        `,
        iconSize: [markerScale.haloSize, markerScale.haloSize],
        iconAnchor: [markerScale.haloSize / 2, markerScale.haloSize / 2],
    });
}

function buildAirportTooltip(airport, type) {
    const state = type === 'origin' ? 'Origen' : 'Destino';

    return `
        <div class="simulation-map-tooltip__stack">
            <strong>${state} · ${airport.codigo_iata}</strong>
            <span>${airport.ciudad}, ${airport.pais}</span>
        </div>
    `;
}

function fitRouteOnMap(map, routePoints, routeDistance, viewMode) {
    if (!map || routePoints.length === 0) {
        return;
    }

    const bounds = L.latLngBounds(routePoints);

    if (viewMode === VIEW_MODE.GLOBAL) {
        map.flyToBounds(bounds, {
            padding: [78, 78],
            maxZoom: 4,
            duration: 0.65,
        });

        return;
    }

    map.flyToBounds(bounds, {
        padding: resolveFocusPadding(routeDistance),
        maxZoom: resolveDefaultZoomLevel(routeDistance),
        duration: 0.65,
    });
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
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const tileLayerRef = useRef(null);
    const fullRouteRef = useRef(null);
    const completedRouteRef = useRef(null);
    const originMarkerRef = useRef(null);
    const destinationMarkerRef = useRef(null);
    const planeMarkerRef = useRef(null);
    const [viewMode, setViewMode] = useState(VIEW_MODE.GLOBAL);
    const [zoomLevel, setZoomLevel] = useState(GLOBAL_ZOOM);
    const [tileError, setTileError] = useState(false);

    const routePoints = useMemo(() => {
        if (!originAirport || !destinationAirport) {
            return [];
        }

        return buildGreatCirclePoints(originAirport, destinationAirport);
    }, [originAirport, destinationAirport]);

    const markerScale = useMemo(
        () => resolveMarkerScale(routeDurationMinutes),
        [routeDurationMinutes]
    );

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) {
            return undefined;
        }

        const map = L.map(mapContainerRef.current, {
            center: WORLD_CENTER,
            zoom: GLOBAL_ZOOM,
            minZoom: MIN_ZOOM,
            maxZoom: MAX_ZOOM,
            zoomControl: false,
            attributionControl: true,
            worldCopyJump: false,
            scrollWheelZoom: true,
            dragging: true,
            doubleClickZoom: true,
            touchZoom: true,
        });

        const tileLayer = L.tileLayer(TILE_URL, {
            attribution: TILE_ATTRIBUTION,
            maxZoom: 19,
        });

        tileLayer.on('load', () => setTileError(false));
        tileLayer.on('tileerror', () => setTileError(true));
        tileLayer.addTo(map);

        map.on('zoomend', () => {
            setZoomLevel(Math.round(map.getZoom()));
        });

        mapRef.current = map;
        tileLayerRef.current = tileLayer;
        setZoomLevel(Math.round(map.getZoom()));

        return () => {
            map.remove();
            mapRef.current = null;
            tileLayerRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!originAirport || !destinationAirport) {
            setViewMode(VIEW_MODE.GLOBAL);
            return;
        }

        setViewMode(routeDistance <= 4200 ? VIEW_MODE.FOCUSED : VIEW_MODE.GLOBAL);
    }, [originAirport?.id, destinationAirport?.id, routeDistance]);

    useEffect(() => {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        if (!originAirport || !destinationAirport || routePoints.length === 0) {
            map.setView(WORLD_CENTER, GLOBAL_ZOOM, { animate: true });
            setZoomLevel(Math.round(map.getZoom()));
            return;
        }

        fitRouteOnMap(map, routePoints, routeDistance, viewMode);
    }, [
        originAirport?.id,
        destinationAirport?.id,
        routePoints,
        routeDistance,
        viewMode,
    ]);

    useEffect(() => {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        if (!originAirport || !destinationAirport || routePoints.length === 0) {
            [
                fullRouteRef.current,
                completedRouteRef.current,
                originMarkerRef.current,
                destinationMarkerRef.current,
                planeMarkerRef.current,
            ].forEach((layer) => {
                if (layer) {
                    map.removeLayer(layer);
                }
            });

            fullRouteRef.current = null;
            completedRouteRef.current = null;
            originMarkerRef.current = null;
            destinationMarkerRef.current = null;
            planeMarkerRef.current = null;
            return;
        }

        if (!fullRouteRef.current) {
            fullRouteRef.current = L.polyline(routePoints, {
                color: '#5dd6f3',
                weight: 3,
                opacity: 0.8,
                dashArray: '12 12',
            }).addTo(map);
        } else {
            fullRouteRef.current.setLatLngs(routePoints);
        }

        if (!completedRouteRef.current) {
            completedRouteRef.current = L.polyline(routePointsUntilProgress(routePoints, progress), {
                color: '#bfeeff',
                weight: 5,
                opacity: 0.95,
                lineCap: 'round',
            }).addTo(map);
        }

        if (!originMarkerRef.current) {
            originMarkerRef.current = L.marker(routePoints[0], {
                icon: createAirportIcon('origin', markerScale),
                keyboard: false,
            })
                .addTo(map)
                .bindTooltip(buildAirportTooltip(originAirport, 'origin'), {
                    direction: 'top',
                    offset: [0, -12],
                    className: 'simulation-map-tooltip',
                });
        } else {
            originMarkerRef.current.setLatLng(routePoints[0]);
            originMarkerRef.current.setIcon(createAirportIcon('origin', markerScale));
            originMarkerRef.current.setTooltipContent(buildAirportTooltip(originAirport, 'origin'));
        }

        if (!destinationMarkerRef.current) {
            destinationMarkerRef.current = L.marker(routePoints[routePoints.length - 1], {
                icon: createAirportIcon('destination', markerScale),
                keyboard: false,
            })
                .addTo(map)
                .bindTooltip(buildAirportTooltip(destinationAirport, 'destination'), {
                    direction: 'top',
                    offset: [0, -12],
                    className: 'simulation-map-tooltip',
                });
        } else {
            destinationMarkerRef.current.setLatLng(routePoints[routePoints.length - 1]);
            destinationMarkerRef.current.setIcon(
                createAirportIcon('destination', markerScale)
            );
            destinationMarkerRef.current.setTooltipContent(
                buildAirportTooltip(destinationAirport, 'destination')
            );
        }
    }, [
        originAirport,
        destinationAirport,
        routePoints,
        markerScale,
        progress,
    ]);

    useEffect(() => {
        const map = mapRef.current;

        if (!map || !originAirport || !destinationAirport || routePoints.length === 0) {
            return;
        }

        const planePoint = routePointAtProgress(routePoints, progress);
        const completedPoints = routePointsUntilProgress(routePoints, progress);
        const scaledIndex = clamp(progress, 0, 1) * (routePoints.length - 1);
        const previousIndex = Math.max(Math.floor(scaledIndex) - 1, 0);
        const nextIndex = Math.min(Math.ceil(scaledIndex) + 1, routePoints.length - 1);
        const angle = computeBearing(routePoints[previousIndex], routePoints[nextIndex]);

        if (completedRouteRef.current) {
            completedRouteRef.current.setLatLngs(completedPoints);
        }

        if (!planePoint) {
            return;
        }

        if (!planeMarkerRef.current) {
            planeMarkerRef.current = L.marker(planePoint, {
                icon: createPlaneIcon(angle, markerScale),
                interactive: false,
                zIndexOffset: 900,
                keyboard: false,
            }).addTo(map);
        } else {
            planeMarkerRef.current.setLatLng(planePoint);
            planeMarkerRef.current.setIcon(createPlaneIcon(angle, markerScale));
        }
    }, [progress, routePoints, markerScale, originAirport, destinationAirport]);

    function handleZoomChange(delta) {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        if (viewMode !== VIEW_MODE.FOCUSED) {
            setViewMode(VIEW_MODE.FOCUSED);
        }

        const nextZoom = clamp(map.getZoom() + delta, MIN_ZOOM, MAX_ZOOM);
        map.setZoom(nextZoom);
        setZoomLevel(Math.round(nextZoom));
    }

    if (!originAirport || !destinationAirport) {
        return (
            <div className="simulation-board simulation-board-empty">
                <p>Selecciona origen y destino para visualizar el recorrido.</p>
            </div>
        );
    }

    const phaseLabel =
        phase === 'running'
            ? 'EN RUTA'
            : phase === 'completed'
              ? 'COMPLETADO'
              : 'LISTO';

    return (
        <div className="simulation-map-frame">
            <div className="simulation-board">
                <div ref={mapContainerRef} className="simulation-board__map-canvas" />
                <div className="simulation-board__map-overlay" />

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
                        disabled={zoomLevel <= MIN_ZOOM}
                    >
                        -
                    </button>
                    <button
                        type="button"
                        className="simulation-board__control simulation-board__control-mini"
                        onClick={() => handleZoomChange(1)}
                        disabled={zoomLevel >= MAX_ZOOM}
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="simulation-board__hud simulation-board__hud-external">
                <div className="simulation-board__hud-copy">
                    <span className="simulation-board__eyebrow">Global Route Monitor</span>
                    <strong>
                        {originAirport.ciudad}, {originAirport.pais} a {destinationAirport.ciudad},{' '}
                        {destinationAirport.pais}
                    </strong>
                    <small>
                        Mapa real con Leaflet y OpenStreetMap. La ruta aerea se calcula con las
                        coordenadas de los aeropuertos, sin usar una API externa de trafico.
                        Puedes hacer zoom con los botones, la rueda del mouse o con gestos tactiles.
                    </small>
                    {tileError ? (
                        <small className="simulation-board__map-note">
                            El mapa base no pudo cargar por completo. La ruta sigue calculandose con
                            las coordenadas disponibles.
                        </small>
                    ) : null}
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
