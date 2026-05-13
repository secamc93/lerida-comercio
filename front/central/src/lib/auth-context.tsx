"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, getToken, setToken, Rol } from "./api";

interface MeResponse {
  role: string;
  user: { id: number; username?: string; nombre?: string };
}

interface AuthCtx {
  role: Rol;
  user: MeResponse["user"] | null;
  loading: boolean;
  loginAdmin: (username: string, password: string) => Promise<void>;
  loginJugador: (username: string, password: string) => Promise<void>;
  registerJugador: (input: RegisterInput) => Promise<void>;
  loginInvitado: () => void;
  logout: () => void;
}

export interface RegisterInput {
  username: string;
  password: string;
  nombre: string;
  equipo_id: number;
  posicion: string;
  dorsal: number;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Rol>("invitado");
  const [user, setUser] = useState<MeResponse["user"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tok = getToken();
    const savedInvitado = typeof window !== "undefined" && localStorage.getItem("lerida_invitado") === "1";
    if (!tok && !savedInvitado) {
      setLoading(false);
      return;
    }
    if (savedInvitado && !tok) {
      setRole("invitado");
      setLoading(false);
      return;
    }
    api<MeResponse>("/api/v1/auth/me")
      .then((d) => {
        setRole(d.role as Rol);
        setUser(d.user);
      })
      .catch(() => {
        setToken(null);
        setRole("invitado");
      })
      .finally(() => setLoading(false));
  }, []);

  async function loginAdmin(username: string, password: string) {
    const d = await api<{ token: string; user: MeResponse["user"] }>(
      "/api/v1/auth/login/admin",
      { method: "POST", body: JSON.stringify({ username, password }), auth: false }
    );
    setToken(d.token);
    setRole("admin");
    setUser(d.user);
    localStorage.removeItem("lerida_invitado");
  }

  async function loginJugador(username: string, password: string) {
    const d = await api<{ token: string; user: MeResponse["user"] }>(
      "/api/v1/auth/login/jugador",
      { method: "POST", body: JSON.stringify({ username, password }), auth: false }
    );
    setToken(d.token);
    setRole("jugador");
    setUser(d.user);
    localStorage.removeItem("lerida_invitado");
  }

  async function registerJugador(input: RegisterInput) {
    const d = await api<{ token: string; user: MeResponse["user"] }>(
      "/api/v1/auth/register/jugador",
      { method: "POST", body: JSON.stringify(input), auth: false }
    );
    setToken(d.token);
    setRole("jugador");
    setUser(d.user);
    localStorage.removeItem("lerida_invitado");
  }

  function loginInvitado() {
    setToken(null);
    setRole("invitado");
    setUser(null);
    localStorage.setItem("lerida_invitado", "1");
  }

  function logout() {
    setToken(null);
    setRole("invitado");
    setUser(null);
    localStorage.removeItem("lerida_invitado");
  }

  return (
    <Ctx.Provider value={{ role, user, loading, loginAdmin, loginJugador, registerJugador, loginInvitado, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth fuera de AuthProvider");
  return c;
}
