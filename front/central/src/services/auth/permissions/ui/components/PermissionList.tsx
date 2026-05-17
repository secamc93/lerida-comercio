'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/shared/ui/button';
import { Alert } from '@/shared/ui/alert';
import { Modal } from '@/shared/ui/modal';
import { DynamicFilters, FilterOption, ActiveFilter, Pagination } from '@/shared/ui';
import { Permission } from '../../domain/types';
import { PermissionForm } from './PermissionForm';
import { BulkPermissionForm } from './BulkPermissionForm';
import { getPermissionsAction, deletePermissionAction } from '../../infra/actions';
import { getResourcesAction } from '@/services/auth/resources/infra/actions';
import { ConfirmModal } from '@/shared/ui/confirm-modal';
import { getActionError } from '@/shared/utils/action-result';

export const PermissionList: React.FC = () => {
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [resourceOptions, setResourceOptions] = useState<Array<{ value: string; label: string }>>([]);

    // Cargar recursos para el filtro desplegable
    useEffect(() => {
        getResourcesAction({ page_size: 100 }).then((res) => {
            if (res.success && res.data?.resources) {
                setResourceOptions(
                    res.data.resources.map((r) => ({ value: r.name, label: r.name }))
                );
            }
        });
    }, []);

    const [filters, setFilters] = useState<{
        name?: string;
        scope_id?: number;
        business_type_id?: number;
        resource?: string;
    }>({});

    const availableFilters: FilterOption[] = useMemo(() => [
        {
            key: 'name',
            label: 'Nombre',
            type: 'text',
            placeholder: 'Buscar por nombre...',
        },
        {
            key: 'resource',
            label: 'Recurso',
            type: 'select',
            options: resourceOptions,
        },
        {
            key: 'scope_id',
            label: 'ID de Scope',
            type: 'text',
            placeholder: 'Filtrar por ID de scope...',
        },
        {
            key: 'business_type_id',
            label: 'ID de Tipo de Negocio',
            type: 'text',
            placeholder: 'Filtrar por ID de tipo de negocio...',
        },
    ], [resourceOptions]);

    const activeFilters: ActiveFilter[] = useMemo(() => {
        const active: ActiveFilter[] = [];
        if (filters.name) active.push({ key: 'name', label: 'Nombre', value: filters.name, type: 'text' });
        if (filters.resource) active.push({ key: 'resource', label: 'Recurso', value: filters.resource, type: 'select' });
        if (filters.scope_id) active.push({ key: 'scope_id', label: 'ID de Scope', value: String(filters.scope_id), type: 'text' });
        if (filters.business_type_id) active.push({ key: 'business_type_id', label: 'ID de Tipo de Negocio', value: String(filters.business_type_id), type: 'text' });
        return active;
    }, [filters]);

    const handleAddFilter = useCallback((filterKey: string, value: any) => {
        setFilters((prev) => {
            const next = { ...prev };
            if (filterKey === 'scope_id') next.scope_id = value ? Number(value) : undefined;
            else if (filterKey === 'business_type_id') next.business_type_id = value ? Number(value) : undefined;
            else (next as any)[filterKey] = value;
            return next;
        });
        setPage(1);
    }, []);

    const handleRemoveFilter = useCallback((filterKey: string) => {
        setFilters((prev) => {
            const next = { ...prev };
            delete (next as any)[filterKey];
            return next;
        });
        setPage(1);
    }, []);

    const loadPermissions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getPermissionsAction({
                name: filters.name,
                scope_id: filters.scope_id,
                business_type_id: filters.business_type_id,
                resource: filters.resource,
            });
            if (response.success) {
                setAllPermissions(response.data || []);
            } else {
                setError('Error al cargar permisos');
            }
        } catch (err: any) {
            setError(getActionError(err, 'Error al cargar permisos'));
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { loadPermissions(); }, [loadPermissions]);

    // Paginación client-side
    useEffect(() => {
        const start = (page - 1) * pageSize;
        setPermissions(allPermissions.slice(start, start + pageSize));
        setTotal(allPermissions.length);
        setTotalPages(Math.ceil(allPermissions.length / pageSize) || 1);
    }, [allPermissions, page, pageSize]);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deletePermissionAction(deleteId);
            setDeleteId(null);
            loadPermissions();
        } catch (err: any) {
            setError(getActionError(err, 'Error al eliminar permiso'));
        }
    };

    const handleSave = () => {
        setShowCreateModal(false);
        setEditingPermission(null);
        loadPermissions();
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-end items-center">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowBulkModal(true)}
                    className="flex items-center gap-1.5"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Masivo
                </Button>
            </div>

            {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}

            <DynamicFilters
                availableFilters={availableFilters}
                activeFilters={activeFilters}
                onAddFilter={handleAddFilter}
                onRemoveFilter={handleRemoveFilter}
                onCreate={() => { setEditingPermission(null); setShowCreateModal(true); }}
                createButtonIconOnly
            />

            <div className="rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-emerald-950 text-white">
                        <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Nombre</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Recurso</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Acción</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Scope</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Tipo de Negocio</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-stone-400">
                                    Cargando permisos...
                                </td>
                            </tr>
                        ) : permissions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-stone-400">
                                    No hay permisos disponibles
                                </td>
                            </tr>
                        ) : (
                            permissions.map((permission) => (
                                <tr key={permission.id} className="border-t border-stone-100 hover:bg-stone-50 transition-colors">
                                    <td className="px-4 py-2.5 text-stone-700">{permission.id}</td>
                                    <td className="px-4 py-2.5 text-stone-700 font-medium">{permission.name}</td>
                                    <td className="px-4 py-2.5 text-stone-700">
                                        <span style={{ color: 'var(--color-primary-600)' }}>{permission.resource}</span>
                                    </td>
                                    <td className="px-4 py-2.5 text-stone-700">{permission.action}</td>
                                    <td className="px-4 py-2.5 text-stone-700">{permission.scope_name}</td>
                                    <td className="px-4 py-2.5 text-stone-700">{permission.business_type_name || '-'}</td>
                                    <td className="px-4 py-2.5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => { setEditingPermission(permission); setShowCreateModal(true); }}
                                                className="p-1.5 rounded hover:bg-stone-100 text-stone-500"
                                                title="Editar permiso"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(permission.id)}
                                                className="p-1.5 rounded hover:bg-stone-100 text-stone-500"
                                                title="Eliminar permiso"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && total > 0 && (
                <Pagination
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                />
            )}

            <Modal
                isOpen={showCreateModal}
                onClose={() => { setShowCreateModal(false); setEditingPermission(null); }}
                title={editingPermission ? 'Editar Permiso' : 'Crear Permiso'}
                size="sm"
            >
                <PermissionForm
                    initialData={editingPermission || undefined}
                    onSuccess={handleSave}
                    onCancel={() => { setShowCreateModal(false); setEditingPermission(null); }}
                />
            </Modal>

            <Modal
                isOpen={showBulkModal}
                onClose={() => setShowBulkModal(false)}
                title="Creación Masiva de Permisos"
                size="lg"
            >
                <BulkPermissionForm
                    onSuccess={() => { setShowBulkModal(false); loadPermissions(); }}
                    onCancel={() => setShowBulkModal(false)}
                />
            </Modal>

            <ConfirmModal
                isOpen={!!deleteId}
                title="Eliminar Permiso"
                message="¿Estás seguro de que deseas eliminar este permiso? Esta acción no se puede deshacer."
                onConfirm={handleDelete}
                onClose={() => setDeleteId(null)}
            />
        </div>
    );
};
