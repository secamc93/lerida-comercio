"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import LoginGate from "@/components/LoginGate";
import { useAuth } from "@/lib/auth-context";
import { api, Equipo, Partido, FilaTabla, Jugador } from "@/lib/api";

type Tab = "tabla" | "fixture" | "mi-equipo" | "mis-stats" | "jugadores";

export default function TorneoPage() {
  return (
    <LoginGate>
      <Navbar />
      <Torneo />
    </LoginGate>
  );
}

function Torneo() {
  const { role } = useAuth();
  const [tab, setTab] = useState<Tab>("tabla");

  const tabs: { id: Tab; label: string; roles: string[] }[] = [
    { id: "tabla", label: "Tabla de Posiciones", roles: ["admin", "jugador", "invitado"] },
    { id: "fixture", label: "Calendario", roles: ["admin", "jugador", "invitado"] },
    { id: "mi-equipo", label: "Mi Equipo", roles: ["jugador"] },
    { id: "mis-stats", label: "Mis Estadísticas", roles: ["jugador"] },
    { id: "jugadores", label: "Jugadores", roles: ["admin"] },
  ];
  const visible = tabs.filter((t) => t.roles.includes(role));

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-950 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-4">
          <Link href="/" className="text-emerald-200 hover:text-yellow-300 text-sm">← Volver al directorio</Link>
        </div>
        <header className="text-center mb-8 pb-5 border-b border-white/15">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent">Torneo Fútbol 8</h1>
          <p className="text-emerald-200 tracking-widest text-sm uppercase mt-1">16 Equipos · Todos contra Todos</p>
        </header>

        <div className="flex gap-2 justify-center flex-wrap mb-6">
          {visible.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition border ${
                tab === t.id
                  ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black border-yellow-400 shadow-md"
                  : "bg-white/10 border-white/20 hover:bg-white/20"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "tabla" && <TablaPanel />}
        {tab === "fixture" && <FixturePanel canEdit={role === "admin"} />}
        {tab === "mi-equipo" && <MiEquipoPanel />}
        {tab === "mis-stats" && <MisStatsPanel />}
        {tab === "jugadores" && <JugadoresAdminPanel />}
      </div>
    </main>
  );
}

function iniciales(nombre: string) {
  return nombre.split(" ").filter(Boolean).map((p) => p[0]).join("").substring(0, 2).toUpperCase();
}

function TablaPanel() {
  const [tabla, setTabla] = useState<FilaTabla[]>([]);
  useEffect(() => { api<{ data: FilaTabla[] }>("/api/v1/torneo/tabla", { auth: false }).then((r) => setTabla(r.data)); }, []);

  return (
    <div className="bg-white text-stone-800 rounded-xl overflow-hidden shadow-xl">
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-emerald-950 to-emerald-800 text-white">
          <tr>
            <th className="px-3 py-3">Pos</th>
            <th className="px-3 py-3 text-left">Equipo</th>
            <th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {tabla.map((f, i) => {
            const pos = i + 1;
            const zone = pos === 1 ? "bg-yellow-50" : pos <= 4 ? "bg-green-50" : pos <= 8 ? "bg-blue-50" : pos >= 15 ? "bg-red-50" : "";
            return (
              <tr key={f.equipo_id} className={`border-b ${zone} hover:bg-emerald-50`}>
                <td className="px-3 py-2 text-center font-bold">{pos}</td>
                <td className="px-3 py-2 flex items-center gap-2">
                  <span className="inline-block w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{ background: f.color }}>{iniciales(f.nombre)}</span>
                  {f.nombre}
                </td>
                <td className="text-center">{f.pj}</td>
                <td className="text-center">{f.pg}</td>
                <td className="text-center">{f.pe}</td>
                <td className="text-center">{f.pp}</td>
                <td className="text-center">{f.gf}</td>
                <td className="text-center">{f.gc}</td>
                <td className="text-center"><span className={f.dg > 0 ? "text-green-700" : f.dg < 0 ? "text-red-700" : ""}>{f.dg > 0 ? `+${f.dg}` : f.dg}</span></td>
                <td className="text-center font-bold text-emerald-900">{f.pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FixturePanel({ canEdit }: { canEdit: boolean }) {
  const [jornada, setJornada] = useState(1);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const jornadas = Array.from({ length: 15 }, (_, i) => i + 1);

  async function load() {
    const r = await api<{ data: Partido[] }>(`/api/v1/torneo/partidos?jornada=${jornada}`, { auth: false });
    setPartidos(r.data);
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [jornada]);

  async function updateScore(p: Partido, gl: string, gv: string) {
    const golLocal = gl === "" ? null : parseInt(gl);
    const golVisita = gv === "" ? null : parseInt(gv);
    try {
      await api(`/api/v1/torneo/partidos/${p.id}`, {
        method: "PUT",
        body: JSON.stringify({ gol_local: golLocal, gol_visita: golVisita }),
      });
      load();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 justify-center mb-5">
        {jornadas.map((j) => (
          <button key={j} onClick={() => setJornada(j)}
            className={`px-3 py-1.5 rounded text-sm border transition ${
              jornada === j ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold border-yellow-400" : "bg-white/10 border-white/20 hover:bg-white/20"
            }`}>
            J{j}
          </button>
        ))}
      </div>
      <h2 className="text-center text-yellow-400 text-2xl mb-5 font-semibold">Jornada {jornada}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {partidos.map((p) => (
          <MatchCard key={p.id} partido={p} canEdit={canEdit} onUpdate={updateScore} />
        ))}
      </div>
    </div>
  );
}

function MatchCard({ partido, canEdit, onUpdate }: { partido: Partido; canEdit: boolean; onUpdate: (p: Partido, gl: string, gv: string) => void }) {
  const [gl, setGl] = useState(partido.gol_local?.toString() ?? "");
  const [gv, setGv] = useState(partido.gol_visita?.toString() ?? "");
  useEffect(() => {
    setGl(partido.gol_local?.toString() ?? "");
    setGv(partido.gol_visita?.toString() ?? "");
  }, [partido.id, partido.gol_local, partido.gol_visita]);

  const L = partido.local, V = partido.visita;
  if (!L || !V) return null;

  return (
    <div className={`bg-white text-stone-800 rounded-xl p-4 shadow-md grid grid-cols-[1fr_auto_1fr] items-center gap-3 ${partido.jugado ? "border-l-4 border-green-500" : ""}`}>
      <div className="flex justify-end items-center gap-2 text-right font-semibold text-sm">
        <span>{L.nombre}</span>
        <span className="w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{ background: L.color }}>{iniciales(L.nombre)}</span>
      </div>
      <div className="flex items-center gap-2">
        {canEdit ? (
          <input type="number" min={0} max={99} value={gl}
            onChange={(e) => setGl(e.target.value)}
            onBlur={() => onUpdate(partido, gl, gv)}
            className="w-11 h-9 text-center font-bold border-2 border-stone-300 rounded focus:border-yellow-400 outline-none" />
        ) : <span className="w-11 h-9 inline-flex items-center justify-center bg-stone-100 rounded font-bold">{gl || "—"}</span>}
        <span className="font-bold">vs</span>
        {canEdit ? (
          <input type="number" min={0} max={99} value={gv}
            onChange={(e) => setGv(e.target.value)}
            onBlur={() => onUpdate(partido, gl, gv)}
            className="w-11 h-9 text-center font-bold border-2 border-stone-300 rounded focus:border-yellow-400 outline-none" />
        ) : <span className="w-11 h-9 inline-flex items-center justify-center bg-stone-100 rounded font-bold">{gv || "—"}</span>}
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{ background: V.color }}>{iniciales(V.nombre)}</span>
        <span>{V.nombre}</span>
      </div>
    </div>
  );
}

function MiEquipoPanel() {
  const [data, setData] = useState<{ equipo: Equipo; jugadores: Jugador[] } | null>(null);
  useEffect(() => { api<{ equipo: Equipo; jugadores: Jugador[] }>("/api/v1/torneo/mi-equipo").then(setData).catch(() => {}); }, []);
  if (!data) return <div className="text-center py-10 text-emerald-200">Cargando...</div>;

  return (
    <div>
      <div className="p-5 rounded-t-xl flex items-center gap-4 flex-wrap" style={{ background: `linear-gradient(135deg, ${data.equipo.color}88, rgba(0,0,0,0.4))` }}>
        <span className="w-12 h-12 rounded-full text-base font-bold text-white flex items-center justify-center" style={{ background: data.equipo.color }}>{iniciales(data.equipo.nombre)}</span>
        <h3 className="text-xl text-yellow-400 font-bold flex-1">{data.equipo.nombre}</h3>
        <span className="bg-black/30 px-3 py-1.5 rounded-full text-sm">{data.jugadores.length} jugadores registrados</span>
      </div>
      <div className="bg-white text-stone-800 rounded-b-xl shadow-xl">
        {data.jugadores.length === 0 ? (
          <div className="text-center py-10 text-stone-500">Aún no hay jugadores en este equipo.</div>
        ) : data.jugadores.map((j) => <JugadorRow key={j.id} jugador={j} canEdit={false} />)}
      </div>
    </div>
  );
}

function MisStatsPanel() {
  const [me, setMe] = useState<{ user: Jugador } | null>(null);
  useEffect(() => { api<{ user: Jugador }>("/api/v1/auth/me").then(setMe); }, []);
  if (!me?.user) return <div className="text-center py-10 text-emerald-200">Cargando...</div>;
  const u = me.user;
  const s = u.stats || { goles: 0, asistencias: 0, amarillas: 0, rojas: 0, partidos: 0, jugador_id: u.id };

  return (
    <div>
      <div className="bg-white text-stone-800 rounded-2xl p-6 mb-5 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-5 shadow-xl border-l-4 border-yellow-400">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white" style={{ background: u.equipo?.color || "#666" }}>{iniciales(u.nombre)}</div>
        <div>
          <h3 className="text-2xl text-emerald-900 font-bold">{u.nombre}</h3>
          <div className="text-stone-600 text-sm">{u.equipo?.nombre}</div>
          <div className="mt-1 text-xs">
            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold uppercase">{u.posicion}</span>
          </div>
        </div>
        <div className="bg-emerald-950 text-yellow-400 rounded-xl px-6 py-3 text-center">
          <div className="text-3xl font-bold leading-none">{u.dorsal}</div>
          <div className="text-xs tracking-widest opacity-80">DORSAL</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard icon="⚽" value={s.goles} label="Goles" color="border-green-500" />
        <StatCard icon="🅰️" value={s.asistencias} label="Asistencias" color="border-blue-500" />
        <StatCard icon="🟨" value={s.amarillas} label="Amarillas" color="border-yellow-500" />
        <StatCard icon="🟥" value={s.rojas} label="Rojas" color="border-red-500" />
        <StatCard icon="📋" value={s.partidos} label="Partidos" color="border-gray-500" />
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  return (
    <div className={`bg-white text-stone-800 rounded-xl p-5 text-center shadow-md border-t-4 ${color}`}>
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-3xl font-bold text-emerald-900">{value}</div>
      <div className="text-xs uppercase tracking-widest text-stone-500 mt-1">{label}</div>
    </div>
  );
}

function JugadoresAdminPanel() {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [search, setSearch] = useState("");
  const [equipoFilter, setEquipoFilter] = useState<string>("all");
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [editing, setEditing] = useState<Jugador | null>(null);

  async function load() {
    const r = await api<{ data: Jugador[] }>("/api/v1/torneo/jugadores");
    setJugadores(r.data);
  }
  useEffect(() => {
    load();
    api<{ data: Equipo[] }>("/api/v1/torneo/equipos", { auth: false }).then((r) => setEquipos(r.data));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jugadores.filter((j) => {
      const matchEq = equipoFilter === "all" || j.equipo_id === parseInt(equipoFilter);
      const matchQ = !q || j.nombre.toLowerCase().includes(q) || j.username.toLowerCase().includes(q);
      return matchEq && matchQ;
    });
  }, [jugadores, search, equipoFilter]);

  const grouped = useMemo(() => {
    const g: Record<number, Jugador[]> = {};
    filtered.forEach((j) => {
      if (!g[j.equipo_id]) g[j.equipo_id] = [];
      g[j.equipo_id].push(j);
    });
    return g;
  }, [filtered]);

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-5">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Buscar jugador..."
          className="flex-1 p-2 rounded bg-white/10 border border-white/25 text-white placeholder-white/60" />
        <select value={equipoFilter} onChange={(e) => setEquipoFilter(e.target.value)}
          className="p-2 rounded bg-white/10 border border-white/25 text-white">
          <option value="all" className="bg-emerald-950">Todos los equipos</option>
          {equipos.map((e) => (<option key={e.id} value={e.id} className="bg-emerald-950">{e.nombre}</option>))}
        </select>
        <span className="ml-auto text-emerald-200 text-sm self-center">{filtered.length} jugador(es)</span>
      </div>

      {jugadores.length === 0 ? (
        <div className="text-center py-12 text-emerald-200">
          <div className="text-5xl mb-3 opacity-60">👥</div>
          <h3 className="text-xl text-yellow-400 mb-2">Aún no hay jugadores registrados</h3>
          <p className="text-sm">Cuando los jugadores se registren aparecerán aquí.</p>
        </div>
      ) : (
        Object.keys(grouped).map((eqId) => {
          const equipo = equipos.find((e) => e.id === parseInt(eqId));
          const list = grouped[parseInt(eqId)].sort((a, b) => a.dorsal - b.dorsal);
          return (
            <div key={eqId} className="mb-6">
              <div className="p-4 rounded-t-xl flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${equipo?.color || "#666"}88, rgba(0,0,0,0.4))` }}>
                <span className="w-10 h-10 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{ background: equipo?.color }}>{iniciales(equipo?.nombre || "?")}</span>
                <h3 className="text-yellow-400 font-bold">{equipo?.nombre}</h3>
                <span className="ml-auto text-sm text-emerald-200">{list.length}</span>
              </div>
              <div className="bg-white text-stone-800 rounded-b-xl shadow-xl">
                {list.map((j) => <JugadorRow key={j.id} jugador={j} canEdit onEdit={() => setEditing(j)} />)}
              </div>
            </div>
          );
        })
      )}

      {editing && (
        <StatsModal jugador={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      )}
    </div>
  );
}

function JugadorRow({ jugador, canEdit, onEdit }: { jugador: Jugador; canEdit: boolean; onEdit?: () => void }) {
  const s = jugador.stats || { goles: 0, asistencias: 0, amarillas: 0, rojas: 0, partidos: 0 };
  return (
    <div className="grid grid-cols-[50px_1fr_auto] items-center gap-4 p-3.5 border-b last:border-b-0 hover:bg-emerald-50">
      <div className="w-10 h-10 rounded-lg bg-emerald-950 text-yellow-400 flex items-center justify-center font-bold">{jugador.dorsal}</div>
      <div>
        <div className="font-bold text-emerald-900 flex items-center gap-2 flex-wrap">
          {jugador.nombre}
          <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{jugador.posicion}</span>
        </div>
        <div className="text-xs text-stone-600 flex gap-3 flex-wrap mt-1">
          <span>⚽ {s.goles}</span>
          <span>🅰️ {s.asistencias}</span>
          <span>🟨 {s.amarillas}</span>
          <span>🟥 {s.rojas}</span>
          <span>📋 {s.partidos}</span>
        </div>
      </div>
      {canEdit && (
        <button onClick={onEdit} className="bg-stone-100 hover:bg-yellow-400 px-3 py-1.5 rounded text-sm">✏️ Stats</button>
      )}
    </div>
  );
}

function StatsModal({ jugador, onClose, onSaved }: { jugador: Jugador; onClose: () => void; onSaved: () => void }) {
  const s = jugador.stats || { goles: 0, asistencias: 0, amarillas: 0, rojas: 0, partidos: 0, jugador_id: jugador.id };
  const [form, setForm] = useState(s);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    setBusy(true); setErr("");
    try {
      await api(`/api/v1/torneo/jugadores/${jugador.id}/stats`, { method: "PUT", body: JSON.stringify(form) });
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally { setBusy(false); }
  }

  async function del() {
    if (!confirm(`¿Eliminar a "${jugador.nombre}"?`)) return;
    setBusy(true);
    try {
      await api(`/api/v1/torneo/jugadores/${jugador.id}`, { method: "DELETE" });
      onSaved();
    } catch (e) {
      alert((e as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-950 border border-yellow-400/30 rounded-2xl p-7 w-full max-w-md text-white shadow-2xl">
        <h2 className="text-2xl font-bold text-yellow-400 text-center mb-1">📊 Editar estadísticas</h2>
        <p className="text-yellow-300 text-center text-sm mb-5"><strong>{jugador.nombre}</strong> · #{jugador.dorsal}</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {(["goles","asistencias","amarillas","rojas","partidos"] as const).map((k) => (
            <div key={k}>
              <label className="text-xs text-emerald-100 uppercase tracking-wider">{k}</label>
              <input type="number" min={0} value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 rounded-lg bg-black/30 border-2 border-white/20 focus:border-yellow-400 outline-none mt-1" />
            </div>
          ))}
        </div>
        {err && <p className="text-red-300 text-sm">{err}</p>}
        <div className="flex flex-col gap-2 mt-4">
          <button onClick={save} disabled={busy}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold disabled:opacity-50">
            {busy ? "..." : "Guardar"}
          </button>
          <button onClick={onClose} className="w-full py-2 rounded-lg bg-white/10 border border-white/30 font-semibold">Cancelar</button>
          <button onClick={del} className="text-red-300 underline text-sm">Eliminar jugador</button>
        </div>
      </div>
    </div>
  );
}
