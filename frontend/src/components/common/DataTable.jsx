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

    return (
        <div className="table-wrapper">
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
                                    {column.render ? column.render(row) : row[column.key]}
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
    );
}
