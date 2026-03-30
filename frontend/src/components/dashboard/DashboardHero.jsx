import { ArrowUpRight, Clock3, PlaneLanding, ShieldCheck } from 'lucide-react';
import FadeInBlock from '../common/FadeInBlock';
import StatusBadge from '../common/StatusBadge';
import { formatDateTime } from '../../utils/format';

function HeroSignal({ icon: Icon, label, value }) {
    return (
        <div className="hero-signal">
            <span className="hero-signal-icon">
                <Icon size={16} />
            </span>
            <div>
                <small>{label}</small>
                <strong>{value}</strong>
            </div>
        </div>
    );
}

export default function DashboardHero({
    totals,
    nextFlight,
    delayedCount,
    completionRate,
}) {
    return (
        <FadeInBlock className="hero-panel" delay={0.05} y={10}>
            <div className="hero-copy">
                <span className="eyebrow">Centro de control</span>
                <h1>Operacion aerea con visibilidad clara y respuesta rapida.</h1>
                <p>
                    AeroLink concentra la programacion de vuelos, la ocupacion de
                    reservas y el estado de la flota en un panel ligero, limpio y
                    facil de supervisar.
                </p>

                <div className="hero-signals">
                    <HeroSignal
                        icon={ShieldCheck}
                        label="Flota activa"
                        value={`${totals.flota_activa} unidades`}
                    />
                    <HeroSignal
                        icon={Clock3}
                        label="Vuelos demorados"
                        value={`${delayedCount} casos`}
                    />
                    <HeroSignal
                        icon={ArrowUpRight}
                        label="Operacion completada"
                        value={`${completionRate}%`}
                    />
                </div>
            </div>

            <div className="hero-spotlight">
                <div className="hero-spotlight-head">
                    <span className="eyebrow">Siguiente salida</span>
                    {nextFlight ? (
                        <StatusBadge
                            label={nextFlight.estado}
                            tone={nextFlight.color}
                        />
                    ) : null}
                </div>

                {nextFlight ? (
                    <>
                        <div className="hero-route">
                            <span>{nextFlight.origen}</span>
                            <PlaneLanding size={20} />
                            <span>{nextFlight.destino}</span>
                        </div>

                        <div className="hero-flight-meta">
                            <strong>{nextFlight.codigo_vuelo}</strong>
                            <small>{formatDateTime(nextFlight.fecha_salida)}</small>
                        </div>
                    </>
                ) : (
                    <div className="hero-flight-meta">
                        <strong>Sin salidas programadas</strong>
                        <small>Agrega vuelos para ver la agenda inmediata.</small>
                    </div>
                )}
            </div>
        </FadeInBlock>
    );
}
