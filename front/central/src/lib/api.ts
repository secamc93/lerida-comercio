"use client";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3050";
const TOKEN_KEY = "lerida_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t: string | null) {
  if (typeof window === "undefined") return;
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function api<T = unknown>(
  path: string,
  opts: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Client-Type": "api",
    ...(opts.headers as Record<string, string>),
  };
  if (opts.auth !== false) {
    const tok = getToken();
    if (tok) headers["Authorization"] = `Bearer ${tok}`;
  }
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = j.error || msg;
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Tipos
export interface Categoria {
  id: number;
  slug: string;
  nombre: string;
  icon: string;
  color: string;
  orden: number;
}

export interface Comercio {
  id: number;
  nombre: string;
  categoria_id: number;
  icon: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  horario: string;
  rating: number;
  activo: boolean;
  categoria?: Categoria;
}

export interface Equipo {
  id: number;
  nombre: string;
  color: string;
}

export interface JugadorStats {
  jugador_id: number;
  goles: number;
  asistencias: number;
  amarillas: number;
  rojas: number;
  partidos: number;
}

export interface Jugador {
  id: number;
  username: string;
  nombre: string;
  equipo_id: number;
  posicion: string;
  dorsal: number;
  equipo?: Equipo;
  stats?: JugadorStats;
}

export interface Partido {
  id: number;
  jornada: number;
  orden_jornada: number;
  local_equipo_id: number;
  visita_equipo_id: number;
  gol_local: number | null;
  gol_visita: number | null;
  jugado: boolean;
  local?: Equipo;
  visita?: Equipo;
}

export interface FilaTabla {
  equipo_id: number;
  nombre: string;
  color: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
}

export type Rol = "admin" | "jugador" | "invitado";
