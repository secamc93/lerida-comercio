'use client';

import { useGoleadores } from '../hooks/useGoleadores';

interface Props {
    torneoId: number;
}

export function GoleadoresTab({ torneoId }: Props) {
    const { goleadores, loading, error } = useGoleadores(torneoId);

    return (
        <div>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-emerald-950 text-white">
                        <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">#</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Jugador</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">Equipo</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">Goles</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">Asist.</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">Amar.</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider">Rojas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-stone-400">
                                    Cargando…
                                </td>
                            </tr>
                        ) : goleadores.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-stone-400">
                                    Sin datos de goleadores
                                </td>
                            </tr>
                        ) : (
                            goleadores.map((g, idx) => (
                                <tr
                                    key={g.jugador_id}
                                    className="border-t border-stone-100 hover:bg-stone-50 transition-colors"
                                >
                                    <td className="px-4 py-2.5 text-stone-500">{idx + 1}</td>
                                    <td className="px-4 py-2.5 text-stone-700">{g.jugador_name}</td>
                                    <td className="px-4 py-2.5 text-stone-500">{g.equipo_name || '—'}</td>
                                    <td className="px-4 py-2.5 text-center font-semibold text-emerald-800">{g.goles}</td>
                                    <td className="px-4 py-2.5 text-center text-stone-700">{g.asistencias}</td>
                                    <td className="px-4 py-2.5 text-center text-yellow-700">{g.amarillas}</td>
                                    <td className="px-4 py-2.5 text-center text-red-600">{g.rojas}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
