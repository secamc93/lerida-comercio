"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { legacyLogoutAction } from "@/lib/auth-actions";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: string;
}

const NAV: NavItem[] = [
  { href: "/panel/iam", label: "IAM", icon: "🛡️" },
  { href: "/panel/negocios", label: "Negocios", icon: "🏢" },
  { href: "/panel/torneos", label: "Torneos", icon: "🏆", badge: "Pronto" },
];

const STORAGE_KEY = "panel_sidebar_collapsed";

export function PanelSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  // Valor por defecto fijo para que SSR y primer render del cliente coincidan.
  const [collapsed, setCollapsed] = useState(false);

  // Restaura la preferencia desde localStorage tras el montaje (evita
  // mismatch de hidratación).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) setCollapsed(stored === "true");
    } catch {
      /* localStorage no disponible: se mantiene el valor por defecto */
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* ignorar errores de almacenamiento */
      }
      return next;
    });
  }

  async function handleLogout() {
    await legacyLogoutAction();
    router.push("/login");
  }

  const expanded = !collapsed;

  return (
    <aside
      className={`${
        expanded ? "w-60" : "w-16"
      } relative shrink-0 bg-gradient-to-b from-emerald-950 to-emerald-900 text-white flex flex-col transition-all duration-200 sticky top-0 h-screen`}
    >
      {/* Botón flotante de toggle en el borde derecho */}
      <button
        onClick={toggleCollapsed}
        title={expanded ? "Colapsar menú" : "Expandir menú"}
        aria-label={expanded ? "Colapsar menú" : "Expandir menú"}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-emerald-950 text-xs font-bold shadow-md transition hover:bg-yellow-300"
      >
        {expanded ? "«" : "»"}
      </button>

      {/* Logo / marca */}
      <div
        className={`flex items-center h-16 border-b border-white/10 ${
          expanded ? "gap-2 px-4" : "justify-center px-0"
        }`}
      >
        <span className="text-2xl">🏪</span>
        {expanded && (
          <div className="leading-tight">
            <div className="font-bold text-sm">Lérida Comercio</div>
            <div className="text-[10px] text-emerald-300 uppercase tracking-widest">
              Panel
            </div>
          </div>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                expanded ? "gap-3" : "justify-center"
              } ${
                active
                  ? "bg-yellow-400 text-emerald-950"
                  : "text-emerald-100 hover:bg-white/10"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {expanded && (
                <span className="flex-1 flex items-center justify-between">
                  {item.label}
                  {item.badge && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Pie: usuario + acciones */}
      <div className="border-t border-white/10 p-3 space-y-1">
        {expanded && (
          <div className="px-2 py-1 text-xs text-emerald-300 truncate">
            {email}
          </div>
        )}
        <Link
          href="/"
          title="Ir al sitio público"
          className={`flex items-center px-3 py-2 rounded-lg text-sm text-emerald-100 hover:bg-white/10 transition ${
            expanded ? "gap-3" : "justify-center"
          }`}
        >
          <span className="text-lg">🌐</span>
          {expanded && <span>Ver sitio</span>}
        </Link>
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className={`w-full flex items-center px-3 py-2 rounded-lg text-sm text-red-200 hover:bg-red-600/30 transition ${
            expanded ? "gap-3" : "justify-center"
          }`}
        >
          <span className="text-lg">⏻</span>
          {expanded && <span>Salir</span>}
        </button>
      </div>
    </aside>
  );
}
