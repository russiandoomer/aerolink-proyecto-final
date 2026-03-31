import EmptyState from './EmptyState';

export default function DataTable({
    columns,
    rows,
    onEdit,
    onDelete,
    emptyTitle = 'No hay registros disponibles.',
    emptyDescription = 'Ajusta los filtros o registra un nuevo elemento.',
}) {
    if (!rows.length) {
        return <EmptyState title={emptyTitle} description={emptyDescription} />;
    }

    function renderCell(row, column) {
        return column.render ? column.render(row) : row[column.key] ?? '--';
    }

    return (
        <>
            <div className="table-wrapper table-wrapper-desktop">
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key}>{column.label}</th>
                            ))}
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.id}>
                                {columns.map((column) => (
                                    <td key={`${row.id}-${column.key}`}>
                                        {renderCell(row, column)}
                                    </td>
                                ))}
                                <td>
                                    <div className="table-actions">
                                        <button
                                            type="button"
                                            className="table-action table-action-edit"
                                            onClick={() => onEdit(row)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            className="table-action table-action-delete"
                                            onClick={() => onDelete(row)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-mobile-list">
                {rows.map((row) => (
                    <article key={`mobile-${row.id}`} className="table-mobile-card">
                        <div className="table-mobile-card__header">
                            <span>{columns[0]?.label ?? 'Registro'}</span>
                            <div className="table-mobile-card__primary">
                                {columns[0] ? renderCell(row, columns[0]) : '--'}
                            </div>
                        </div>

                        <div className="table-mobile-card__body">
                            {columns.slice(1).map((column) => (
                                <div
                                    key={`mobile-${row.id}-${column.key}`}
                                    className="table-mobile-card__row"
                                >
                                    <span>{column.label}</span>
                                    <div>{renderCell(row, column)}</div>
                                </div>
                            ))}
                        </div>

                        <div className="table-mobile-actions">
                            <button
                                type="button"
                                className="table-action table-action-edit"
                                onClick={() => onEdit(row)}
                            >
                                Editar
                            </button>
                            <button
                                type="button"
                                className="table-action table-action-delete"
                                onClick={() => onDelete(row)}
                            >
                                Eliminar
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </>
    );
}
