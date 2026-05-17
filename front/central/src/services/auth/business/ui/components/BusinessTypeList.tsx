'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';
import { Alert } from '@/shared/ui/alert';
import { BusinessType } from '../../domain/types';
import { Modal } from '@/shared/ui/modal';
import { BusinessTypeForm } from './BusinessTypeForm';
import { ConfirmModal } from '@/shared/ui/confirm-modal';
import { useBusinessTypes } from '../hooks/useBusinessTypes';

export const BusinessTypeList: React.FC = () => {
    const {
        types,
        loading,
        error,
        deleteType,
        refresh,
        setError
    } = useBusinessTypes();

    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState<BusinessType | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = async () => {
        if (deleteId) {
            const success = await deleteType(deleteId);
            if (success) setDeleteId(null);
        }
    };

    const handleSave = () => {
        setShowModal(false);
        setEditingType(null);
        refresh();
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-end items-center">
                <Button onClick={() => { setEditingType(null); setShowModal(true); }}>Crear Tipo</Button>
            </div>

            {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}

            <div className="rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-emerald-950 text-white">
                        <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Nombre</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Código</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Activo</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                                    <Spinner />
                                </td>
                            </tr>
                        ) : types.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                                    No hay tipos de negocio disponibles
                                </td>
                            </tr>
                        ) : (
                            types.map((type) => (
                                <tr key={type.id} className="border-t border-stone-100 hover:bg-stone-50 transition-colors">
                                    <td className="px-4 py-2.5 text-stone-700">{type.id}</td>
                                    <td className="px-4 py-2.5 text-stone-700 font-medium">{type.name}</td>
                                    <td className="px-4 py-2.5 text-stone-500">{type.code}</td>
                                    <td className="px-4 py-2.5 text-stone-700">{type.is_active ? 'Sí' : 'No'}</td>
                                    <td className="px-4 py-2.5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="secondary" size="sm" onClick={() => { setEditingType(type); setShowModal(true); }}>Editar</Button>
                                            <Button variant="danger" size="sm" onClick={() => setDeleteId(type.id)}>Eliminar</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingType(null); }}
                title={editingType ? "Editar Tipo" : "Crear Tipo"}
            >
                <BusinessTypeForm
                    initialData={editingType || undefined}
                    onSuccess={handleSave}
                    onCancel={() => { setShowModal(false); setEditingType(null); }}
                />
            </Modal>

            <ConfirmModal
                isOpen={!!deleteId}
                title="Eliminar Tipo de Negocio"
                message="¿Estás seguro de que deseas eliminar este tipo de negocio? Esta acción no se puede deshacer."
                onConfirm={handleDelete}
                onClose={() => setDeleteId(null)}
            />
        </div>
    );
};
