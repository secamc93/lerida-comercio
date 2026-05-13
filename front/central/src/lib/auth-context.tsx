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
  invitadoChosen: boolean;
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
  const [invitadoChosen, setInvitadoChosen] = useState(false);

  useEffect(() => {
    const tok = getToken();
    const savedInvitado = typeof window !== "undefined" && localStorage.getItem("lerida_invitado") === "1";
    if (!tok && !savedInvitado) {
      setLoading(false);
      return;
    }
    if (savedInvitado && !tok) {
      setRole("invitado");
      setInvitadoChosen(true);
      setLoading(false);
      return;
    }
    const savedRole = (typeof window !== "undefined" && localStorage.getItem("lerida_role")) as Rol | null;
    api<{ success: boolean; data: { user_id: number; email: string; roles: string[] | null } }>(
      "/api/v1/auth/verify"
    )
      .then((d) => {
        const role: Rol = savedRole === "admin" || savedRole === "jugador" ? savedRole : "jugador";
        setRole(role);
        setUser({ id: d.data.user_id, username: d.data.email, nombre: d.data.email });
      })
      .catch(() => {
        setToken(null);
        localStorage.removeItem("lerida_role");
        setRole("invitado");
      })
      .finally(() => setLoading(false));
  }, []);

  async function loginAdmin(email: string, password: string) {
    const r = await api<{
      success: boolean;
      data: { token: string; user: { id: number; name: string; email: string }; is_super_admin: boolean };
    }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    });
    setToken(r.data.token);
    setRole("admin");
    localStorage.setItem("lerida_role", "admin");
    setUser({ id: r.data.user.id, username: r.data.user.email, nombre: r.data.user.name });
    setInvitadoChosen(false);
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
    setInvitadoChosen(false);
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
    setInvitadoChosen(false);
    localStorage.removeItem("lerida_invitado");
  }

  function loginInvitado() {
    setToken(null);
    setRole("invitado");
    setUser(null);
    setInvitadoChosen(true);
    localStorage.setItem("lerida_invitado", "1");
  }

  function logout() {
    setToken(null);
    setRole("invitado");
    setUser(null);
    setInvitadoChosen(false);
    localStorage.removeItem("lerida_invitado");
    localStorage.removeItem("lerida_role");
  }

  return (
    <Ctx.Provider value={{ role, user, loading, invitadoChosen, loginAdmin, loginJugador, registerJugador, loginInvitado, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth fuera de AuthProvider");
  return c;
}
