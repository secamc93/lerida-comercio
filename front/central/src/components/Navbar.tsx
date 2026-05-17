"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { role, user, logout } = useAuth();

  const roleLabel =
    role === "admin"
      ? "Administrador"
      : role === "jugador"
      ? `Jugador: ${(user as { nombre?: string })?.nombre ?? user?.username ?? ""}`
      : "Invitado";

  const roleColor =
    role === "admin"
      ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
      : role === "jugador"
      ? "bg-green-700 text-white"
      : "bg-blue-500/30 text-blue-100 border border-blue-400/50";

  return (
    <nav className="bg-gradient-to-r from-emerald-950 to-emerald-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-xl shadow-md">
            🏪
          </div>
          <div>
            <div className="font-bold text-lg leading-none">Lérida Comercio</div>
            <div className="text-[10px] text-emerald-200 tracking-widest uppercase">Directorio Digital</div>
          </div>
        </Link>

        <div className="flex items-center gap-4 flex-wrap text-sm">
          <Link href="/" className="hover:text-yellow-300 transition">Comercios</Link>
          <Link href="/torneo" className="hover:text-yellow-300 transition">Torneo ⚽</Link>
          {role === "admin" && (
            <Link
              href="/panel"
              className="bg-yellow-400/20 border border-yellow-400/50 text-yellow-200 hover:bg-yellow-400/30 px-3 py-1 rounded text-xs font-semibold transition"
            >
              ⚙️ Panel
            </Link>
          )}

          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColor}`}>
            ● {roleLabel}
          </span>

          <button
            onClick={logout}
            className="bg-red-600/40 hover:bg-red-600/70 border border-red-400/60 px-3 py-1 rounded text-xs font-semibold"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
