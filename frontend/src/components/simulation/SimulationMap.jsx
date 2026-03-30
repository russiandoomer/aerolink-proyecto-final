import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';

function getPosition(airport) {
    return [Number(airport.latitud), Number(airport.longitud)];
}

function interpolatePosition(originAirport, destinationAirport, progress) {
    const originLat = Number(originAirport.latitud);
    const originLng = Number(originAirport.longitud);
    const destinationLat = Number(destinationAirport.latitud);
    const destinationLng = Number(destinationAirport.longitud);

    return [
        originLat + (destinationLat - originLat) * progress,
        originLng + (destinationLng - originLng) * progress,
    ];
}

function calculateAngle(originAirport, destinationAirport) {
    const originLat = Number(originAirport.latitud);
    const originLng = Number(originAirport.longitud);
    const destinationLat = Number(destinationAirport.latitud);
    const destinationLng = Number(destinationAirport.longitud);

    return (
        (Math.atan2(destinationLat - originLat, destinationLng - originLng) * 180) / Math.PI
    );
}

function buildAirportIcon(type, code) {
    return L.divIcon({
        className: 'simulation-div-icon',
        html: `
            <div class="simulation-marker simulation-marker--${type}">
                <span class="simulation-marker__dot"></span>
                <span class="simulation-marker__code">${code}</span>
            </div>
        `,
        iconSize: [84, 30],
        iconAnchor: type === 'origin' ? [14, 15] : [70, 15],
    });
}

function buildPlaneIcon(angle) {
    return L.divIcon({
        className: 'simulation-div-icon',
        html: `
            <div class="simulation-plane-marker">
                <div class="simulation-plane-marker__glow"></div>
                <div class="simulation-plane-marker__body" style="transform: rotate(${angle}deg);">
                    <span class="simulation-plane-marker__icon">✈</span>
                </div>
            </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
    });
}

export default function SimulationMap({
    originAirport,
    destinationAirport,
    progress,
}) {
    const mapElementRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const overlayLayerRef = useRef(null);

    const originPosition = useMemo(
        () => (originAirport ? getPosition(originAirport) : null),
        [originAirport]
    );

    const destinationPosition = useMemo(
        () => (destinationAirport ? getPosition(destinationAirport) : null),
        [destinationAirport]
    );

    const planePosition = useMemo(
        () =>
            originAirport && destinationAirport
                ? interpolatePosition(originAirport, destinationAirport, progress)
                : null,
        [originAirport, destinationAirport, progress]
    );

    const planeAngle = useMemo(
        () =>
            originAirport && destinationAirport
                ? calculateAngle(originAirport, destinationAirport)
                : 0,
        [originAirport, destinationAirport]
    );

    useEffect(() => {
        if (!mapElementRef.current || mapInstanceRef.current) {
            return;
        }

        const map = L.map(mapElementRef.current, {
            zoomControl: true,
            scrollWheelZoom: true,
            worldCopyJump: true,
        }).setView([-16.5, -64.9], 4);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
            maxZoom: 18,
        }).addTo(map);

        overlayLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;

        const resizeMap = () => map.invalidateSize();
        const resizeObserver =
            typeof ResizeObserver !== 'undefined'
                ? new ResizeObserver(() => resizeMap())
                : null;

        if (resizeObserver && mapElementRef.current) {
            resizeObserver.observe(mapElementRef.current);
        }

        const timers = [
            setTimeout(resizeMap, 80),
            setTimeout(resizeMap, 240),
            setTimeout(resizeMap, 520),
        ];

        window.addEventListener('resize', resizeMap);

        return () => {
            timers.forEach((timer) => clearTimeout(timer));
            window.removeEventListener('resize', resizeMap);
            resizeObserver?.disconnect();
            map.remove();
            mapInstanceRef.current = null;
            overlayLayerRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapInstanceRef.current;
        const overlayLayer = overlayLayerRef.current;

        if (!map || !overlayLayer || !originPosition || !destinationPosition || !planePosition) {
            return;
        }

        overlayLayer.clearLayers();

        const fullRoute = L.polyline([originPosition, destinationPosition], {
            color: '#0ea5e9',
            weight: 4,
            opacity: 0.68,
            dashArray: '10 12',
        });

        const completedRoute = L.polyline([originPosition, planePosition], {
            color: '#f8fafc',
            weight: 5,
            opacity: 0.94,
        });

        const originMarker = L.marker(originPosition, {
            icon: buildAirportIcon('origin', originAirport.codigo_iata),
        }).bindTooltip(
            `${originAirport.nombre} · ${originAirport.ciudad}, ${originAirport.pais}`,
            {
                direction: 'top',
                offset: [0, -14],
                className: 'simulation-tooltip',
            }
        );

        const destinationMarker = L.marker(destinationPosition, {
            icon: buildAirportIcon('destination', destinationAirport.codigo_iata),
        }).bindTooltip(
            `${destinationAirport.nombre} · ${destinationAirport.ciudad}, ${destinationAirport.pais}`,
            {
                direction: 'top',
                offset: [0, -14],
                className: 'simulation-tooltip',
            }
        );

        const planeMarker = L.marker(planePosition, {
            icon: buildPlaneIcon(planeAngle),
        }).bindTooltip(`Vuelo en ruta · ${Math.round(progress * 100)}%`, {
            direction: 'top',
            offset: [0, -10],
            className: 'simulation-tooltip',
        });

        overlayLayer.addLayer(fullRoute);
        overlayLayer.addLayer(completedRoute);
        overlayLayer.addLayer(originMarker);
        overlayLayer.addLayer(destinationMarker);
        overlayLayer.addLayer(planeMarker);

        const bounds = L.latLngBounds([originPosition, destinationPosition]);
        map.fitBounds(bounds.pad(0.45), {
            animate: true,
            duration: 1.1,
            padding: [32, 32],
        });

        const timers = [
            setTimeout(() => map.invalidateSize(), 40),
            setTimeout(() => map.invalidateSize(), 180),
        ];

        return () => {
            timers.forEach((timer) => clearTimeout(timer));
        };
    }, [
        originAirport,
        destinationAirport,
        originPosition,
        destinationPosition,
        planePosition,
        planeAngle,
        progress,
    ]);

    if (!originAirport || !destinationAirport) {
        return (
            <div className="simulation-board simulation-board-empty">
                <p>Selecciona origen y destino para visualizar el recorrido.</p>
            </div>
        );
    }

    return (
        <div className="simulation-board">
            <div className="simulation-board__meta">
                <span>{originAirport.codigo_iata}</span>
                <span>{destinationAirport.codigo_iata}</span>
            </div>

            <div
                ref={mapElementRef}
                className="simulation-board__map"
                role="img"
                aria-label={`Recorrido entre ${originAirport.codigo_iata} y ${destinationAirport.codigo_iata}`}
            />
        </div>
    );
}
