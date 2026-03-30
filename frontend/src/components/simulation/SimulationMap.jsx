const BOARD_WIDTH = 1120;
const BOARD_HEIGHT = 560;

const CONTINENTS = [
    {
        id: 'north-america',
        points: [
            [80, 110], [150, 75], [240, 95], [290, 130], [320, 175], [300, 220], [250, 250],
            [215, 300], [190, 350], [150, 365], [122, 320], [102, 265], [82, 200],
        ],
    },
    {
        id: 'south-america',
        points: [
            [285, 300], [330, 320], [355, 365], [372, 430], [352, 505], [324, 540], [292, 520],
            [275, 470], [262, 410], [258, 350],
        ],
    },
    {
        id: 'europe',
        points: [
            [540, 105], [590, 90], [640, 108], [658, 138], [640, 168], [598, 175], [555, 152],
        ],
    },
    {
        id: 'africa',
        points: [
            [572, 188], [625, 198], [668, 245], [682, 330], [662, 422], [625, 468], [590, 445],
            [560, 380], [548, 302], [552, 230],
        ],
    },
    {
        id: 'asia',
        points: [
            [645, 120], [730, 90], [860, 105], [965, 155], [1018, 220], [992, 268], [920, 288],
            [832, 272], [770, 252], [725, 212], [680, 188], [640, 155],
        ],
    },
    {
        id: 'australia',
        points: [
            [875, 398], [930, 388], [985, 408], [1018, 445], [1000, 490], [940, 505], [890, 488],
            [858, 445],
        ],
    },
    {
        id: 'greenland',
        points: [[285, 55], [330, 32], [392, 42], [410, 86], [370, 116], [316, 106]],
    },
];

const REGION_LABELS = [
    { id: 'north-america', label: 'NORTEAMERICA', x: 190, y: 122 },
    { id: 'south-america', label: 'SUDAMERICA', x: 304, y: 370 },
    { id: 'europe', label: 'EUROPA', x: 590, y: 94 },
    { id: 'africa', label: 'AFRICA', x: 620, y: 260 },
    { id: 'asia', label: 'ASIA', x: 828, y: 146 },
    { id: 'oceania', label: 'OCEANIA', x: 940, y: 420 },
];

const NETWORK_ARCS = [
    { id: 'arc-1', start: { x: 150, y: 180 }, end: { x: 562, y: 148 }, lift: -64 },
    { id: 'arc-2', start: { x: 305, y: 345 }, end: { x: 620, y: 266 }, lift: -58 },
    { id: 'arc-3', start: { x: 640, y: 156 }, end: { x: 902, y: 182 }, lift: -52 },
    { id: 'arc-4', start: { x: 648, y: 274 }, end: { x: 930, y: 422 }, lift: 48 },
];

const DECORATION_ORBS = [
    { id: 'orb-1', cx: 168, cy: 94, r: 110, className: 'simulation-board__orb simulation-board__orb-primary' },
    { id: 'orb-2', cx: 942, cy: 112, r: 130, className: 'simulation-board__orb simulation-board__orb-secondary' },
    { id: 'orb-3', cx: 836, cy: 464, r: 150, className: 'simulation-board__orb simulation-board__orb-muted' },
];

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function projectPoint(airport) {
    const longitude = Number(airport.longitud);
    const latitude = Number(airport.latitud);

    return {
        x: ((longitude + 180) / 360) * BOARD_WIDTH,
        y: ((90 - latitude) / 180) * BOARD_HEIGHT,
    };
}

function createCurve(start, end) {
    const midpointX = (start.x + end.x) / 2;
    const midpointY = (start.y + end.y) / 2;
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const normalizedX = distance === 0 ? 0 : deltaX / distance;
    const normalizedY = distance === 0 ? 0 : deltaY / distance;
    const perpendicularX = -normalizedY;
    const perpendicularY = normalizedX;
    const curveStrength = Math.min(Math.max(distance * 0.12, 26), 92);

    return {
        controlX: midpointX + perpendicularX * curveStrength,
        controlY: midpointY + perpendicularY * curveStrength,
    };
}

function bezierPoint(start, control, end, t) {
    const oneMinusT = 1 - t;

    return {
        x:
            oneMinusT * oneMinusT * start.x +
            2 * oneMinusT * t * control.controlX +
            t * t * end.x,
        y:
            oneMinusT * oneMinusT * start.y +
            2 * oneMinusT * t * control.controlY +
            t * t * end.y,
    };
}

function bezierAngle(start, control, end, t) {
    const tangentX =
        2 * (1 - t) * (control.controlX - start.x) + 2 * t * (end.x - control.controlX);
    const tangentY =
        2 * (1 - t) * (control.controlY - start.y) + 2 * t * (end.y - control.controlY);

    return (Math.atan2(tangentY, tangentX) * 180) / Math.PI;
}

function polygonPath(points) {
    return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ') + ' Z';
}

function curvedPathFromPoints(start, end, lift) {
    const midpointX = (start.x + end.x) / 2;
    const midpointY = (start.y + end.y) / 2;

    return `M ${start.x} ${start.y} Q ${midpointX} ${midpointY + lift} ${end.x} ${end.y}`;
}

export default function SimulationMap({
    originAirport,
    destinationAirport,
    progress,
    routeDistance,
    speedLabel,
    phase,
    progressPercent,
}) {
    if (!originAirport || !destinationAirport) {
        return (
            <div className="simulation-board simulation-board-empty">
                <p>Selecciona origen y destino para visualizar el recorrido.</p>
            </div>
        );
    }

    const start = projectPoint(originAirport);
    const end = projectPoint(destinationAirport);
    const curve = createCurve(start, end);
    const current = bezierPoint(start, curve, end, progress);
    const angle = bezierAngle(start, curve, end, Math.max(progress, 0.02));
    const fullRoutePath = `M ${start.x} ${start.y} Q ${curve.controlX} ${curve.controlY} ${end.x} ${end.y}`;
    const completedSegments = Array.from({ length: 28 }, (_, index) => {
        const segmentProgress = (progress * index) / 27;
        return bezierPoint(start, curve, end, segmentProgress);
    });
    const completedRoutePath = completedSegments
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ');
    const originLabelX = clamp(start.x + 16, 18, BOARD_WIDTH - 206);
    const originLabelY = clamp(start.y - 56, 18, BOARD_HEIGHT - 62);
    const destinationLabelX = clamp(end.x - 206, 18, BOARD_WIDTH - 206);
    const destinationLabelY = clamp(end.y - 56, 18, BOARD_HEIGHT - 62);
    const phaseLabel =
        phase === 'running'
            ? 'EN RUTA'
            : phase === 'completed'
              ? 'COMPLETADO'
              : 'LISTO';

    return (
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

            <svg
                className="simulation-board__svg"
                viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
                role="img"
                aria-label={`Recorrido entre ${originAirport.codigo_iata} y ${destinationAirport.codigo_iata}`}
            >
                <defs>
                    <linearGradient id="simulationOceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0f2742" />
                        <stop offset="55%" stopColor="#12385a" />
                        <stop offset="100%" stopColor="#0b1b30" />
                    </linearGradient>
                    <linearGradient id="simulationContinentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c8d5c6" />
                        <stop offset="100%" stopColor="#9fb59c" />
                    </linearGradient>
                    <linearGradient id="simulationRouteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#f8fafc" />
                    </linearGradient>
                    <linearGradient id="simulationRouteHaloGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(14,165,233,0.08)" />
                        <stop offset="100%" stopColor="rgba(248,250,252,0.12)" />
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

                {DECORATION_ORBS.map((orb) => (
                    <circle key={orb.id} cx={orb.cx} cy={orb.cy} r={orb.r} className={orb.className} />
                ))}

                {[0.2, 0.4, 0.6, 0.8].map((fraction) => (
                    <line
                        key={`vertical-${fraction}`}
                        x1={BOARD_WIDTH * fraction}
                        x2={BOARD_WIDTH * fraction}
                        y1="0"
                        y2={BOARD_HEIGHT}
                        className="simulation-board__grid"
                    />
                ))}

                {[0.25, 0.5, 0.75].map((fraction) => (
                    <line
                        key={`horizontal-${fraction}`}
                        x1="0"
                        x2={BOARD_WIDTH}
                        y1={BOARD_HEIGHT * fraction}
                        y2={BOARD_HEIGHT * fraction}
                        className="simulation-board__grid"
                    />
                ))}

                {NETWORK_ARCS.map((arc) => (
                    <path
                        key={arc.id}
                        d={curvedPathFromPoints(arc.start, arc.end, arc.lift)}
                        className="simulation-board__network"
                    />
                ))}

                {CONTINENTS.map((continent) => (
                    <path
                        key={continent.id}
                        d={polygonPath(continent.points)}
                        className="simulation-board__continent"
                    />
                ))}

                {REGION_LABELS.map((region) => (
                    <text
                        key={region.id}
                        x={region.x}
                        y={region.y}
                        className="simulation-board__region-label"
                    >
                        {region.label}
                    </text>
                ))}

                <path
                    d={fullRoutePath}
                    className="simulation-board__route-halo"
                />

                <path
                    d={fullRoutePath}
                    className="simulation-board__route"
                />

                <path
                    d={completedRoutePath}
                    className="simulation-board__route simulation-board__route-completed"
                />

                <circle
                    cx={start.x}
                    cy={start.y}
                    r="8"
                    className="simulation-board__marker simulation-board__marker-origin"
                />
                <circle
                    cx={start.x}
                    cy={start.y}
                    r="18"
                    className="simulation-board__pulse simulation-board__pulse-origin"
                />
                <circle
                    cx={end.x}
                    cy={end.y}
                    r="8"
                    className="simulation-board__marker simulation-board__marker-destination"
                />
                <circle
                    cx={end.x}
                    cy={end.y}
                    r="18"
                    className="simulation-board__pulse simulation-board__pulse-destination"
                />

                <circle
                    cx={current.x}
                    cy={current.y}
                    r="14"
                    className="simulation-board__marker simulation-board__marker-plane-glow"
                />

                <g transform={`translate(${current.x} ${current.y}) rotate(${angle})`}>
                    <circle r="12" className="simulation-board__plane-core" />
                    <text
                        className="simulation-board__plane-icon"
                        textAnchor="middle"
                        dominantBaseline="central"
                    >
                        ✈
                    </text>
                </g>

                <g transform={`translate(${originLabelX} ${originLabelY})`}>
                    <rect width="190" height="46" rx="14" className="simulation-board__label" />
                    <circle cx="16" cy="15" r="4" className="simulation-board__label-dot simulation-board__label-dot-origin" />
                    <text x="14" y="18" className="simulation-board__label-code">
                        {originAirport.codigo_iata}
                    </text>
                    <text x="14" y="33" className="simulation-board__label-city">
                        {originAirport.ciudad}, {originAirport.pais}
                    </text>
                </g>

                <g transform={`translate(${destinationLabelX} ${destinationLabelY})`}>
                    <rect width="190" height="46" rx="14" className="simulation-board__label" />
                    <circle cx="16" cy="15" r="4" className="simulation-board__label-dot simulation-board__label-dot-destination" />
                    <text x="14" y="18" className="simulation-board__label-code">
                        {destinationAirport.codigo_iata}
                    </text>
                    <text x="14" y="33" className="simulation-board__label-city">
                        {destinationAirport.ciudad}, {destinationAirport.pais}
                    </text>
                </g>
            </svg>

            <div className="simulation-board__hud">
                <div className="simulation-board__hud-copy">
                    <span className="simulation-board__eyebrow">Global Route Monitor</span>
                    <strong>
                        {originAirport.ciudad}, {originAirport.pais} a {destinationAirport.ciudad}, {destinationAirport.pais}
                    </strong>
                    <small>
                        Recorrido acelerado para demostracion academica. El trayecto se mantiene completo y visible durante toda la simulacion.
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
