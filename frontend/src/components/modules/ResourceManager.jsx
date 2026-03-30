import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import {
    createRecord,
    deleteRecord,
    fetchCollection,
    updateRecord,
} from '../../api/resources';
import { useCatalogs } from '../../hooks/useCatalogs';
import {
    extractApiMessage,
    extractValidationErrors,
} from '../../utils/format';
import DataTable from '../common/DataTable';
import FadeInBlock from '../common/FadeInBlock';
import LoadingState from '../common/LoadingState';
import PageHeader from '../common/PageHeader';

function buildInitialForm(fields, initialValues = {}) {
    return fields.reduce((accumulator, field) => {
        if (Object.prototype.hasOwnProperty.call(initialValues, field.name)) {
            accumulator[field.name] = initialValues[field.name];
            return accumulator;
        }

        accumulator[field.name] = field.type === 'checkbox' ? false : '';
        return accumulator;
    }, {});
}

function serializeFilters(filters) {
    return JSON.stringify(filters);
}

export default function ResourceManager({
    title,
    description,
    endpoint,
    searchPlaceholder,
    columns,
    fields,
    filters = [],
    catalogKeys = [],
    initialValues = {},
    createLabel = 'Nuevo registro',
    transformSubmit,
    transformFormData,
}) {
    const [rows, setRows] = useState([]);
    const [meta, setMeta] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [reloadKey, setReloadKey] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [draftFilters, setDraftFilters] = useState(
        filters.reduce((accumulator, filter) => {
            accumulator[filter.name] = filter.initialValue ?? '';
            return accumulator;
        }, {})
    );
    const [appliedFilters, setAppliedFilters] = useState(
        filters.reduce((accumulator, filter) => {
            accumulator[filter.name] = filter.initialValue ?? '';
            return accumulator;
        }, {})
    );
    const [editingRecord, setEditingRecord] = useState(null);
    const [formData, setFormData] = useState(buildInitialForm(fields, initialValues));
    const [formErrors, setFormErrors] = useState({});

    const { catalogs, loading: catalogsLoading } = useCatalogs(catalogKeys);

    const serializedFilters = useMemo(
        () => serializeFilters(appliedFilters),
        [appliedFilters]
    );

    useEffect(() => {
        let active = true;

        async function loadRows() {
            setLoading(true);

            try {
                const cleanedFilters = Object.entries(appliedFilters).reduce(
                    (accumulator, [key, value]) => {
                        if (value !== '' && value !== null && value !== undefined) {
                            accumulator[key] = value;
                        }

                        return accumulator;
                    },
                    {}
                );

                const response = await fetchCollection(endpoint, {
                    page,
                    per_page: 8,
                    search: searchTerm || undefined,
                    ...cleanedFilters,
                });

                if (active) {
                    setRows(response.items);
                    setMeta(response.meta);
                }
            } catch (error) {
                if (active) {
                    toast.error(extractApiMessage(error));
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadRows();

        return () => {
            active = false;
        };
    }, [endpoint, page, reloadKey, searchTerm, serializedFilters]);

    function resetForm() {
        setEditingRecord(null);
        setFormErrors({});
        setFormData(buildInitialForm(fields, initialValues));
    }

    function handleFilterSubmit(event) {
        event.preventDefault();
        setPage(1);
        setSearchTerm(searchInput.trim());
        setAppliedFilters(draftFilters);
    }

    function handleFilterReset() {
        const cleanFilters = filters.reduce((accumulator, filter) => {
            accumulator[filter.name] = filter.initialValue ?? '';
            return accumulator;
        }, {});

        setSearchInput('');
        setSearchTerm('');
        setDraftFilters(cleanFilters);
        setAppliedFilters(cleanFilters);
        setPage(1);
    }

    function handleFieldChange(name, value) {
        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function handleEdit(row) {
        const nextFormData = transformFormData
            ? transformFormData(row)
            : row;

        setEditingRecord(row);
        setFormErrors({});
        setFormData({
            ...buildInitialForm(fields, initialValues),
            ...nextFormData,
        });
    }

    async function handleDelete(row) {
        const result = await Swal.fire({
            title: 'Eliminar registro',
            text: 'Esta accion solo debe hacerse si el dato ya no sera usado.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            background: '#ffffff',
            confirmButtonColor: '#b42318',
            cancelButtonColor: '#10304f',
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await deleteRecord(endpoint, row.id);
            toast.success('Registro eliminado correctamente.');
            resetForm();
            setReloadKey((value) => value + 1);
        } catch (error) {
            toast.error(extractApiMessage(error));
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setFormErrors({});

        try {
            const payload = transformSubmit
                ? transformSubmit(formData, editingRecord, catalogs)
                : formData;

            if (editingRecord) {
                await updateRecord(endpoint, editingRecord.id, payload);
                toast.success('Registro actualizado correctamente.');
            } else {
                await createRecord(endpoint, payload);
                toast.success('Registro creado correctamente.');
            }

            resetForm();
            setReloadKey((value) => value + 1);
        } catch (error) {
            setFormErrors(extractValidationErrors(error));
            toast.error(extractApiMessage(error));
        } finally {
            setSubmitting(false);
        }
    }

    function resolveOptions(field) {
        if (typeof field.options === 'function') {
            return field.options(catalogs, formData);
        }

        return field.options ?? [];
    }

    function renderField(field) {
        const value = formData[field.name] ?? (field.type === 'checkbox' ? false : '');
        const error = formErrors[field.name]?.[0];

        if (field.type === 'checkbox') {
            return (
                <label key={field.name} className="form-checkbox">
                    <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(event) =>
                            handleFieldChange(field.name, event.target.checked)
                        }
                    />
                    <span>{field.label}</span>
                </label>
            );
        }

        return (
            <label key={field.name} className="form-field">
                <span>{field.label}</span>
                {field.type === 'select' ? (
                    <select
                        value={value}
                        onChange={(event) =>
                            handleFieldChange(field.name, event.target.value)
                        }
                    >
                        <option value="">
                            {field.placeholder ?? 'Seleccione una opcion'}
                        </option>
                        {resolveOptions(field).map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ) : field.type === 'textarea' ? (
                    <textarea
                        rows={field.rows ?? 4}
                        value={value}
                        placeholder={field.placeholder ?? ''}
                        onChange={(event) =>
                            handleFieldChange(field.name, event.target.value)
                        }
                    />
                ) : (
                    <input
                        type={field.type ?? 'text'}
                        value={value}
                        placeholder={field.placeholder ?? ''}
                        onChange={(event) =>
                            handleFieldChange(field.name, event.target.value)
                        }
                    />
                )}
                {field.helpText ? <small>{field.helpText}</small> : null}
                {error ? <em className="field-error">{error}</em> : null}
            </label>
        );
    }

    return (
        <section className="resource-page">
            <PageHeader
                title={title}
                description={description}
                actions={
                    <button
                        type="button"
                        className="primary-button"
                        onClick={resetForm}
                    >
                        {createLabel}
                    </button>
                }
            />

            <div className="resource-grid">
                <FadeInBlock delay={0.06}>
                    <article className="panel-card">
                        <form className="filter-bar" onSubmit={handleFilterSubmit}>
                            <div className="search-block">
                                <span>Busqueda</span>
                                <input
                                    type="search"
                                    value={searchInput}
                                    placeholder={searchPlaceholder}
                                    onChange={(event) =>
                                        setSearchInput(event.target.value)
                                    }
                                />
                            </div>

                            {filters.map((filter) => (
                                <label key={filter.name} className="filter-field">
                                    <span>{filter.label}</span>
                                    {filter.type === 'select' ? (
                                        <select
                                            value={draftFilters[filter.name]}
                                            onChange={(event) =>
                                                setDraftFilters((previous) => ({
                                                    ...previous,
                                                    [filter.name]: event.target.value,
                                                }))
                                            }
                                        >
                                            <option value="">
                                                {filter.placeholder ?? 'Todos'}
                                            </option>
                                            {(
                                                typeof filter.options === 'function'
                                                    ? filter.options(catalogs)
                                                    : filter.options ?? []
                                            ).map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={filter.type ?? 'text'}
                                            value={draftFilters[filter.name]}
                                            placeholder={filter.placeholder ?? ''}
                                            onChange={(event) =>
                                                setDraftFilters((previous) => ({
                                                    ...previous,
                                                    [filter.name]: event.target.value,
                                                }))
                                            }
                                        />
                                    )}
                                </label>
                            ))}

                            <div className="filter-actions">
                                <button type="submit" className="primary-button">
                                    Filtrar
                                </button>
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={handleFilterReset}
                                >
                                    Limpiar
                                </button>
                            </div>
                        </form>

                        <div className="table-header">
                            <div>
                                <strong>Resultados</strong>
                                <small>{meta.total} registros encontrados</small>
                            </div>

                            <div className="pagination-inline">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    disabled={meta.currentPage <= 1}
                                    onClick={() => setPage((value) => value - 1)}
                                >
                                    Anterior
                                </button>
                                <span>
                                    Pagina {meta.currentPage} de {meta.lastPage}
                                </span>
                                <button
                                    type="button"
                                    className="secondary-button"
                                    disabled={meta.currentPage >= meta.lastPage}
                                    onClick={() => setPage((value) => value + 1)}
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>

                        {loading || catalogsLoading ? (
                            <LoadingState label="Consultando registros..." />
                        ) : (
                            <DataTable
                                columns={columns}
                                rows={rows}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}
                    </article>
                </FadeInBlock>

                <FadeInBlock className="form-panel" delay={0.12}>
                    <aside className="panel-card">
                        <div className="form-panel-header">
                            <div>
                                <strong>
                                    {editingRecord ? 'Editar registro' : 'Nuevo registro'}
                                </strong>
                                <small>
                                    Completa los campos para guardar informacion.
                                </small>
                            </div>

                            {editingRecord ? (
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={resetForm}
                                >
                                    Cancelar edicion
                                </button>
                            ) : null}
                        </div>

                        <form className="resource-form" onSubmit={handleSubmit}>
                            {fields.map((field) => renderField(field))}

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? 'Guardando...'
                                        : editingRecord
                                          ? 'Actualizar'
                                          : 'Registrar'}
                                </button>
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={resetForm}
                                >
                                    Limpiar formulario
                                </button>
                            </div>
                        </form>
                    </aside>
                </FadeInBlock>
            </div>
        </section>
    );
}
