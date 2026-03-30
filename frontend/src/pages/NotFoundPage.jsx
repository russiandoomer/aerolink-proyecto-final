import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="not-found-page">
            <div className="panel-card not-found-card">
                <span className="eyebrow">Ruta no encontrada</span>
                <h1>404</h1>
                <p>
                    La vista solicitada no existe dentro del panel de AeroLink.
                </p>
                <Link to="/" className="primary-button link-button">
                    Volver al dashboard
                </Link>
            </div>
        </div>
    );
}
