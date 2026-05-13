"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import LoginGate from "@/components/LoginGate";
import { useAuth } from "@/lib/auth-context";
import { api, Categoria, Comercio } from "@/lib/api";

export default function HomePage() {
  return (
    <LoginGate>
      <Navbar />
      <Directorio />
    </LoginGate>
  );
}

function Directorio() {
  const { role } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [search, setSearch] = useState("");
  const [catActiva, setCatActiva] = useState<number | "todos">("todos");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Comercio | null>(null);

  async function reload() {
    const [c, b] = await Promise.all([
      api<{ data: Categoria[] }>("/api/v1/categorias", { auth: false }),
      api<{ data: Comercio[] }>("/api/v1/comercios", { auth: false }),
    ]);
    setCategorias(c.data);
    setComercios(b.data);
  }

  useEffect(() => { reload(); }, []);

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    return comercios.filter((c) => {
      const matchCat = catActiva === "todos" || c.categoria_id === catActiva;
      const matchQ = !q ||
        c.nombre.toLowerCase().includes(q) ||
        c.descripcion.toLowerCase().includes(q) ||
        c.categoria?.nombre.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [comercios, search, catActiva]);

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este comercio?")) return;
    try {
      await api(`/api/v1/comercios/${id}`, { method: "DELETE" });
      reload();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <main className="min-h-screen">
      <section className="relative bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-950 text-white py-14 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent mb-3">
          Descubre Lérida
        </h1>
        <p className="text-emerald-100 mb-8">Encuentra todos los comercios, servicios y eventos de tu ciudad</p>
        <div className="relative max-w-xl mx-auto z-10">
          <div className="bg-white rounded-full pl-6 pr-1 py-1 flex items-center gap-2 shadow-xl">
            <span className="text-xl">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar comercios..."
              className="flex-1 py-2 outline-none text-stone-800"
            />
            <button className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold px-6 py-2.5 rounded-full hover:brightness-110">
              Buscar
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link href="/torneo" className="block mb-10">
          <div className="bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-950 border border-yellow-400/30 rounded-2xl p-7 text-white shadow-2xl relative overflow-hidden hover:scale-[1.01] transition">
            <div className="absolute -right-6 -bottom-10 text-[14rem] opacity-10 rotate-[-15deg] select-none">⚽</div>
            <span className="inline-block bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-3">⭐ EVENTO DESTACADO</span>
            <h3 className="text-3xl font-bold text-yellow-400 mb-2">Torneo de Fútbol 8</h3>
            <p className="text-emerald-100 max-w-lg mb-4">16 equipos compitiendo todos contra todos. Tabla de posiciones en vivo, calendario y estadísticas.</p>
            <span className="inline-block bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold px-6 py-3 rounded-full shadow-md">Ver Torneo →</span>
          </div>
        </Link>

        <h2 className="text-2xl text-emerald-950 mb-1 flex items-center gap-2 font-bold">📂 Categorías</h2>
        <p className="text-stone-500 mb-5">Explora los comercios por tipo de servicio</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-12">
          <button onClick={() => setCatActiva("todos")}
            className={`p-4 rounded-xl text-center shadow-sm transition border-2 ${
              catActiva === "todos" ? "bg-gradient-to-br from-emerald-950 to-emerald-800 text-white border-yellow-400" : "bg-white border-transparent hover:border-yellow-400"
            }`}>
            <div className="text-2xl mb-1">🌐</div>
            <div className="text-sm font-semibold">Todos</div>
            <div className="text-xs opacity-70">{comercios.length}</div>
          </button>
          {categorias.map((c) => (
            <button key={c.id} onClick={() => setCatActiva(c.id)}
              className={`p-4 rounded-xl text-center shadow-sm transition border-2 ${
                catActiva === c.id ? "bg-gradient-to-br from-emerald-950 to-emerald-800 text-white border-yellow-400" : "bg-white border-transparent hover:border-yellow-400"
              }`}>
              <div className="text-2xl mb-1">{c.icon}</div>
              <div className="text-sm font-semibold">{c.nombre}</div>
              <div className="text-xs opacity-70">{comercios.filter((x) => x.categoria_id === c.id).length}</div>
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center flex-wrap gap-3 mb-5">
          <div>
            <h2 className="text-2xl text-emerald-950 flex items-center gap-2 font-bold">🏬 Comercios Locales</h2>
            <p className="text-stone-500 text-sm">{filtrados.length} comercios disponibles</p>
          </div>
          {role === "admin" && (
            <button onClick={() => { setEditing(null); setShowForm(true); }}
              className="bg-gradient-to-r from-emerald-700 to-emerald-950 text-white px-5 py-2.5 rounded-full font-semibold shadow-md hover:brightness-110">
              ➕ Agregar comercio
            </button>
          )}
        </div>

        {filtrados.length === 0 ? (
          <div className="text-center py-16 text-stone-500">
            <div className="text-5xl mb-3 opacity-50">🔍</div>
            No se encontraron comercios.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtrados.map((c) => {
              const cat = categorias.find((k) => k.id === c.categoria_id);
              return (
                <div key={c.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition relative overflow-hidden">
                  {role === "admin" && (
                    <div className="absolute top-3 right-3 z-10 flex gap-1">
                      <button onClick={() => { setEditing(c); setShowForm(true); }}
                        className="w-8 h-8 rounded-full bg-white shadow text-sm hover:bg-yellow-400">✏️</button>
                      <button onClick={() => handleDelete(c.id)}
                        className="w-8 h-8 rounded-full bg-white shadow text-sm hover:bg-red-500 hover:text-white">🗑️</button>
                    </div>
                  )}
                  <div className="p-6 text-white flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${cat?.color || "#666"}, ${cat?.color || "#666"}cc)` }}>
                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">{c.icon || cat?.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{c.nombre}</div>
                      <div className="text-xs opacity-90">{cat?.nombre}</div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-stone-600 mb-3">{c.descripcion}</p>
                    <div className="space-y-1 text-xs text-stone-500">
                      {c.direccion && <div>📍 {c.direccion}</div>}
                      {c.telefono && <div>📞 {c.telefono}</div>}
                      {c.horario && <div>🕒 {c.horario}</div>}
                    </div>
                    <div className="border-t mt-3 pt-3 text-sm">
                      <span className="text-yellow-500 tracking-wider">{"★".repeat(c.rating)}{"☆".repeat(5 - c.rating)}</span>
                      <span className="text-stone-500 ml-2">{c.rating}.0</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <ComercioForm
          comercio={editing}
          categorias={categorias}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); reload(); }}
        />
      )}
    </main>
  );
}

function ComercioForm({
  comercio, categorias, onClose, onSaved,
}: {
  comercio: Comercio | null;
  categorias: Categoria[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    nombre: comercio?.nombre || "",
    categoria_id: comercio?.categoria_id || (categorias[0]?.id || 0),
    icon: comercio?.icon || "",
    descripcion: comercio?.descripcion || "",
    direccion: comercio?.direccion || "",
    telefono: comercio?.telefono || "",
    horario: comercio?.horario || "",
    rating: comercio?.rating || 5,
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setErr(""); setBusy(true);
    try {
      if (comercio) {
        await api(`/api/v1/comercios/${comercio.id}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await api(`/api/v1/comercios`, { method: "POST", body: JSON.stringify(form) });
      }
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-950 border border-yellow-400/30 rounded-2xl p-7 w-full max-w-lg text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-yellow-400 text-center mb-1">{comercio ? "Editar" : "Agregar"} comercio</h2>
        <p className="text-emerald-100 text-center text-sm mb-5">Completa los datos del negocio</p>

        <div className="space-y-3">
          <input className="w-full p-2.5 rounded-lg bg-black/30 border-2 border-white/20 focus:border-yellow-400 outline-none"
            placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <select className="p-2.5 rounded-lg bg-black/30 border-2 border-white/20 focus:border-yellow-400 outline-none"
              value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: parseInt(e.target.value) })}>
              {categorias.map((c) => (
                <option key={c.id} value={c.id} className="bg-emerald-950">{c.icon} {c.nombre}</option>
              ))}
            </select>
            <input className="p-2.5 rounded-lg bg-black/30 border-2 border-white/20 focus:border-yellow-400 outline-none"
              placeholder="Icono" maxLength={4} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          </div>
          <textarea className="w-full p-2.5 rounded-lg bg-black/30 border-2 border-white/20 focus:border-yellow-400 outline-none min-h-[80px]"
            placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          <input className="w-full p-2.5 rounded-lg bg-black/30 border-2 border-white/20 focus:border-yellow-400 outline-none"
            placeholder="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className="p-2.5 rounded-lg bg-black/30 border-2 border-white/20 focus:border-yellow-400 outline-none"
              placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            <select className="p-2.5 rounded-lg bg-black/30 border-2 border-white/20 focus:border-yellow-400 outline-none"
              value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })}>
              {[5,4,3,2,1].map((r) => (
                <option key={r} value={r} className="bg-emerald-950">{"★".repeat(r)}{"☆".repeat(5-r)} ({r})</option>
              ))}
            </select>
          </div>
          <input className="w-full p-2.5 rounded-lg bg-black/30 border-2 border-white/20 focus:border-yellow-400 outline-none"
            placeholder="Horario" value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} />
        </div>

        {err && <p className="text-red-300 text-sm mt-3">{err}</p>}
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-3 rounded-lg bg-white/10 border border-white/30 font-semibold">Cancelar</button>
          <button onClick={save} disabled={busy}
            className="flex-1 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold disabled:opacity-50">
            {busy ? "..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
