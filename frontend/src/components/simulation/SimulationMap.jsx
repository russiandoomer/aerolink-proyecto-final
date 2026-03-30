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

function smoothClosedPath(points) {
    if (points.length < 3) {
        return polygonPath(points);
    }

    const path = [];

    for (let index = 0; index < points.length; index += 1) {
        const current = points[index];
        const next = points[(index + 1) % points.length];
        const midpointX = (current[0] + next[0]) / 2;
        const midpointY = (current[1] + next[1]) / 2;

        if (index === 0) {
            path.push(`M ${midpointX} ${midpointY}`);
        }

        path.push(`Q ${current[0]} ${current[1]} ${midpointX} ${midpointY}`);
    }

    return `${path.join(' ')} Z`;
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
                        <stop offset="0%" stopColor="#07111d" />
                        <stop offset="55%" stopColor="#0b1d30" />
                        <stop offset="100%" stopColor="#08111b" />
                    </linearGradient>
                    <linearGradient id="simulationContinentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c9d4dd" />
                        <stop offset="100%" stopColor="#a5b4c1" />
                    </linearGradient>
                    <linearGradient id="simulationRouteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#67e8f9" />
                        <stop offset="50%" stopColor="#38bdf8" />
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

                {[0.16, 0.33, 0.5, 0.67, 0.84].map((fraction) => (
                    <line
                        key={`vertical-${fraction}`}
                        x1={BOARD_WIDTH * fraction}
                        x2={BOARD_WIDTH * fraction}
                        y1="0"
                        y2={BOARD_HEIGHT}
                        className="simulation-board__grid"
                    />
                ))}

                {[0.22, 0.5, 0.78].map((fraction) => (
                    <line
                        key={`horizontal-${fraction}`}
                        x1="0"
                        x2={BOARD_WIDTH}
                        y1={BOARD_HEIGHT * fraction}
                        y2={BOARD_HEIGHT * fraction}
                        className="simulation-board__grid"
                    />
                ))}

                {CONTINENTS.map((continent) => (
                    <path
                        key={continent.id}
                        d={smoothClosedPath(continent.points)}
                        className="simulation-board__continent"
                    />
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
                        Simulacion acelerada de la ruta. El recorrido permanece visible y el avance se sigue en una sola pantalla.
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
