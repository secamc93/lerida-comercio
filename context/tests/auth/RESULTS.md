# RESULTS — auth

Registro de ejecuciones del módulo `auth`.

## 2026-05-16 · primera pasada

| Caso | Resultado | Notas |
|------|-----------|-------|
| 01 — Login exitoso super admin            | ✅ OK   | Token JWT 3 segmentos, businesses=[] (super admin sin BU). |
| 02 — Credenciales inválidas               | ✅ OK   | Mismo mensaje genérico para password mal y email inexistente. |
| 03 — Body inválido                        | ✅ OK   | 400 con `details` de validador go-playground/validator. |
| 04 — Verify token válido                  | ⚠️ BUG  | email y roles vacíos en respuesta — ver BUG-AUTH-02. |
| 05 — Verify token inválido/ausente        | ✅ OK   | 401 con mensaje claro en cada caso. |
| 06 — Roles & permissions                  | ✅ OK   | `is_super=true`, scope `platform`, `resources=null`. |
| 07 — Generate password                    | ⚠️ BUG  | Operación opera sobre usuario del token sin user_id; password en texto plano en response — ver BUG-AUTH-03. |
| 08 — Change password                      | ⏳      | Pendiente. Validar contrato antes de ejecutar (destruye admin123). |

## Bugs encontrados

### BUG-AUTH-01 · Cookie con domain hardcoded `probabilityia.com.co` — ✅ FIXED 2026-05-16

**Archivo:** `back/central/services/auth/login/internal/infra/primary/handlers/login.go` línea ~92-100.

```go
cookieValue := fmt.Sprintf(
    "%s=%s; Max-Age=%d; Path=%s; Domain=%s; Secure; HttpOnly; SameSite=None; Partitioned",
    "session_token",
    domainResponse.Token,
    7*24*60*60,
    "/",
    ".probabilityia.com.co",
)
```

**Impacto:**
- El dominio `probabilityia.com.co` es de otro proyecto (Probability) — copy/paste residual.
- En localhost el navegador rechaza la cookie (dominio no coincide) → la sesión web no se persiste.
- Además requiere `Secure` (HTTPS) y `SameSite=None`, incompatible con `http://localhost`.

**Severidad:** Alta. El frontend web local depende de esta cookie cuando no envía `X-Client-Type: api`.

**Fix aplicado (commit pendiente):**
1. `AuthHandler` ahora recibe `env.IConfig` por inyección (`constructor.go`, `bundle.go`).
2. `LoginHandler` construye la cookie según:
   - `SESSION_COOKIE_DOMAIN` (opcional, default vacío → sin `Domain=`).
   - `APP_ENV`: `production` → `Secure; SameSite=None; Partitioned`; otro → `SameSite=Lax` sin `Secure`.
3. Resultado en dev (verificado): `Set-Cookie: session_token=...; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax`.
4. El frontend web ya **no** necesita `X-Client-Type: api` para tener sesión.

### BUG-AUTH-02 · `/auth/verify` devuelve email y roles vacíos — ✅ FIXED 2026-05-16

**Endpoint:** `GET /api/v1/auth/verify`.

**Causa:** el JWT unificado no codifica `email` ni nombres de roles; el handler dependía del `authInfo` del middleware, que solo tiene los claims.

**Fix aplicado (commit pendiente):**
1. Nuevo método `GetVerifyInfo(ctx, userID)` en el usecase (`app/verify-info.go`) que consulta `repository.GetUserByID` + `GetUserRoles` y devuelve `(email, []roleNames)`.
2. `VerifyHandler` enriquece la respuesta si `authInfo.Email` o `authInfo.Roles` vienen vacíos.
3. Resultado verificado: `{"data":{"business_id":0,"email":"admin@lerida.local","roles":["Super Admin"],"user_id":1},"message":"Usuario autenticado correctamente","success":true}`.

### NOTA-AUTH-03 · Generate-password (no es bug, sí precaución)

**Endpoint:** `POST /api/v1/auth/generate-password`.

**Comportamiento real (revisado en handler):**
- Sin `user_id` en body → opera sobre el usuario del token.
- Con `user_id` en body → solo permitido si el usuario es super admin
  (`middleware.IsSuperAdmin`), si no → `403`.
- Soft-deleted o inactivo → `403` / `404`.

**Riesgo abierto:** devuelve la password generada en texto plano dentro de la
response. Si el proxy o logger captura body de respuestas, queda expuesta.

**Acción sugerida:**
1. Confirmar que el logger zerolog **no** logge body de response
   (revisar `back/central/shared/log/*`).
2. Considerar enviarla por canal separado (correo, copy-once UI) en producción.

**Tarea de testing destructiva:** al ejecutar el caso 07 en una sesión, la
password del usuario impactado se rota. Si se hizo sobre admin@lerida.local,
hay que actualizar `auth/shared/test_data.md` con la nueva, o restaurar
admin123 vía bcrypt + UPDATE.

> Durante esta sesión yo mismo ejecuté generate-password sobre `admin@lerida.local`
> sin querer (era el único user). Tuve que restaurar el hash manualmente:
> ```sql
> UPDATE "user" SET password = '<bcrypt admin123>' WHERE email = 'admin@lerida.local';
> ```
> Lección: en ejecuciones futuras del caso 07, **siempre** crear primero un
> user test (caso 01 de users) y operar sobre él, nunca sobre el super admin.
