# 01 — CRUD business-types (feliz)

**Módulo:** business-types   **Tipo:** back   **Estado:** ✅ OK

## Objetivo
Validar el flujo CRUD básico contra `/business-types`.

## Precondiciones
- Token de super admin.
- Seed con BT id=1 (`Lerida Comercio`).

## Pasos

### 1. POST /business-types
```http
POST /api/v1/business-types
Authorization: Bearer <TOKEN>
Content-Type: application/json

{"name":"Test BT","description":"BT de testing","icon":"store","is_active":true}
```
**Esperado (201):**
```json
{
  "success": true,
  "message": "Tipo de negocio creado exitosamente",
  "data": {
    "id": <N>, "name": "Test BT", "code": "test_bt_<random6>",
    "description": "BT de testing", "icon": "store", "is_active": true,
    "created_at": "...", "updated_at": "..."
  }
}
```

⚠️ El `code` se autogenera con sufijo random (e.g. `test_bt_9vB6ZA`). Para
controlar el code, enviarlo explícito en el body. Ver `BUG-BT-04`.

### 2. POST con code explícito
```json
{"name":"Test BT 2","code":"custom-code","description":"x","icon":"y","is_active":true}
```
**Esperado (201):** mismo formato, `code = "custom-code"` exacto.

### 3. GET /business-types
```http
GET /api/v1/business-types
Authorization: Bearer <TOKEN>
```
**Esperado (200):**
```json
{
  "success": true,
  "message": "Tipos de negocio obtenidos exitosamente",
  "data": [ /* todos los BTs activos */ ]
}
```

⚠️ Endpoint **sin paginación** (a diferencia de resources/actions). Si crece
la lista será problemático.

### 4. GET /business-types/<N>
**Esperado (200):** `{ success, message, data: { /* objeto */ } }`.

### 5. PUT /business-types/<N>
```http
PUT /api/v1/business-types/<N>
Content-Type: application/json

{"name":"Test BT Edit","description":"editado","icon":"shop","is_active":false}
```
**Observado (200):** `data` con name/description/icon actualizados, pero
**`is_active` siempre vuelve a `true`** y `code` no cambia.

⚠️ **BUG-BT-06:** `is_active=false` en el PUT body no se aplica.
Verificar al ejecutar — observado en pasada del 2026-05-16.

### 6. DELETE /business-types/<N>
**Esperado (200):**
```json
{ "success": true, "message": "Tipo de negocio eliminado exitosamente" }
```

## Validaciones post
- DB tabla `business_type`: tras DELETE, fila **NO** aparece en `SELECT * FROM
  business_type` (parece hard delete, pero la tabla tiene `deleted_at`).
  Confirmar con `SELECT id, name, deleted_at FROM business_type WHERE id=<N>;`
  — si la fila no aparece **y** el id no está en seq, fue hard delete.

⚠️ Al borrar el BT, las permissions con `business_type_id = <N>` quedan
con valor `NULL` (FK `ON DELETE SET NULL`). Ver `BUG-BT-05`.
