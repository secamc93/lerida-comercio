# 01 — Login flow completo (super admin)

**Módulo:** auth   **Tipo:** front   **Estado:** ✅ OK

## Objetivo
Camino feliz: home → redirect a `/login` → login → `/home` con datos reales
del usuario → logout.

## Precondiciones
- Frontend `:3000`, backend `:3050` corriendo (ver `./scripts/dev-services.sh status`).
- Seed corrido (super admin `admin@lerida.local / admin123`).

## Pasos

### 1. Ir a `/` sin sesión
- Esperado: redirect `307` a `/login`.

### 2. Renderizar `/login`
- Heading: "Lérida Comercio · Panel administrativo".
- LoginForm hexagonal con inputs Email / Contraseña y botón "Iniciar Sesión".

### 3. Login
- Email: `admin@lerida.local`, Password: `admin123`.
- Clic en "Iniciar Sesión".
- Esperado: redirect a `/home`. Cookie HttpOnly `session_token` seteada por el
  backend (visible en DevTools → Application → Cookies, pero no leíble via JS).

### 4. `/home` muestra datos reales
- Email visible: `admin@lerida.local`.
- Rol: `Super Admin`. Negocio: `Plataforma`. Suscripción: `active`.
- Sin errores en consola.

### 5. Logout
- Clic en "Salir".
- Esperado: redirect a `/login`. Cookie `session_token` borrada.

### 6. Acceso protegido sin sesión
- Navegar a `/home` directamente.
- Esperado: redirect a `/login`.

## Validaciones post
- Cookie HttpOnly `session_token` se observa tras login (DevTools).
- `localStorage` no contiene `business_token` (legacy, eliminado).
- Verify (`GET /api/v1/auth/verify`) responde con email y roles reales.

## Bugs cerrados durante este caso
- BUG-AUTH-01 (cookie domain hardcoded) — fixed.
- BUG-AUTH-02 (verify email/roles vacíos) — fixed.
- "Doble token" (business_token legacy) — eliminado del frontend.
