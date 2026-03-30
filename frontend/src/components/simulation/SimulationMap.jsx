import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import {
    MapContainer,
    Marker,
    Polyline,
    TileLayer,
    Tooltip,
    useMap,
} from 'react-leaflet';

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

function FitRouteBounds({ originPosition, destinationPosition }) {
    const map = useMap();

    useEffect(() => {
        if (!originPosition || !destinationPosition) {
            return;
        }

        const bounds = L.latLngBounds([originPosition, destinationPosition]);

        map.fitBounds(bounds.pad(0.45), {
            animate: true,
            duration: 1.1,
            padding: [32, 32],
        });
    }, [map, originPosition, destinationPosition]);

    return null;
}

export default function SimulationMap({
    originAirport,
    destinationAirport,
    progress,
}) {
    if (!originAirport || !destinationAirport) {
        return (
            <div className="simulation-board simulation-board-empty">
                <p>Selecciona origen y destino para visualizar el recorrido.</p>
            </div>
        );
    }

    const originPosition = getPosition(originAirport);
    const destinationPosition = getPosition(destinationAirport);
    const planePosition = interpolatePosition(originAirport, destinationAirport, progress);
    const planeAngle = calculateAngle(originAirport, destinationAirport);

    const originIcon = useMemo(
        () => buildAirportIcon('origin', originAirport.codigo_iata),
        [originAirport.codigo_iata]
    );

    const destinationIcon = useMemo(
        () => buildAirportIcon('destination', destinationAirport.codigo_iata),
        [destinationAirport.codigo_iata]
    );

    const planeIcon = useMemo(() => buildPlaneIcon(planeAngle), [planeAngle]);

    return (
        <div className="simulation-board">
            <div className="simulation-board__meta">
                <span>{originAirport.codigo_iata}</span>
                <span>{destinationAirport.codigo_iata}</span>
            </div>

            <MapContainer
                className="simulation-board__map"
                center={originPosition}
                zoom={4}
                scrollWheelZoom={true}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitRouteBounds
                    originPosition={originPosition}
                    destinationPosition={destinationPosition}
                />

                <Polyline
                    positions={[originPosition, destinationPosition]}
                    pathOptions={{
                        color: '#0ea5e9',
                        weight: 4,
                        opacity: 0.65,
                        dashArray: '10 12',
                    }}
                />

                <Polyline
                    positions={[originPosition, planePosition]}
                    pathOptions={{
                        color: '#f8fafc',
                        weight: 5,
                        opacity: 0.92,
                    }}
                />

                <Marker position={originPosition} icon={originIcon}>
                    <Tooltip direction="top" offset={[0, -14]} className="simulation-tooltip">
                        {originAirport.nombre} · {originAirport.ciudad}, {originAirport.pais}
                    </Tooltip>
                </Marker>

                <Marker position={destinationPosition} icon={destinationIcon}>
                    <Tooltip direction="top" offset={[0, -14]} className="simulation-tooltip">
                        {destinationAirport.nombre} · {destinationAirport.ciudad}, {destinationAirport.pais}
                    </Tooltip>
                </Marker>

                <Marker position={planePosition} icon={planeIcon}>
                    <Tooltip direction="top" offset={[0, -10]} className="simulation-tooltip">
                        Vuelo en ruta · {Math.round(progress * 100)}%
                    </Tooltip>
                </Marker>
            </MapContainer>
        </div>
    );
}
