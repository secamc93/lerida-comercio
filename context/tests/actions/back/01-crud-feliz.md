# 01 — CRUD actions (feliz)

**Módulo:** actions   **Tipo:** back   **Estado:** ✅ OK

## Objetivo
Validar el flujo CRUD básico contra `/actions` y forma de respuestas.

## Precondiciones
- Token de super admin.
- Seed con 13 actions (ids 1-13).

## Pasos

### 1. POST /actions
```http
POST /api/v1/actions
Authorization: Bearer <TOKEN>
Content-Type: application/json

{"name":"TestAction","description":"de testing"}
```
**Esperado (201):**
```json
{
  "success": true,
  "message": "Action creado exitosamente",
  "data": {
    "id": 14, "name": "TestAction", "description": "de testing",
    "created_at": "...", "updated_at": "..."
  }
}
```

### 2. GET /actions
**Esperado (200):** `{ success, message, data: { actions: [...], total, page, page_size, total_pages } }`.

### 3. GET /actions/14
**Esperado (200):** `{ success, message, data: { /* objeto */ } }`.

### 4. PUT /actions/14
```http
PUT /api/v1/actions/14
Content-Type: application/json

{"name":"TestAction Edit","description":"editado"}
```
**Esperado (200):** `data` con campos nuevos y `updated_at` cambiado.

### 5. DELETE /actions/14
**Esperado (200):**
```json
{ "success": true, "message": "Action eliminado con ID: 14" }
```

## Validaciones post
- DB tabla `action`: tras DELETE, `deleted_at` poblado (soft delete) o fila
  removida (hard). Verificar con `SELECT id, deleted_at FROM action WHERE id=14;`.
