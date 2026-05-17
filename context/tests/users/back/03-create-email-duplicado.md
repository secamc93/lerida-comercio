# 03 — POST /users con email duplicado

**Módulo:** users   **Tipo:** back   **Estado:** ✅ OK

## Pasos

### 1. Intentar crear con email ya existente
```http
POST /api/v1/users
Authorization: Bearer <TOKEN>
Content-Type: application/json

{"name":"Dup","email":"admin@lerida.local","password":"x"}
```
**Esperado (409):**
```json
{"error":"el email ya está registrado"}
```

### 2. Intentar crear con email de usuario soft-deleted
1. Crear usuario `tmp@x.com`.
2. `DELETE /users/<id>` (soft delete).
3. Intentar crear de nuevo con el mismo email.

**Esperado:** valor a definir.
- Si el constraint `uni_user_email` es estricto → `409` (caso bug si queremos
  permitir reusar email tras borrar).
- Si está cubierto por filtro `deleted_at IS NULL` → `201` (permitido).

Documentar el comportamiento real al ejecutar y decidir si abrir ticket.

## Validaciones post
- Status `409` en caso 1.
- No se duplica el registro en DB.
