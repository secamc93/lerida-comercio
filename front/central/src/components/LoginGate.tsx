"use client";

import { useEffect, useState } from "react";
import { useAuth, RegisterInput } from "@/lib/auth-context";
import { api, Equipo } from "@/lib/api";

type Step = "choose" | "admin" | "jugador" | "register";

export default function LoginGate({ children }: { children: React.ReactNode }) {
  const { role, loading, invitadoChosen, loginAdmin, loginJugador, registerJugador, loginInvitado } = useAuth();
  const [step, setStep] = useState<Step>("choose");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Form states
  const [adminUser, setAdminUser] = useState("admin");
  const [adminPw, setAdminPw] = useState("");
  const [jugUser, setJugUser] = useState("");
  const [jugPw, setJugPw] = useState("");
  const [reg, setReg] = useState<RegisterInput>({
    username: "", password: "", nombre: "", equipo_id: 0, posicion: "delantero", dorsal: 10,
  });
  const [regPw2, setRegPw2] = useState("");
  const [equipos, setEquipos] = useState<Equipo[]>([]);

  useEffect(() => {
    if (step === "register" && equipos.length === 0) {
      api<{ data: Equipo[] }>("/api/v1/torneo/equipos", { auth: false })
        .then((r) => {
          setEquipos(r.data);
          if (r.data.length > 0) setReg((p) => ({ ...p, equipo_id: r.data[0].id }));
        })
        .catch(() => setErr("No se pudieron cargar equipos"));
    }
  }, [step, equipos.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-950 text-white">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }
  if (role !== "invitado" || invitadoChosen) {
    return <>{children}</>;
  }

  async function handleAdmin() {
    setErr(""); setBusy(true);
    try {
      await loginAdmin(adminUser, adminPw);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally { setBusy(false); }
  }

  async function handleJugador() {
    setErr(""); setBusy(true);
    try {
      await loginJugador(jugUser, jugPw);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally { setBusy(false); }
  }

  async function handleRegister() {
    setErr("");
    if (reg.password !== regPw2) { setErr("Las contraseñas no coinciden"); return; }
    if (reg.password.length < 4) { setErr("Contraseña mínima 4 caracteres"); return; }
    if (reg.dorsal < 1 || reg.dorsal > 99) { setErr("Dorsal entre 1 y 99"); return; }
    setBusy(true);
    try {
      await registerJugador(reg);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-950 p-4">
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-950 border border-yellow-400/30 rounded-2xl shadow-2xl p-8 w-full max-w-md text-white">

        {step === "choose" && (
          <>
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-6xl animate-bounce">⚽</div>
              <div className="text-6xl animate-pulse">🏆</div>
            </div>
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-2">Lérida Comercio</h2>
            <p className="text-emerald-100 text-center mb-6">Selecciona cómo deseas ingresar</p>
            <div className="space-y-3">
              <button onClick={() => setStep("admin")}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold hover:brightness-110 transition">
                🔐 Soy Administrador
              </button>
              <button onClick={() => setStep("jugador")}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-800 text-white font-bold hover:brightness-110 transition">
                👤 Soy Jugador
              </button>
              <button onClick={loginInvitado}
                className="w-full py-3 rounded-lg bg-white/10 border border-white/30 text-white font-semibold hover:bg-white/20 transition">
                👁️ Ingresar como Invitado
              </button>
            </div>
          </>
        )}

        {step === "admin" && (
          <>
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-2">🔐 Administrador</h2>
            <p className="text-emerald-100 text-center mb-6 text-sm">Usuario por defecto: <code>admin / admin123</code></p>
            <input className="w-full p-3 rounded-lg bg-black/30 border-2 border-white/20 mb-3 focus:border-yellow-400 outline-none"
              placeholder="Usuario" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} autoComplete="off" />
            <input className="w-full p-3 rounded-lg bg-black/30 border-2 border-white/20 mb-3 focus:border-yellow-400 outline-none"
              type="password" placeholder="Contraseña" value={adminPw} onChange={(e) => setAdminPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdmin()} autoComplete="off" />
            {err && <p className="text-red-300 text-sm mb-3">{err}</p>}
            <div className="flex gap-2">
              <button onClick={() => setStep("choose")} className="flex-1 py-3 rounded-lg bg-white/10 border border-white/30 font-semibold">← Volver</button>
              <button onClick={handleAdmin} disabled={busy}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold disabled:opacity-50">
                {busy ? "..." : "Ingresar"}
              </button>
            </div>
          </>
        )}

        {step === "jugador" && (
          <>
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-2">👤 Jugador</h2>
            <p className="text-emerald-100 text-center mb-6 text-sm">Ingresa con tu cuenta</p>
            <input className="w-full p-3 rounded-lg bg-black/30 border-2 border-white/20 mb-3 focus:border-yellow-400 outline-none"
              placeholder="Usuario" value={jugUser} onChange={(e) => setJugUser(e.target.value)} autoComplete="off" />
            <input className="w-full p-3 rounded-lg bg-black/30 border-2 border-white/20 mb-3 focus:border-yellow-400 outline-none"
              type="password" placeholder="Contraseña" value={jugPw} onChange={(e) => setJugPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJugador()} autoComplete="off" />
            {err && <p className="text-red-300 text-sm mb-3">{err}</p>}
            <div className="space-y-2">
              <button onClick={handleJugador} disabled={busy}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-800 text-white font-bold disabled:opacity-50">
                {busy ? "..." : "Ingresar"}
              </button>
              <button onClick={() => { setErr(""); setStep("register"); }}
                className="w-full py-2 text-yellow-300 underline text-sm">¿No tienes cuenta? Regístrate</button>
              <button onClick={() => setStep("choose")} className="w-full py-2 text-emerald-200 text-sm">← Volver</button>
            </div>
          </>
        )}

        {step === "register" && (
          <>
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-2">📝 Registro de Jugador</h2>
            <p className="text-emerald-100 text-center mb-4 text-sm">Crea tu cuenta</p>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              <input className="w-full p-2.5 rounded-lg bg-black/30 border-2 border-white/20 focus:border-yellow-400 outline-none"
                placeholder="Nombre completo" value={reg.nombre} onChange={(e) => setReg({ ...reg, nombre: e.target.value })} />
              <input className="w-full p-2.5 rounded-lg bg-black/30 border-2 border-white/20 focus:border-yellow-400 outline-none"
                placeholder="Usuario único" value={reg.username} onChange={(e) => setReg({ ...reg, username: e.target.value })} autoComplete="off" />
              <div className="grid grid-cols-2 gap-2">
                <input className="p-2.5 rounded-lg bg-black/30 border-2 border-white/20 focus:border-yellow-400 outline-none"
                  type="password" placeholder="Contraseña" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} autoComplete="off" />
                <input className="p-2.5 rounded-lg bg-black/30 border-2 border-white/20 focus:border-yellow-400 outline-none"
                  type="password" placeholder="Confirmar" value={regPw2} onChange={(e) => setRegPw2(e.target.value)} autoComplete="off" />
              </div>
              <select className="w-full p-2.5 rounded-lg bg-black/30 border-2 border-white/20 focus:border-yellow-400 outline-none"
                value={reg.equipo_id} onChange={(e) => setReg({ ...reg, equipo_id: parseInt(e.target.value) })}>
                {equipos.map((e) => (
                  <option key={e.id} value={e.id} className="bg-emerald-950">{e.nombre}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <select className="p-2.5 rounded-lg bg-black/30 border-2 border-white/20 focus:border-yellow-400 outline-none"
                  value={reg.posicion} onChange={(e) => setReg({ ...reg, posicion: e.target.value })}>
                  <option value="portero" className="bg-emerald-950">Portero</option>
                  <option value="defensa" className="bg-emerald-950">Defensa</option>
                  <option value="medio" className="bg-emerald-950">Medio</option>
                  <option value="delantero" className="bg-emerald-950">Delantero</option>
                </select>
                <input className="p-2.5 rounded-lg bg-black/30 border-2 border-white/20 focus:border-yellow-400 outline-none"
                  type="number" min={1} max={99} placeholder="Dorsal"
                  value={reg.dorsal} onChange={(e) => setReg({ ...reg, dorsal: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            {err && <p className="text-red-300 text-sm mt-3">{err}</p>}
            <div className="flex gap-2 mt-3">
              <button onClick={() => setStep("jugador")} className="flex-1 py-3 rounded-lg bg-white/10 border border-white/30 font-semibold">← Volver</button>
              <button onClick={handleRegister} disabled={busy}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-800 text-white font-bold disabled:opacity-50">
                {busy ? "..." : "Registrarme"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
