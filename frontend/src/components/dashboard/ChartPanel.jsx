import FadeInBlock from '../common/FadeInBlock';

export default function ChartPanel({
    title,
    description,
    children,
    delay = 0,
    className = '',
}) {
    return (
        <FadeInBlock className={className} delay={delay}>
            <article className="panel-card chart-panel">
                <div className="section-title">
                    <div>
                        <strong>{title}</strong>
                        <small>{description}</small>
                    </div>
                </div>
                {children}
            </article>
        </FadeInBlock>
    );
}
