# 01 — CRUD roles (feliz)

**Módulo:** roles   **Tipo:** back   **Estado:** ✅ OK

## Pasos

### 1. POST /roles
```http
POST /api/v1/roles
Authorization: Bearer <TOKEN>
Content-Type: application/json

{"name":"Tester","description":"Rol de pruebas","level":3,"is_system":false,"scope_id":2,"business_type_id":1}
```
**Esperado (201):**
```json
{
  "success": true,
  "message": "Rol creado exitosamente",
  "data": {
    "id": <N>, "name": "Tester", "description": "Rol de pruebas",
    "level": 3, "is_system": false, "scope_id": 2, "business_type_id": 1,
    "created_at": "...", "updated_at": "..."
  }
}
```

### 2. GET /roles
```http
GET /api/v1/roles
Authorization: Bearer <TOKEN>
```
**Esperado (200):** `{ success: true, data: [...], count: N+3 }`.

### 3. GET /roles/<N>
**Esperado (200):** detalle del rol creado.

### 4. PUT /roles/<N>
```http
PUT /api/v1/roles/<N>
Content-Type: application/json

{"name":"Tester Editado","description":"Updated","level":3,"scope_id":2,"business_type_id":1}
```
**Esperado (200):** `success: true`, `data` con campos nuevos y `updated_at` cambiado.

### 5. POST /roles/<N>/permissions (asignar)
```json
{"permission_ids":[1,2]}
```
**Esperado (200):** `success: true`, `permission_ids:[1,2]` en respuesta.

### 6. GET /roles/<N>/permissions
**Esperado (200):** array `permissions` con los permisos asignados.

⚠️ Bug menor: `role_name` y `scope_name/scope_code` del permiso vienen
vacíos — ver `RESULTS.md` (BUG-ROLES-01).

### 7. DELETE /roles/<N>/permissions/1 (quitar uno)
**Esperado (200):** `success: true`. Al volver a GET, ese permission_id ya
no aparece.

### 8. DELETE /roles/<N>
**Esperado (200):** `success: true`. Soft delete del rol.

## Validaciones post
- DB tabla `role`: `deleted_at` poblado tras DELETE.
- Tabla `role_permissions`: las asignaciones se reflejan en INSERT/DELETE.
