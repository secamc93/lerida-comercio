# 01 — Login exitoso (super admin)

**Módulo:** auth   **Tipo:** back   **Estado:** ✅ OK

## Objetivo
Login con credenciales válidas devuelve token JWT y datos del usuario.

## Precondiciones
- Backend `:3050`, DB con seed corrido.
- Usuario `admin@lerida.local` existe y está activo.

## Pasos

### 1. POST /api/v1/auth/login con `X-Client-Type: api`

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json
X-Client-Type: api

{"email":"admin@lerida.local","password":"admin123"}
```

**Esperado (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Super Admin",
      "email": "admin@lerida.local",
      "phone": "",
      "avatar_url": "",
      "is_active": true,
      "last_login_at": "<timestamp>"
    },
    "token": "<JWT no vacío>",
    "require_password_change": false,
    "businesses": [],
    "scope": "platform",
    "is_super_admin": true
  }
}
```

## Validaciones post
- Status `200`.
- `data.token` debe ser una cadena JWT de 3 segmentos (`xxx.yyy.zzz`).
- `data.scope == "platform"` y `data.is_super_admin == true`.
- Email se normaliza a minúsculas — probar también con `Admin@Lerida.LOCAL`.
- DB: `SELECT last_login_at FROM "user" WHERE email = 'admin@lerida.local'` actualizado.

## Notas
- Sin el header `X-Client-Type: api` el backend setea cookie HttpOnly y deja
  el token en el body **vacío** — ver `RESULTS.md` (BUG-AUTH-01: domain de
  cookie hardcoded `.probabilityia.com.co`).
