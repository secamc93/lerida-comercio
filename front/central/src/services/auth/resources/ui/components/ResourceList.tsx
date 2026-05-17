'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/shared/ui/button';
import { Alert } from '@/shared/ui/alert';
import { Modal } from '@/shared/ui/modal';
import { DynamicFilters, FilterOption, ActiveFilter, Pagination } from '@/shared/ui';
import { ConfirmModal } from '@/shared/ui/confirm-modal';
import { Resource } from '../../domain/types';
import { ResourceForm } from './ResourceForm';
import { useResources } from '../hooks/useResources';

export const ResourceList: React.FC = () => {
    const {
        resources,
        loading,
        error,
        page,
        setPage,
        pageSize,
        setPageSize,
        totalPages,
        total,
        filters,
        setFilters,
        deleteResource,
        refresh,
        setError
    } = useResources();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Definir filtros disponibles
    const availableFilters: FilterOption[] = [
        {
            key: 'name',
            label: 'Nombre',
            type: 'text',
            placeholder: 'Buscar por nombre...',
        },
        {
            key: 'description',
            label: 'Descripción',
            type: 'text',
            placeholder: 'Buscar por descripción...',
        },
    ];

    // Convertir filtros a ActiveFilter[]
    const activeFilters: ActiveFilter[] = useMemo(() => {
        const active: ActiveFilter[] = [];

        if (filters.name) {
            active.push({
                key: 'name',
                label: 'Nombre',
                value: filters.name,
                type: 'text',
            });
        }

        if (filters.description) {
            active.push({
                key: 'description',
                label: 'Descripción',
                value: filters.description,
                type: 'text',
            });
        }

        return active;
    }, [filters]);

    // Manejar adición de filtro
    const handleAddFilter = useCallback((filterKey: string, value: any) => {
        setFilters((prev) => {
            const newFilters = { ...prev };
            (newFilters as any)[filterKey] = value;
            return newFilters;
        });
        setPage(1);
    }, [setFilters, setPage]);

    // Manejar eliminación de filtro
    const handleRemoveFilter = useCallback((filterKey: string) => {
        setFilters((prev) => {
            const newFilters = { ...prev };
            delete (newFilters as any)[filterKey];
            return newFilters;
        });
        setPage(1);
    }, [setFilters, setPage]);

    const handleDelete = async () => {
        if (deleteId) {
            const success = await deleteResource(deleteId);
            if (success) setDeleteId(null);
        }
    };

    const handleSave = () => {
        setShowCreateModal(false);
        setEditingResource(null);
        refresh();
    };

    return (
        <div className="space-y-6">
            {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}

            {/* Filtros dinámicos y Tabla */}
            <div>
                <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-700 border-b-0">
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 gap-4">
                        <div className="flex-1 min-w-0">
                            <DynamicFilters
                                availableFilters={availableFilters}
                                activeFilters={activeFilters}
                                onAddFilter={handleAddFilter}
                                onRemoveFilter={handleRemoveFilter}
                                className="!p-0 !border-0 !shadow-none"
                            />
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => { setEditingResource(null); setShowCreateModal(true); }}
                            className="flex items-center justify-center flex-shrink-0"
                            title="Crear recurso"
                            aria-label="Crear recurso"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </Button>
                    </div>
                </div>
                {/* Tabla */}
                <div className="bg-white rounded-b-lg rounded-t-none shadow-sm border border-gray-200 border-t-0 overflow-hidden">
                    <div className="rounded-xl border border-stone-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-emerald-950 text-white">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Nombre</th>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Descripción</th>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Tipo de Negocio</th>
                                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                                            Cargando recursos...
                                        </td>
                                    </tr>
                                ) : resources.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                                            No hay recursos disponibles
                                        </td>
                                    </tr>
                                ) : (
                                    resources.map((resource) => (
                                        <tr key={resource.id} className="border-t border-stone-100 hover:bg-stone-50 transition-colors">
                                            <td className="px-4 py-2.5 text-stone-700">
                                                {resource.id}
                                            </td>
                                            <td className="px-4 py-2.5 text-stone-700 font-medium">
                                                {resource.name}
                                            </td>
                                            <td className="px-4 py-2.5 text-stone-500 max-w-xs truncate">
                                                {resource.description || '-'}
                                            </td>
                                            <td className="px-4 py-2.5 text-stone-500">
                                                {resource.business_type_name || '-'}
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => { setEditingResource(resource); setShowCreateModal(true); }}
                                                        className="p-1.5 rounded hover:bg-stone-100 text-stone-500"
                                                        title="Editar recurso"
                                                        aria-label="Editar recurso"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteId(resource.id)}
                                                        className="p-1.5 rounded hover:bg-stone-100 text-stone-500"
                                                        title="Eliminar recurso"
                                                        aria-label="Eliminar recurso"
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

                    {/* Paginación */}
                    {!loading && resources.length > 0 && (
                        <div className="px-4 border-t border-stone-200">
                            <Pagination
                                page={page}
                                pageSize={pageSize}
                                total={total}
                                onPageChange={setPage}
                                onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={showCreateModal}
                onClose={() => { setShowCreateModal(false); setEditingResource(null); }}
                title={editingResource ? "Editar Recurso" : "Crear Recurso"}
                size="sm"
            >
                <ResourceForm
                    initialData={editingResource || undefined}
                    onSuccess={handleSave}
                    onCancel={() => { setShowCreateModal(false); setEditingResource(null); }}
                />
            </Modal>

            <ConfirmModal
                isOpen={!!deleteId}
                title="Eliminar Recurso"
                message="¿Estás seguro de que deseas eliminar este recurso? Esta acción no se puede deshacer."
                onConfirm={handleDelete}
                onClose={() => setDeleteId(null)}
            />
        </div>
    );
};
