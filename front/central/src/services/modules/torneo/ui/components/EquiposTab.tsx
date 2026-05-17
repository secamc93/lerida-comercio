'use client';

import { useState } from 'react';
import { Modal } from '@/shared/ui/modal';
import { ConfirmModal } from '@/shared/ui/confirm-modal';
import { Pagination } from '@/shared/ui';
import { useEquipos } from '../hooks/useEquipos';
import { CreateEquipoDTO, Equipo } from '../../domain/types';

const btnPrimary =
    'px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 bg-yellow-400 text-emerald-950 hover:brightness-110';
const btnSecondary =
    'px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50';

interface Props {
    torneoId: number;
}

const empty: CreateEquipoDTO = { name: '', color: '#10b981', logo_url: '' };

export function EquiposTab({ torneoId }: Props) {
    const { equipos, total, page, pageSize, loading, error, setPage, setPageSize, create, update, remove } =
        useEquipos(torneoId);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Equipo | null>(null);
    const [form, setForm] = useState<CreateEquipoDTO>(empty);
    const [saving, setSaving] = useState(false);
    const [toDelete, setToDelete] = useState<Equipo | null>(null);

    const openCreate = () => {
        setEditing(null);
        setForm(empty);
        setFormOpen(true);
    };

    const openEdit = (e: Equipo) => {
        setEditing(e);
        setForm({ name: e.name, color: e.color || '#10b981', logo_url: e.logo_url || '' });
        setFormOpen(true);
    };

    const submit = async () => {
        setSaving(true);
        try {
            if (editing) await update(editing.id, form);
            else await create(form);
            setFormOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button className={btnPrimary} onClick={openCreate}>
                    + Nuevo equipo
                </button>
            </div>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-emerald-950 text-white">
                        <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">
                                Color
                            </th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-stone-400">
                                    Cargando…
                                </td>
                            </tr>
                        ) : equipos.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-stone-400">
                                    No hay equipos
                                </td>
                            </tr>
                        ) : (
                            equipos.map((e) => (
                                <tr
                                    key={e.id}
                                    className="border-t border-stone-100 hover:bg-stone-50 transition-colors"
                                >
                                    <td className="px-4 py-2.5 text-stone-700">{e.id}</td>
                                    <td className="px-4 py-2.5 text-stone-700">{e.name}</td>
                                    <td className="px-4 py-2.5 text-stone-700">
                                        <span className="inline-flex items-center gap-2">
                                            <span
                                                className="inline-block h-4 w-4 rounded-full border border-stone-300"
                                                style={{ backgroundColor: e.color || '#ccc' }}
                                            />
                                            {e.color || '—'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <button
                                            className="text-emerald-700 hover:underline mr-3"
                                            onClick={() => openEdit(e)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="text-red-600 hover:underline"
                                            onClick={() => setToDelete(e)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={(s) => {
                    setPageSize(s);
                    setPage(1);
                }}
            />

            <Modal
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                title={editing ? 'Editar equipo' : 'Nuevo equipo'}
                size="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Nombre</label>
                        <input
                            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Color</label>
                        <input
                            type="color"
                            className="h-9 w-16 rounded border border-stone-300"
                            value={form.color || '#10b981'}
                            onChange={(e) => setForm({ ...form, color: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Logo URL</label>
                        <input
                            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                            value={form.logo_url || ''}
                            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button className={btnSecondary} onClick={() => setFormOpen(false)}>
                            Cancelar
                        </button>
                        <button className={btnPrimary} disabled={saving || !form.name} onClick={submit}>
                            {saving ? 'Guardando…' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={!!toDelete}
                onClose={() => setToDelete(null)}
                onConfirm={() => toDelete && remove(toDelete.id)}
                title="Eliminar equipo"
                message={`¿Eliminar el equipo "${toDelete?.name}"?`}
                confirmText="Eliminar"
            />
        </div>
    );
}
