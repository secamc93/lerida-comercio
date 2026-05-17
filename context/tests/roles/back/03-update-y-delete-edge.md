# 03 — PUT/DELETE roles edge cases

**Módulo:** roles   **Tipo:** back   **Estado:** ⚠️ BUG

## Pasos

### 1. PUT /roles/9999 (inexistente)
```http
PUT /api/v1/roles/9999
Content-Type: application/json

{"name":"X","description":"x","level":3,"scope_id":2,"business_type_id":1}
```

**Observado actualmente (500):**
```json
{
  "error": "record not found",
  "message": "Error al actualizar el rol",
  "success": false
}
```

**Esperado (404):**
```json
{"success":false, "error":"Rol no encontrado"}
```

⚠️ **BUG-ROLES-03:** `gorm.ErrRecordNotFound` se propaga sin mapear al
handler → 500 con error raw. Debería capturarse como `ErrRoleNotFound`
en el repositorio y devolver 404.

### 2. DELETE /roles/9999
**Esperado:** mismo problema potencial. Documentar al ejecutar.

### 3. Borrar rol system (is_system=true)
```http
DELETE /api/v1/roles/1
```
**Pregunta de negocio:** ¿se permite borrar Super Admin? Probablemente
no. Validar que el handler/usecase rechace `is_system=true` con `403`.

### 4. PUT /roles/level/1 — listado por nivel
```http
GET /api/v1/roles/level/1
```
**Observado (400):**
```json
{"error":"Nivel inválido: Key: 'GetRolesByLevelRequest.Level' Error:Field validation for 'Level' failed on the 'required' tag"}
```

⚠️ **BUG-ROLES-04:** El URI binding del parámetro `:level` no llega al
struct request. El handler espera `Level` requerido pero no lo recibe.
Revisar `GetRolesByLevelRequest`: probablemente le falta el tag
`uri:"level" binding:"required,min=1"` en el campo `Level`.

**Archivo a revisar:** `back/central/services/auth/roles/internal/infra/primary/handlers/request/*.go`
y el handler correspondiente.

## Validaciones post
- DB: si DELETE rol con permisos asignados, validar que `role_permissions`
  se limpie en cascada o no quede inconsistente.
