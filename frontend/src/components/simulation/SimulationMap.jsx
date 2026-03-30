const BOARD_WIDTH = 1000;
const BOARD_HEIGHT = 520;

function projectPoint(airport) {
    const longitude = Number(airport.longitud);
    const latitude = Number(airport.latitud);

    return {
        x: ((longitude + 180) / 360) * BOARD_WIDTH,
        y: ((90 - latitude) / 180) * BOARD_HEIGHT,
    };
}

function interpolatePoint(start, end, progress) {
    return {
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress,
    };
}

function calculateAngle(start, end) {
    return (
        (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI
    );
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

    const start = projectPoint(originAirport);
    const end = projectPoint(destinationAirport);
    const current = interpolatePoint(start, end, progress);
    const angle = calculateAngle(start, end);
    const meridians = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];
    const parallels = [-60, -30, 0, 30, 60];

    return (
        <div className="simulation-board">
            <div className="simulation-board__meta">
                <span>{originAirport.codigo_iata}</span>
                <span>{destinationAirport.codigo_iata}</span>
            </div>

            <svg
                className="simulation-board__svg"
                viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
                role="img"
                aria-label={`Recorrido entre ${originAirport.codigo_iata} y ${destinationAirport.codigo_iata}`}
            >
                <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0ea5e9" />
                        <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                    <linearGradient id="completedRouteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#f8fafc" />
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

                {meridians.map((longitude) => {
                    const x = ((longitude + 180) / 360) * BOARD_WIDTH;

                    return (
                        <line
                            key={`meridian-${longitude}`}
                            x1={x}
                            x2={x}
                            y1="0"
                            y2={BOARD_HEIGHT}
                            className="simulation-board__grid"
                        />
                    );
                })}

                {parallels.map((latitude) => {
                    const y = ((90 - latitude) / 180) * BOARD_HEIGHT;

                    return (
                        <line
                            key={`parallel-${latitude}`}
                            x1="0"
                            x2={BOARD_WIDTH}
                            y1={y}
                            y2={y}
                            className="simulation-board__grid"
                        />
                    );
                })}

                <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    className="simulation-board__route"
                />

                <line
                    x1={start.x}
                    y1={start.y}
                    x2={current.x}
                    y2={current.y}
                    className="simulation-board__route simulation-board__route-completed"
                />

                <circle
                    cx={start.x}
                    cy={start.y}
                    r="9"
                    className="simulation-board__marker simulation-board__marker-origin"
                />
                <circle
                    cx={end.x}
                    cy={end.y}
                    r="9"
                    className="simulation-board__marker simulation-board__marker-destination"
                />

                <circle
                    cx={current.x}
                    cy={current.y}
                    r="13"
                    className="simulation-board__marker simulation-board__marker-plane-glow"
                />

                <g transform={`translate(${current.x} ${current.y}) rotate(${angle})`}>
                    <circle r="11" className="simulation-board__plane-core" />
                    <text
                        className="simulation-board__plane-icon"
                        textAnchor="middle"
                        dominantBaseline="central"
                    >
                        ✈
                    </text>
                </g>

                <g transform={`translate(${start.x + 16} ${start.y - 16})`}>
                    <rect width="190" height="48" rx="16" className="simulation-board__label" />
                    <text x="16" y="20" className="simulation-board__label-code">
                        {originAirport.codigo_iata}
                    </text>
                    <text x="16" y="35" className="simulation-board__label-city">
                        {originAirport.ciudad}, {originAirport.pais}
                    </text>
                </g>

                <g transform={`translate(${end.x - 206} ${end.y - 16})`}>
                    <rect width="190" height="48" rx="16" className="simulation-board__label" />
                    <text x="16" y="20" className="simulation-board__label-code">
                        {destinationAirport.codigo_iata}
                    </text>
                    <text x="16" y="35" className="simulation-board__label-city">
                        {destinationAirport.ciudad}, {destinationAirport.pais}
                    </text>
                </g>
            </svg>
        </div>
    );
}
