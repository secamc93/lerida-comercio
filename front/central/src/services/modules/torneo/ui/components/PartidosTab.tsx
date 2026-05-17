'use client';

import { useState } from 'react';
import { Modal } from '@/shared/ui/modal';
import { ConfirmModal } from '@/shared/ui/confirm-modal';
import { Pagination } from '@/shared/ui';
import { usePartidos } from '../hooks/usePartidos';
import { useEquipos } from '../hooks/useEquipos';
import { CreatePartidoDTO, Partido, ResultadoDTO } from '../../domain/types';

const btnPrimary =
    'px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 bg-yellow-400 text-emerald-950 hover:brightness-110';
const btnSecondary =
    'px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50';

interface Props {
    torneoId: number;
}

const emptyPartido: CreatePartidoDTO = { jornada: 1, local_equipo_id: 0, visita_equipo_id: 0 };

export function PartidosTab({ torneoId }: Props) {
    const {
        partidos,
        total,
        page,
        pageSize,
        jornada,
        loading,
        error,
        setPage,
        setPageSize,
        setJornada,
        create,
        update,
        remove,
        registrarResultado,
        generarFixture,
    } = usePartidos(torneoId);

    const { equipos } = useEquipos(torneoId);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Partido | null>(null);
    const [form, setForm] = useState<CreatePartidoDTO>(emptyPartido);
    const [saving, setSaving] = useState(false);
    const [toDelete, setToDelete] = useState<Partido | null>(null);
    const [fixtureOpen, setFixtureOpen] = useState(false);

    const [resultadoFor, setResultadoFor] = useState<Partido | null>(null);
    const [resultado, setResultado] = useState<ResultadoDTO>({ gol_local: 0, gol_visita: 0 });

    const equipoName = (id: number) => equipos.find((e) => e.id === id)?.name;

    const openCreate = () => {
        setEditing(null);
        setForm({
            jornada: 1,
            local_equipo_id: equipos[0]?.id ?? 0,
            visita_equipo_id: equipos[1]?.id ?? 0,
        });
        setFormOpen(true);
    };

    const openEdit = (p: Partido) => {
        setEditing(p);
        setForm({
            jornada: p.jornada,
            local_equipo_id: p.local_equipo_id,
            visita_equipo_id: p.visita_equipo_id,
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

    const openResultado = (p: Partido) => {
        setResultadoFor(p);
        setResultado({ gol_local: p.gol_local ?? 0, gol_visita: p.gol_visita ?? 0 });
    };

    const submitResultado = async () => {
        if (!resultadoFor) return;
        setSaving(true);
        try {
            await registrarResultado(resultadoFor.id, resultado);
            setResultadoFor(null);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const doGenerarFixture = async () => {
        try {
            await generarFixture();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4 gap-3">
                <input
                    type="number"
                    placeholder="Filtrar por jornada"
                    className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 w-48"
                    value={jornada ?? ''}
                    onChange={(e) => {
                        setJornada(e.target.value ? Number(e.target.value) : null);
                        setPage(1);
                    }}
                />
                <div className="flex gap-3">
                    <button className={btnSecondary} onClick={() => setFixtureOpen(true)}>
                        Generar fixture
                    </button>
                    <button className={btnPrimary} onClick={openCreate} disabled={equipos.length < 2}>
                        + Nuevo partido
                    </button>
                </div>
            </div>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-emerald-950 text-white">
                        <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Jornada</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Local</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">Resultado</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Visitante</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                                    Cargando…
                                </td>
                            </tr>
                        ) : partidos.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                                    No hay partidos
                                </td>
                            </tr>
                        ) : (
                            partidos.map((p) => (
                                <tr key={p.id} className="border-t border-stone-100 hover:bg-stone-50 transition-colors">
                                    <td className="px-4 py-2.5 text-stone-700">{p.jornada}</td>
                                    <td className="px-4 py-2.5 text-stone-700">
                                        {p.local_equipo_name || equipoName(p.local_equipo_id) || p.local_equipo_id}
                                    </td>
                                    <td className="px-4 py-2.5 text-center text-stone-700 font-semibold">
                                        {p.gol_local != null && p.gol_visita != null
                                            ? `${p.gol_local} - ${p.gol_visita}`
                                            : '— : —'}
                                    </td>
                                    <td className="px-4 py-2.5 text-stone-700">
                                        {p.visita_equipo_name || equipoName(p.visita_equipo_id) || p.visita_equipo_id}
                                    </td>
                                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                                        <button
                                            className="text-yellow-700 hover:underline mr-3"
                                            onClick={() => openResultado(p)}
                                        >
                                            Resultado
                                        </button>
                                        <button className="text-emerald-700 hover:underline mr-3" onClick={() => openEdit(p)}>
                                            Editar
                                        </button>
                                        <button className="text-red-600 hover:underline" onClick={() => setToDelete(p)}>
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

            {/* Modal crear/editar partido */}
            <Modal
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                title={editing ? 'Editar partido' : 'Nuevo partido'}
                size="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Jornada</label>
                        <input
                            type="number"
                            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                            value={form.jornada}
                            onChange={(e) => setForm({ ...form, jornada: Number(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Equipo local</label>
                        <select
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                            value={form.local_equipo_id || ''}
                            onChange={(e) => setForm({ ...form, local_equipo_id: Number(e.target.value) })}
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
                        <label className="block text-sm font-medium text-stone-700 mb-1">Equipo visitante</label>
                        <select
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                            value={form.visita_equipo_id || ''}
                            onChange={(e) => setForm({ ...form, visita_equipo_id: Number(e.target.value) })}
                        >
                            <option value="">Seleccionar…</option>
                            {equipos.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button className={btnSecondary} onClick={() => setFormOpen(false)}>
                            Cancelar
                        </button>
                        <button
                            className={btnPrimary}
                            disabled={
                                saving ||
                                !form.local_equipo_id ||
                                !form.visita_equipo_id ||
                                form.local_equipo_id === form.visita_equipo_id
                            }
                            onClick={submit}
                        >
                            {saving ? 'Guardando…' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal registrar resultado */}
            <Modal
                isOpen={!!resultadoFor}
                onClose={() => setResultadoFor(null)}
                title="Registrar resultado"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-stone-600">
                        {resultadoFor &&
                            `${equipoName(resultadoFor.local_equipo_id) || resultadoFor.local_equipo_id} vs ${
                                equipoName(resultadoFor.visita_equipo_id) || resultadoFor.visita_equipo_id
                            }`}
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-stone-700 mb-1">Goles local</label>
                            <input
                                type="number"
                                min={0}
                                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                                value={resultado.gol_local}
                                onChange={(e) => setResultado({ ...resultado, gol_local: Number(e.target.value) })}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-stone-700 mb-1">Goles visita</label>
                            <input
                                type="number"
                                min={0}
                                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                                value={resultado.gol_visita}
                                onChange={(e) => setResultado({ ...resultado, gol_visita: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button className={btnSecondary} onClick={() => setResultadoFor(null)}>
                            Cancelar
                        </button>
                        <button className={btnPrimary} disabled={saving} onClick={submitResultado}>
                            {saving ? 'Guardando…' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={fixtureOpen}
                onClose={() => setFixtureOpen(false)}
                onConfirm={doGenerarFixture}
                title="Generar fixture"
                message="Esto generará el calendario round-robin de partidos del torneo. ¿Continuar?"
                confirmText="Generar"
                type="warning"
            />

            <ConfirmModal
                isOpen={!!toDelete}
                onClose={() => setToDelete(null)}
                onConfirm={() => toDelete && remove(toDelete.id)}
                title="Eliminar partido"
                message={`¿Eliminar el partido de la jornada ${toDelete?.jornada}?`}
                confirmText="Eliminar"
            />
        </div>
    );
}
