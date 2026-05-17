"use client";

import { useEffect, useState } from "react";
import {
    getActionsAction,
    createActionAction,
} from "@/services/auth/actions/infra/actions";
import type { Action } from "@/services/auth/actions/domain/types";

export function AccionesTab() {
    const [actions, setActions] = useState<Action[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);

    const loadActions = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getActionsAction({ page: 1, page_size: 100 });
            setActions(res.data.actions ?? []);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al cargar acciones");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadActions();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSaving(true);
        setError(null);
        try {
            await createActionAction({
                name: name.trim(),
                description: description.trim() || undefined,
            });
            setName("");
            setDescription("");
            await loadActions();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al crear la acción");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <h2 className="text-lg font-semibold text-emerald-900 mb-4">Acciones</h2>

            {error && (
                <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </p>
            )}

            <form
                onSubmit={handleCreate}
                className="mb-6 flex flex-wrap items-end gap-3"
            >
                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-medium text-stone-600">
                        Nombre
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
                        placeholder="crear, editar..."
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-medium text-stone-600">
                        Descripción
                    </label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
                        placeholder="Opcional"
                    />
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-emerald-950 transition hover:bg-yellow-500 disabled:opacity-50"
                >
                    {saving ? "Guardando..." : "Crear acción"}
                </button>
            </form>

            {loading ? (
                <p className="text-sm text-stone-500">Cargando...</p>
            ) : actions.length === 0 ? (
                <p className="text-sm text-stone-500">No hay acciones registradas.</p>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-stone-200 text-left text-xs uppercase text-stone-500">
                            <th className="py-2 pr-4">ID</th>
                            <th className="py-2 pr-4">Nombre</th>
                            <th className="py-2 pr-4">Descripción</th>
                            <th className="py-2 pr-4">Creado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {actions.map((a) => (
                            <tr key={a.id} className="border-b border-stone-100">
                                <td className="py-2 pr-4 text-stone-500">{a.id}</td>
                                <td className="py-2 pr-4 font-medium text-emerald-900">
                                    {a.name}
                                </td>
                                <td className="py-2 pr-4 text-stone-600">
                                    {a.description || "—"}
                                </td>
                                <td className="py-2 pr-4 text-stone-500">
                                    {new Date(a.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
