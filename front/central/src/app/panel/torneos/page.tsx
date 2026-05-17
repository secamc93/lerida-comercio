'use client';

import { useState } from 'react';
import {
    EquiposTab,
    JugadoresTab,
    PartidosTab,
    TablaTab,
    GoleadoresTab,
    useTorneos,
} from '@/services/modules/torneo/ui';
import { CreateTorneoDTO } from '@/services/modules/torneo/domain/types';
import { useBusinessesSimple } from '@/services/auth/business/ui/hooks/useBusinessesSimple';
import { Modal } from '@/shared/ui/modal';
import { Pagination } from '@/shared/ui';

type TabKey = 'equipos' | 'jugadores' | 'partidos' | 'tabla' | 'goleadores';

const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: 'equipos', label: 'Equipos', icon: '⚽' },
    { key: 'jugadores', label: 'Jugadores', icon: '👥' },
    { key: 'partidos', label: 'Partidos', icon: '📅' },
    { key: 'tabla', label: 'Tabla', icon: '📊' },
    { key: 'goleadores', label: 'Goleadores', icon: '🥇' },
];

const tabBase = 'px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2';
const btnPrimary =
    'px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 bg-yellow-400 text-emerald-950 hover:brightness-110';
const btnSecondary =
    'px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50';
const selectCls = 'rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700';

const emptyTorneo: CreateTorneoDTO = { name: '', description: '', season: '' };

export default function TorneosPage() {
    const { businesses, loading: loadingBiz, error: errorBiz } = useBusinessesSimple();
    const [businessId, setBusinessId] = useState<number | null>(null);

    const {
        torneos,
        total,
        page,
        pageSize,
        loading: loadingTorneos,
        error: errorTorneos,
        setPage,
        setPageSize,
        create,
    } = useTorneos(businessId);

    const [torneoId, setTorneoId] = useState<number | null>(null);
    const [tab, setTab] = useState<TabKey>('equipos');

    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<CreateTorneoDTO>(emptyTorneo);
    const [saving, setSaving] = useState(false);

    const handleBusinessChange = (value: string) => {
        setBusinessId(value ? Number(value) : null);
        setTorneoId(null);
    };

    const openCreate = () => {
        setForm(emptyTorneo);
        setFormOpen(true);
    };

    const submit = async () => {
        setSaving(true);
        try {
            await create(form);
            setFormOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* Selector de negocio */}
            <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-stone-700">Negocio:</label>
                {loadingBiz ? (
                    <span className="text-sm text-stone-500">Cargando negocios…</span>
                ) : (
                    <select
                        className={selectCls}
                        value={businessId ?? ''}
                        onChange={(e) => handleBusinessChange(e.target.value)}
                    >
                        <option value="">Seleccionar negocio…</option>
                        {businesses.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {errorBiz && <p className="text-sm text-red-600">{errorBiz}</p>}

            {businessId == null ? (
                <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-white p-12 text-center">
                    <p className="text-sm text-stone-500">Selecciona un negocio para ver sus torneos.</p>
                </div>
            ) : (
                <>
                    {/* Selector de torneo */}
                    <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="text-sm font-medium text-stone-700">Torneo:</label>
                            {loadingTorneos ? (
                                <span className="text-sm text-stone-500">Cargando torneos…</span>
                            ) : (
                                <select
                                    className={selectCls}
                                    value={torneoId ?? ''}
                                    onChange={(e) =>
                                        setTorneoId(e.target.value ? Number(e.target.value) : null)
                                    }
                                >
                                    <option value="">Seleccionar torneo…</option>
                                    {torneos.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                            {t.season ? ` (${t.season})` : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <button className={btnPrimary} onClick={openCreate}>
                                + Nuevo torneo
                            </button>
                        </div>

                        {errorTorneos && <p className="text-sm text-red-600">{errorTorneos}</p>}

                        {!loadingTorneos && torneos.length === 0 && (
                            <p className="text-sm text-stone-500">
                                Este negocio aún no tiene torneos. Crea uno para empezar.
                            </p>
                        )}

                        {total > pageSize && (
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
                        )}
                    </div>

                    {torneoId == null ? (
                        <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-white p-12 text-center">
                            <p className="text-sm text-stone-500">Selecciona un torneo para gestionarlo.</p>
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="flex flex-wrap gap-2">
                                {TABS.map((t) => (
                                    <button
                                        key={t.key}
                                        onClick={() => setTab(t.key)}
                                        className={`${tabBase} ${
                                            tab === t.key
                                                ? 'bg-yellow-400 text-emerald-950'
                                                : 'text-stone-600 hover:bg-stone-200'
                                        }`}
                                    >
                                        <span>{t.icon}</span>
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Contenido del tab */}
                            <div className="bg-white rounded-2xl shadow-sm p-5">
                                {tab === 'equipos' && <EquiposTab key={`eq-${torneoId}`} torneoId={torneoId} />}
                                {tab === 'jugadores' && (
                                    <JugadoresTab key={`ju-${torneoId}`} torneoId={torneoId} />
                                )}
                                {tab === 'partidos' && (
                                    <PartidosTab key={`pa-${torneoId}`} torneoId={torneoId} />
                                )}
                                {tab === 'tabla' && <TablaTab key={`ta-${torneoId}`} torneoId={torneoId} />}
                                {tab === 'goleadores' && (
                                    <GoleadoresTab key={`go-${torneoId}`} torneoId={torneoId} />
                                )}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Modal nuevo torneo */}
            <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Nuevo torneo" size="md">
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
                        <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
                        <textarea
                            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                            rows={3}
                            value={form.description || ''}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Temporada</label>
                        <input
                            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                            placeholder="Ej. 2026"
                            value={form.season || ''}
                            onChange={(e) => setForm({ ...form, season: e.target.value })}
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
        </div>
    );
}
