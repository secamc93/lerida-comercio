# 04 — Verify token válido

**Módulo:** auth   **Tipo:** back   **Estado:** ✅ OK (post-fix 2026-05-16)

## Objetivo
`GET /auth/verify` con un token válido devuelve los claims del usuario.

## Precondiciones
- Token válido obtenido del caso `01`.

## Pasos

### 1. GET /api/v1/auth/verify con token válido

**Request:**
```http
GET /api/v1/auth/verify
Authorization: Bearer <TOKEN>
```

**Esperado (200):**
```json
{
  "success": true,
  "message": "Usuario autenticado correctamente",
  "data": {
    "user_id": 1,
    "email": "admin@lerida.local",
    "business_id": 0,
    "roles": ["Super Admin"]
  }
}
```

## Validaciones post
- Status `200`.
- `data.user_id` coincide con el del token.
- `data.email` poblado correctamente.
- `data.roles` array de nombres de rol (no null).

## Notas
- Implementación: el JWT unificado no codifica email/roles; el handler los
  enriquece llamando a `usecase.GetVerifyInfo(userID)` (ver
  `app/verify-info.go`).
