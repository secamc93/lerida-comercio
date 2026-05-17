'use client';

import { useState } from 'react';
import { Modal } from '@/shared/ui/modal';
import { ConfirmModal } from '@/shared/ui/confirm-modal';
import { Pagination } from '@/shared/ui';
import { useJugadores } from '../hooks/useJugadores';
import { useEquipos } from '../hooks/useEquipos';
import { CreateJugadorDTO, Jugador } from '../../domain/types';

const btnPrimary =
    'px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 bg-yellow-400 text-emerald-950 hover:brightness-110';
const btnSecondary =
    'px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50';

interface Props {
    torneoId: number;
}

const empty: CreateJugadorDTO = { name: '', equipo_id: 0, position: '', number: undefined };

export function JugadoresTab({ torneoId }: Props) {
    const {
        jugadores,
        total,
        page,
        pageSize,
        equipoId,
        loading,
        error,
        setPage,
        setPageSize,
        setEquipoId,
        create,
        update,
        remove,
    } = useJugadores(torneoId);

    // Lista de equipos para selects de filtro y formulario.
    const { equipos } = useEquipos(torneoId);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Jugador | null>(null);
    const [form, setForm] = useState<CreateJugadorDTO>(empty);
    const [saving, setSaving] = useState(false);
    const [toDelete, setToDelete] = useState<Jugador | null>(null);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...empty, equipo_id: equipos[0]?.id ?? 0 });
        setFormOpen(true);
    };

    const openEdit = (j: Jugador) => {
        setEditing(j);
        setForm({
            name: j.name,
            equipo_id: j.equipo_id,
            position: j.position || '',
            number: j.number,
        });
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

    const equipoName = (id: number) => equipos.find((e) => e.id === id)?.name;

    return (
        <div>
            <div className="flex justify-between items-center mb-4 gap-3">
                <select
                    className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700"
                    value={equipoId ?? ''}
                    onChange={(e) => {
                        setEquipoId(e.target.value ? Number(e.target.value) : null);
                        setPage(1);
                    }}
                >
                    <option value="">Todos los equipos</option>
                    {equipos.map((e) => (
                        <option key={e.id} value={e.id}>
                            {e.name}
                        </option>
                    ))}
                </select>
                <button className={btnPrimary} onClick={openCreate} disabled={equipos.length === 0}>
                    + Nuevo jugador
                </button>
            </div>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-emerald-950 text-white">
                        <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Nombre</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Equipo</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Posición</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Número</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                                    Cargando…
                                </td>
                            </tr>
                        ) : jugadores.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                                    No hay jugadores
                                </td>
                            </tr>
                        ) : (
                            jugadores.map((j) => (
                                <tr key={j.id} className="border-t border-stone-100 hover:bg-stone-50 transition-colors">
                                    <td className="px-4 py-2.5 text-stone-700">{j.id}</td>
                                    <td className="px-4 py-2.5 text-stone-700">{j.name}</td>
                                    <td className="px-4 py-2.5 text-stone-700">
                                        {j.equipo_name || equipoName(j.equipo_id) || j.equipo_id}
                                    </td>
                                    <td className="px-4 py-2.5 text-stone-500">{j.position || '—'}</td>
                                    <td className="px-4 py-2.5 text-stone-500">{j.number ?? '—'}</td>
                                    <td className="px-4 py-2.5 text-right">
                                        <button className="text-emerald-700 hover:underline mr-3" onClick={() => openEdit(j)}>
                                            Editar
                                        </button>
                                        <button className="text-red-600 hover:underline" onClick={() => setToDelete(j)}>
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
                title={editing ? 'Editar jugador' : 'Nuevo jugador'}
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
                        <label className="block text-sm font-medium text-stone-700 mb-1">Equipo</label>
                        <select
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                            value={form.equipo_id || ''}
                            onChange={(e) => setForm({ ...form, equipo_id: Number(e.target.value) })}
                        >
                            <option value="">Seleccionar…</option>
                            {equipos.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Posición</label>
                        <input
                            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                            value={form.position || ''}
                            onChange={(e) => setForm({ ...form, position: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Número</label>
                        <input
                            type="number"
                            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                            value={form.number ?? ''}
                            onChange={(e) =>
                                setForm({ ...form, number: e.target.value ? Number(e.target.value) : undefined })
                            }
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button className={btnSecondary} onClick={() => setFormOpen(false)}>
                            Cancelar
                        </button>
                        <button
                            className={btnPrimary}
                            disabled={saving || !form.name || !form.equipo_id}
                            onClick={submit}
                        >
                            {saving ? 'Guardando…' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={!!toDelete}
                onClose={() => setToDelete(null)}
                onConfirm={() => toDelete && remove(toDelete.id)}
                title="Eliminar jugador"
                message={`¿Eliminar al jugador "${toDelete?.name}"?`}
                confirmText="Eliminar"
            />
        </div>
    );
}
