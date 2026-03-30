import { useEffect, useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { fetchDashboardSummary } from '../api/resources';
import EmptyState from '../components/common/EmptyState';
import FadeInBlock from '../components/common/FadeInBlock';
import LoadingState from '../components/common/LoadingState';
import MetricCard from '../components/common/MetricCard';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import ChartPanel from '../components/dashboard/ChartPanel';
import DashboardHero from '../components/dashboard/DashboardHero';
import { formatDateTime } from '../utils/format';

const TONE_COLORS = {
    blue: '#2563eb',
    cyan: '#0891b2',
    indigo: '#4f46e5',
    amber: '#d97706',
    emerald: '#059669',
    red: '#dc2626',
    slate: '#64748b',
};

function formatLabel(value) {
    if (!value) {
        return '--';
    }

    return value.charAt(0).toUpperCase() + value.slice(1).replaceAll('_', ' ');
}

function DashboardTooltip({ active, payload, label }) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="chart-tooltip">
            {label ? <strong>{label}</strong> : null}
            {payload.map((entry) => (
                <div key={`${entry.name}-${entry.dataKey}`} className="chart-tooltip-row">
                    <span>{entry.name}</span>
                    <strong>{entry.value}</strong>
                </div>
            ))}
        </div>
    );
}

export default function DashboardPage() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function loadSummary() {
            try {
                const response = await fetchDashboardSummary();

                if (active) {
                    setSummary(response);
                }
            } catch (error) {
                if (active) {
                    setSummary(null);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadSummary();

        return () => {
            active = false;
        };
    }, []);

    const chartData = useMemo(() => {
        if (!summary) {
            return {
                flightStates: [],
                bookingClasses: [],
                occupancy: [],
                routes: [],
                delayedCount: 0,
                completionRate: 0,
            };
        }

        const flightStates = summary.vuelos_por_estado.map((item) => ({
            ...item,
            value: item.vuelos_count,
            fill: TONE_COLORS[item.color] ?? TONE_COLORS.slate,
        }));

        const bookingClasses = summary.reservas_por_clase.map((item) => ({
            clase: formatLabel(item.clase),
            total: Number(item.total),
        }));

        const occupancy = summary.ocupacion_vuelos.map((item) => ({
            vuelo: item.codigo_vuelo,
            ocupacion: Number(item.ocupacion_porcentaje),
            reservas: Number(item.reservas_activas),
            capacidad: Number(item.capacidad),
        }));

        const routes = summary.rutas_mas_usadas.map((item) => ({
            ruta: `${item.origen}-${item.destino}`,
            total: Number(item.total_vuelos),
        }));

        const delayedCount =
            summary.vuelos_por_estado.find((item) => item.codigo === 'demorado')
                ?.vuelos_count ?? 0;

        const landedCount =
            summary.vuelos_por_estado.find((item) => item.codigo === 'aterrizado')
                ?.vuelos_count ?? 0;

        const completionRate =
            summary.totales.vuelos > 0
                ? Math.round((landedCount / summary.totales.vuelos) * 100)
                : 0;

        return {
            flightStates,
            bookingClasses,
            occupancy,
            routes,
            delayedCount,
            completionRate,
        };
    }, [summary]);

    if (loading) {
        return <LoadingState label="Cargando resumen operativo..." />;
    }

    if (!summary) {
        return (
            <EmptyState
                title="No fue posible cargar el dashboard."
                description="Verifica que la API Laravel este activa y respondiendo."
            />
        );
    }

    const metrics = [
        {
            label: 'Vuelos registrados',
            value: summary.totales.vuelos,
            detail: 'Operacion general del sistema',
        },
        {
            label: 'Reservas activas',
            value: summary.totales.reservas,
            detail: 'Control comercial actual',
        },
        {
            label: 'Pasajeros',
            value: summary.totales.pasajeros,
            detail: 'Base de clientes cargada',
        },
        {
            label: 'Flota disponible',
            value: summary.totales.flota_activa,
            detail: 'Aviones en estado activo',
        },
    ];

    const nextFlight = summary.proximos_vuelos[0] ?? null;

    return (
        <section className="dashboard-page">
            <PageHeader
                title="Dashboard principal"
                description="Monitorea el movimiento de vuelos, reservas y la salud operativa de la flota desde un panel unico."
            />

            <DashboardHero
                totals={summary.totales}
                nextFlight={nextFlight}
                delayedCount={chartData.delayedCount}
                completionRate={chartData.completionRate}
            />

            <div className="metric-grid">
                {metrics.map((metric) => (
                    <MetricCard
                        key={metric.label}
                        label={metric.label}
                        value={metric.value}
                        detail={metric.detail}
                    />
                ))}
            </div>

            <div className="dashboard-grid">
                <ChartPanel
                    title="Distribucion por estado"
                    description="Lectura inmediata de la operacion actual"
                    delay={0.08}
                >
                    <div className="chart-layout">
                        <div className="chart-box chart-box-pie">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={chartData.flightStates}
                                        dataKey="value"
                                        nameKey="nombre"
                                        innerRadius={58}
                                        outerRadius={92}
                                        paddingAngle={4}
                                    >
                                        {chartData.flightStates.map((entry) => (
                                            <Cell key={entry.id} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<DashboardTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="legend-list">
                            {chartData.flightStates.map((item) => (
                                <div key={item.id} className="legend-row">
                                    <div className="legend-label">
                                        <span
                                            className="legend-dot"
                                            style={{ backgroundColor: item.fill }}
                                        />
                                        <span>{item.nombre}</span>
                                    </div>
                                    <strong>{item.value}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartPanel>

                <ChartPanel
                    title="Reservas por clase"
                    description="Composicion comercial del sistema"
                    delay={0.12}
                >
                    <div className="chart-box">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData.bookingClasses}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="clase" tickLine={false} axisLine={false} />
                                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                                <Tooltip content={<DashboardTooltip />} />
                                <Bar
                                    dataKey="total"
                                    fill={TONE_COLORS.cyan}
                                    radius={[10, 10, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartPanel>

                <ChartPanel
                    title="Ocupacion por vuelo"
                    description="Asientos comprometidos frente a la capacidad total"
                    delay={0.16}
                    className="panel-card-wide"
                >
                    <div className="chart-box chart-box-wide">
                        <ResponsiveContainer width="100%" height={290}>
                            <AreaChart data={chartData.occupancy}>
                                <defs>
                                    <linearGradient
                                        id="occupancyGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor={TONE_COLORS.indigo}
                                            stopOpacity={0.35}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={TONE_COLORS.indigo}
                                            stopOpacity={0.04}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="vuelo" tickLine={false} axisLine={false} />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    unit="%"
                                    domain={[0, 100]}
                                />
                                <Tooltip content={<DashboardTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="ocupacion"
                                    stroke={TONE_COLORS.indigo}
                                    strokeWidth={3}
                                    fill="url(#occupancyGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ChartPanel>

                <ChartPanel
                    title="Rutas con mayor rotacion"
                    description="Trayectos que concentran la operacion"
                    delay={0.2}
                >
                    <div className="chart-box">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData.routes} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                                <YAxis
                                    type="category"
                                    dataKey="ruta"
                                    tickLine={false}
                                    axisLine={false}
                                    width={72}
                                />
                                <Tooltip content={<DashboardTooltip />} />
                                <Bar
                                    dataKey="total"
                                    fill={TONE_COLORS.emerald}
                                    radius={[0, 10, 10, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartPanel>

                <FadeInBlock className="panel-card" delay={0.24}>
                    <div className="section-title">
                        <div>
                            <strong>Agenda inmediata</strong>
                            <small>Salidas mas proximas registradas en el sistema</small>
                        </div>
                    </div>

                    <div className="flight-stack">
                        {summary.proximos_vuelos.map((item) => (
                            <div key={item.id} className="flight-card-mini">
                                <div>
                                    <strong>{item.codigo_vuelo}</strong>
                                    <span>
                                        {item.origen} - {item.destino}
                                    </span>
                                </div>
                                <StatusBadge label={item.estado} tone={item.color} />
                                <small>{formatDateTime(item.fecha_salida)}</small>
                            </div>
                        ))}
                    </div>
                </FadeInBlock>

                <FadeInBlock className="panel-card" delay={0.28}>
                    <div className="section-title">
                        <div>
                            <strong>Lectura rapida de estados</strong>
                            <small>Resumen textual para exposicion o demostracion</small>
                        </div>
                    </div>

                    <div className="insight-list">
                        {summary.vuelos_por_estado.map((item) => (
                            <div key={item.id} className="insight-row">
                                <div>
                                    <StatusBadge label={item.nombre} tone={item.color} />
                                </div>
                                <p>
                                    Actualmente hay <strong>{item.vuelos_count}</strong>{' '}
                                    vuelos en estado <strong>{item.nombre.toLowerCase()}</strong>.
                                </p>
                            </div>
                        ))}
                    </div>
                </FadeInBlock>
            </div>
        </section>
    );
}
