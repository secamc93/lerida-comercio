# 01 — CRUD resources (feliz)

**Módulo:** resources   **Tipo:** back   **Estado:** ✅ OK

## Objetivo
Validar el flujo CRUD básico contra `/resources` y la forma de las respuestas.

## Precondiciones
- Token de super admin.
- Seed con 7 resources (ids 1-7).

## Pasos

### 1. POST /resources
```http
POST /api/v1/resources
Authorization: Bearer <TOKEN>
Content-Type: application/json

{"name":"TestResource","description":"de testing"}
```

**Esperado (201):**
```json
{
  "success": true,
  "message": "Recurso creado exitosamente",
  "data": {
    "id": 8, "name": "TestResource", "description": "de testing",
    "business_type_id": 0, "business_type_name": "",
    "created_at": "...", "updated_at": "..."
  }
}
```

### 2. GET /resources
```http
GET /api/v1/resources
Authorization: Bearer <TOKEN>
```
**Esperado (200):** `{ success, message, data: { resources: [...], total: N, page, page_size, total_pages } }`.

⚠️ La paginación queda **anidada en `data`**, no en un objeto `pagination`
separado (a diferencia de users). Documentado en `shared/test_data.md`.

### 3. GET /resources/8
**Esperado (200):**
```json
{
  "success": true, "message": "Recurso obtenido exitosamente",
  "data": { "id": 8, "name": "TestResource", ... }
}
```

### 4. PUT /resources/8
```http
PUT /api/v1/resources/8
Content-Type: application/json

{"name":"TestResource Edit","description":"editado"}
```
**Esperado (200):** `success: true`, `data` con campos actualizados y nuevo
`updated_at`.

### 5. DELETE /resources/8
**Esperado (200):**
```json
{ "success": true, "message": "Recurso eliminado permanentemente con ID: 8" }
```

## Validaciones post
- Tras DELETE, GET /resources/8 → 500 (`BUG-RESOURCES-01`).
- En DB: `SELECT deleted_at FROM resource WHERE id=8;` indica si fue soft
  delete (campo poblado) o hard delete (fila ausente).

## Notas
- Filtro feliz: `GET /resources?name=Usuarios` devuelve 1 item.
