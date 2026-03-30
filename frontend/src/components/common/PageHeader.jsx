export default function PageHeader({ title, description, actions = null }) {
    return (
        <div className="page-header">
            <div>
                <span className="eyebrow">Gestion operativa</span>
                <h1>{title}</h1>
                <p>{description}</p>
            </div>

            {actions ? <div className="page-header-actions">{actions}</div> : null}
        </div>
    );
}
