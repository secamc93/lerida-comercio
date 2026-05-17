# 01 — CRUD users (camino feliz)

**Módulo:** users   **Tipo:** back   **Estado:** ✅ OK (excepto BUG-USERS-01, ver notas)

## Objetivo
Recorrido completo: crear → listar → ver por ID → actualizar → eliminar.

## Precondiciones
- TOKEN de super admin (ver `auth/shared/test_data.md`).

## Pasos

### 1. POST /api/v1/users (crear)
```http
POST /api/v1/users
Authorization: Bearer <TOKEN>
Content-Type: application/json

{"name":"Test User","email":"test1@lerida.local","phone":"3001112233"}
```
**Esperado (201):**
```json
{
  "success": true,
  "email": "test1@lerida.local",
  "password": "<password generada>",
  "message": "Usuario creado con ID: <N>"
}
```
- Capturar el `<N>` del message (parse del string) o consultar DB.
- ⚠️ La password se muestra **una sola vez**.

### 2. GET /api/v1/users (listar)
```http
GET /api/v1/users?page=1&page_size=20
Authorization: Bearer <TOKEN>
```
**Esperado (200):** payload con `data[]` + `pagination`.

⚠️ **BUG-USERS-01:** con el super admin (business_id=0), el listado parece
omitir usuarios sin business. El usuario recién creado aparece en DB pero
**no** en este listado por defecto. Workaround: agregar `?include_deleted=true`
o filtrar por DB hasta confirmar diseño.

### 3. GET /api/v1/users/:id (detalle)
```http
GET /api/v1/users/<N>
Authorization: Bearer <TOKEN>
```
**Esperado (200):** objeto del usuario con `business_role_assignments`,
`scope_*`, `last_login_at`, etc.

### 4. PUT /api/v1/users/:id (actualizar)
```http
PUT /api/v1/users/<N>
Authorization: Bearer <TOKEN>
Content-Type: application/json

{"name":"Test User Editado","phone":"3009999999"}
```
**Esperado (200):** `success: true` y los nuevos valores reflejados al
hacer GET de nuevo.

### 5. DELETE /api/v1/users/:id
```http
DELETE /api/v1/users/<N>
Authorization: Bearer <TOKEN>
```
**Esperado (200/204):** `success: true`. Soft delete (campo `deleted_at`
en `"user"` debería estar poblado).

### 6. Verificar soft delete

```sql
SELECT id, email, deleted_at FROM "user" WHERE id = <N>;
```
- `deleted_at` debería estar poblado.
- GET /users/:id del id borrado → `404 Usuario no encontrado`.

## Notas
- Para repetir el test, primero asegurar que `test1@lerida.local` no
  existe activo (puede quedar soft-deleted; usar otro email o restaurar).
