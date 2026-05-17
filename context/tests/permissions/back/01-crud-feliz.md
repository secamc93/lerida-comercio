# 01 — CRUD permissions (feliz)

**Módulo:** permissions   **Tipo:** back   **Estado:** ⚠️ BUG

## Objetivo
Validar el flujo CRUD básico contra `/permissions` y la forma de las
respuestas devueltas por cada verbo.

## Precondiciones
- Token de super admin (`auth/shared/test_data.md`).
- Seed con 28 permissions (ids 1-28), 7 resources (1-7), 14 actions (1-14).

## Pasos

### 1. POST /permissions
```http
POST /api/v1/permissions
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Test Perm",
  "description": "Perm de testing",
  "resource_id": 1,
  "action_id": 1,
  "scope_id": 2,
  "business_type_id": 1
}
```

**Esperado (201):**
```json
{ "success": true, "message": "Permiso creado con ID: 29" }
```

⚠️ El response **no incluye el objeto** creado, solo un mensaje. Cliente debe
hacer un `GET /permissions/<N>` adicional para obtener el detalle (ver
`BUG-PERMISSIONS-03`).

### 2. GET /permissions
```http
GET /api/v1/permissions
Authorization: Bearer <TOKEN>
```
**Esperado (200):** `{ success, data: [...28+N], total }`. Cada item de la
lista trae `business_type_name` poblado.

⚠️ El campo `code` viene `""` en todos los items (`BUG-PERMISSIONS-01`).

### 3. GET /permissions/29
**Esperado (200):**
```json
{ "success": true, "data": { "id": 29, "name": "Test Perm", ... } }
```

⚠️ En esta forma de respuesta `business_type_name` viene vacío aunque
`business_type_id` está poblado — `BUG-PERMISSIONS-02`.

### 4. PUT /permissions/29
```http
PUT /api/v1/permissions/29
Content-Type: application/json

{"name":"Test Perm Edit","description":"editado","resource_id":1,"action_id":1,"scope_id":2}
```
**Esperado (200):** `{ "success": true, "message": "Permiso actualizado con ID: 29" }`.

### 5. DELETE /permissions/29
**Esperado (200):** `{ "success": true, "message": "Permiso eliminado con ID: 29" }`.

## Validaciones post
- Status codes correctos.
- DB tabla `permission`: tras DELETE, `deleted_at` poblado (soft delete).

## Notas
- Bugs en `RESULTS.md`. Los principales: code vacío, business_type_name
  inconsistente, response del POST/PUT no devuelve el objeto.
