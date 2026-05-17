"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Rol } from "./api";
import {
  legacyLoginAction,
  legacySessionAction,
  legacyLogoutAction,
} from "./auth-actions";

interface AuthUser {
  id: number;
  username?: string;
  nombre?: string;
  email?: string;
}

interface AuthCtx {
  role: Rol;
  user: AuthUser | null;
  loading: boolean;
  /** El usuario eligió explícitamente navegar como invitado. */
  invitadoChosen: boolean;
  /** Login de administrador contra el backend hexagonal (email + password). */
  loginAdmin: (email: string, password: string) => Promise<void>;
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

const INVITADO_KEY = "lerida_invitado";

// Mensaje temporal: el backend aún no expone autenticación de jugadores.
const JUGADOR_PENDIENTE =
  "El acceso de jugadores estará disponible próximamente.";

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Rol>("invitado");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [invitadoChosen, setInvitadoChosen] = useState(false);

  useEffect(() => {
    const savedInvitado =
      typeof window !== "undefined" &&
      localStorage.getItem(INVITADO_KEY) === "1";

    legacySessionAction()
      .then((session) => {
        if (session) {
          setRole("admin");
          setUser({
            id: session.user_id,
            email: session.email,
            username: session.email,
            nombre: session.email,
          });
          localStorage.removeItem(INVITADO_KEY);
        } else if (savedInvitado) {
          setRole("invitado");
          setInvitadoChosen(true);
        }
      })
      .catch(() => {
        if (savedInvitado) {
          setRole("invitado");
          setInvitadoChosen(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function loginAdmin(email: string, password: string) {
    const result = await legacyLoginAction(email, password);
    if (!result.success) {
      throw new Error(result.error || "No se pudo iniciar sesión");
    }
    const session = await legacySessionAction();
    setRole("admin");
    setUser(
      session
        ? {
            id: session.user_id,
            email: session.email,
            username: session.email,
            nombre: session.email,
          }
        : { id: 0, email, username: email, nombre: email },
    );
    setInvitadoChosen(false);
    localStorage.removeItem(INVITADO_KEY);
  }

  async function loginJugador(_username: string, _password: string) {
    throw new Error(JUGADOR_PENDIENTE);
  }

  async function registerJugador(_input: RegisterInput) {
    throw new Error(JUGADOR_PENDIENTE);
  }

  function loginInvitado() {
    setRole("invitado");
    setUser(null);
    setInvitadoChosen(true);
    localStorage.setItem(INVITADO_KEY, "1");
  }

  function logout() {
    void legacyLogoutAction();
    setRole("invitado");
    setUser(null);
    setInvitadoChosen(false);
    localStorage.removeItem(INVITADO_KEY);
  }

  return (
    <Ctx.Provider
      value={{
        role,
        user,
        loading,
        invitadoChosen,
        loginAdmin,
        loginJugador,
        registerJugador,
        loginInvitado,
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth fuera de AuthProvider");
  return c;
}
