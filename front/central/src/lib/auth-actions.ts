"use server";

import { cookies } from "next/headers";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3050";

export interface SessionUser {
  user_id: number;
  email: string;
  roles: string[] | null;
  business_id: number;
}

/**
 * Login contra el backend hexagonal (/auth/login con email + password).
 *
 * El backend setea la cookie `session_token` como HttpOnly en su propia
 * respuesta; en desarrollo es SameSite=Lax, así que una llamada cross-site
 * desde el navegador no la conservaría. Por eso hacemos el login en el
 * servidor y re-seteamos la cookie como first-party de Next.js.
 */
export async function legacyLoginAction(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json().catch(() => ({}) as Record<string, string>);
  if (!res.ok) {
    return {
      success: false,
      error: json.error || json.message || "Credenciales inválidas",
    };
  }

  const setCookie = res.headers.get("set-cookie");
  const match = setCookie?.match(/session_token=([^;]+)/);
  if (match) {
    const store = await cookies();
    store.set("session_token", match[1], {
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
  }

  return { success: true };
}

/** Verifica la sesión vigente leyendo la cookie HttpOnly del lado servidor. */
export async function legacySessionAction(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get("session_token")?.value;
  if (!token) return null;

  const res = await fetch(`${API}/api/v1/auth/verify`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;

  const json = await res.json().catch(() => null);
  if (!json?.success) return null;
  return json.data as SessionUser;
}

/** Cierra sesión eliminando la cookie de sesión. */
export async function legacyLogoutAction(): Promise<void> {
  const store = await cookies();
  store.delete("session_token");
}
