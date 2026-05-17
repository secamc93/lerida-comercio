'use client';

import { useTabla } from '../hooks/useTabla';

interface Props {
    torneoId: number;
}

export function TablaTab({ torneoId }: Props) {
    const { tabla, loading, error } = useTabla(torneoId);

    return (
        <div>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-emerald-950 text-white">
                        <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">#</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Equipo</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">PJ</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">PG</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">PE</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">PP</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">GF</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">GC</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">DG</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">PTS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={10} className="px-4 py-8 text-center text-stone-400">
                                    Cargando…
                                </td>
                            </tr>
                        ) : tabla.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="px-4 py-8 text-center text-stone-400">
                                    Sin datos de posiciones
                                </td>
                            </tr>
                        ) : (
                            tabla.map((row, idx) => (
                                <tr
                                    key={row.equipo_id}
                                    className="border-t border-stone-100 hover:bg-stone-50 transition-colors"
                                >
                                    <td className="px-4 py-2.5 text-stone-500">{idx + 1}</td>
                                    <td className="px-4 py-2.5 text-stone-700">
                                        <span className="inline-flex items-center gap-2">
                                            <span
                                                className="inline-block h-3 w-3 rounded-full border border-stone-300"
                                                style={{ backgroundColor: row.color || '#ccc' }}
                                            />
                                            {row.equipo_name}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-center text-stone-700">{row.pj}</td>
                                    <td className="px-4 py-2.5 text-center text-stone-700">{row.pg}</td>
                                    <td className="px-4 py-2.5 text-center text-stone-700">{row.pe}</td>
                                    <td className="px-4 py-2.5 text-center text-stone-700">{row.pp}</td>
                                    <td className="px-4 py-2.5 text-center text-stone-700">{row.gf}</td>
                                    <td className="px-4 py-2.5 text-center text-stone-700">{row.gc}</td>
                                    <td className="px-4 py-2.5 text-center text-stone-700">{row.dg}</td>
                                    <td className="px-4 py-2.5 text-center font-semibold text-emerald-800">{row.pts}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
