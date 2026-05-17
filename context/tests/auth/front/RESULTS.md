# RESULTS — auth/front

## 2026-05-16 · primera pasada (post-refactor)

| Caso                              | Resultado | Notas |
|-----------------------------------|-----------|-------|
| 01 — Login flow completo          | ✅ OK     | Redirect `/` → `/login` → `/home` con email y rol reales. Logout funciona. |
| 02 — Credenciales inválidas       | ✅ OK     | Mensaje "credenciales inválidas" mostrado en form. |
| 03 — Cambiar password             | ✅ OK     | Valida vacíos, longitud, mismatch, current incorrecto; cambio real OK + revertido a `admin123`. |

## Cambios aplicados durante la sesión

- `app/login/page.tsx` (nuevo) — usa `LoginForm` hexagonal.
- `app/home/page.tsx` + `home-client.tsx` + `logout-action.ts` (nuevos) —
  página protegida (server component verifica cookie y llama
  `/auth/verify` + `/auth/roles-permissions`).
- `app/cambiar-password/page.tsx` + `change-password-panel.tsx` (nuevos).
- `app/page.tsx` reemplazado: redirige a `/login` o `/home` según cookie.
- `app/layout.tsx` ya no envuelve con `AuthProvider` legacy.
- Eliminado `business_token` legacy de `CookieStorage`, `TokenStorage`,
  domain/app/actions/mappers del módulo login.
- Backend: cookie `session_token` ahora respeta env (`APP_ENV`,
  `SESSION_COOKIE_DOMAIN`) — funciona en `http://localhost`.
- Backend: `/auth/verify` enriquece email y roles del usuario vía
  `usecase.GetVerifyInfo`.

## Pendientes (no bloquean el módulo auth)

- LoginForm aún tiene branding "ProbabilityIA" (logo + texto). Reemplazar
  por branding Lérida.
- Componentes legacy en `src/components/LoginGate.tsx`, `src/components/Navbar.tsx`,
  `src/lib/auth-context.tsx` y `src/lib/api.ts` siguen en el repo pero ya
  no son importados por las rutas vivas (`/`, `/login`, `/home`,
  `/cambiar-password`). La página `/torneo` aún los usa y no funciona —
  cuando se decida qué hacer con torneo, eliminar los archivos legacy.
- Implementar redirect a `/cambiar-password` cuando login devuelve
  `require_password_change: true` (post-fix BUG-AUTH-04 ideal).
