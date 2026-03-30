export default function LoadingState({ label = 'Cargando informacion...' }) {
    return (
        <div className="loading-state">
            <span className="loading-ring" />
            <p>{label}</p>
        </div>
    );
}
