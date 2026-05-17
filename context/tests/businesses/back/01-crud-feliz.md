# 01 — CRUD businesses (feliz)

**Módulo:** businesses   **Tipo:** back   **Estado:** ⚠️ BUG

## Objetivo
Validar el flujo CRUD básico contra `/businesses` (multipart) y verificar la
forma de las respuestas.

## Precondiciones
- Token de super admin.
- Existe al menos un `business_type` (id válido — referenciar el id real del
  seed o el recreado).

## Pasos

### 1. POST /businesses (multipart)
```http
POST /api/v1/businesses
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data; boundary=...

name=Comercio Test
business_type_id=<BT_ID>
address=Calle 1
description=Comercio testing
timezone=America/Bogota
is_active=true
```
Con curl:
```bash
curl -X POST http://localhost:3050/api/v1/businesses \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Comercio Test" -F "business_type_id=<BT_ID>" \
  -F "address=Calle 1" -F "description=Comercio testing"
```

**Esperado (201):**
```json
{
  "success": true,
  "message": "Negocio creado exitosamente",
  "data": {
    "id": <N>, "name": "Comercio Test", "description": "Comercio testing",
    "address": "Calle 1", "phone": "", "email": "", "website": "",
    "logo_url": "", "primary_color": "#1f2937", ..., "navbar_image_url": "",
    "is_active": true, "business_type_id": <BT_ID>, "business_type": "<BT name>",
    "created_at": "...", "updated_at": "..."
  }
}
```

⚠️ Note campos `phone`, `email`, `website` en la respuesta aunque **no
existen en el request** ni en `BusinessRequest`. Vienen siempre vacíos.
Probablemente residuales del modelo. Ver `BUG-BUSINESSES-04`.

### 2. GET /businesses
**Esperado (200):**
```json
{
  "success": true, "message": "Negocios obtenidos exitosamente",
  "data": [ /* items */ ],
  "pagination": {
    "current_page": 1, "per_page": 10, "total": 1,
    "last_page": 1, "has_next": false, "has_prev": false
  }
}
```

### 3. GET /businesses/simple
**Esperado (200):**
```json
{ "success": true, "message": "Negocios obtenidos exitosamente", "data": [ /* items */ ] }
```
Sin paginación.

### 4. GET /businesses/<N>
**Esperado (200):**
```json
{
  "success": true, "message": "Negocio obtenido exitosamente",
  "data": {
    "id": <N>, "name": "...", "code": "...",
    "business_type": { "id": <BT_ID>, "name": "...", "code": "...", ... },
    "timezone": "America/Bogota", "address": "...", ...
  }
}
```

⚠️ Note diferencia con respuesta de POST: en GET el `business_type` viene
como **objeto anidado**, no como string. Inconsistencia entre GET/POST.
Ver `BUG-BUSINESSES-05`.

### 5. PUT /businesses/<N>
```bash
curl -X PUT http://localhost:3050/api/v1/businesses/<N> \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Comercio Test Edit" -F "address=Calle Nueva 99"
```
**Esperado (200):** `data` con name/address actualizados, `updated_at` nuevo.

### 6. DELETE /businesses/<N>
**Esperado (200):**
```json
{ "success": true, "message": "Negocio eliminado exitosamente" }
```

## Validaciones post
- DB: `SELECT id, name, deleted_at FROM business WHERE id=<N>;` → `deleted_at`
  poblado (soft delete).
- `business_resource_configured` relacionado: verificar si se limpia o queda
  huérfano.

## Notas
- Test exitoso en la pasada del 2026-05-16.
- El endpoint funciona solo con multipart; enviar JSON puro devuelve 400.
