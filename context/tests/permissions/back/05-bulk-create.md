# 05 — POST /permissions/bulk + filtros

**Módulo:** permissions   **Tipo:** back   **Estado:** ⚠️ BUG

## Objetivo
Validar la creación masiva de permisos (`/permissions/bulk`) y los filtros
de listado por `scope` y `resource`.

## Precondiciones
- Token de super admin.
- IDs base: `resource_id=1` (Usuarios), `action_id` libres (5=Manage, 6=Approve,
  7=Reject, 8=Assign) — los CRUD 1-4 ya están sembrados.

## Pasos

### 1. Bulk feliz (2 items válidos)
```http
POST /api/v1/permissions/bulk
Content-Type: application/json

{
  "permissions": [
    {"name":"Bulk A","resource_id":1,"action_id":5,"scope_id":2},
    {"name":"Bulk B","resource_id":1,"action_id":6,"scope_id":2}
  ]
}
```
**Esperado (200):**
```json
{
  "success": true,
  "message": "2 de 2 permisos creados exitosamente",
  "results": [
    {"name":"Bulk A","success":true,"message":"Permiso creado con ID: <N1>"},
    {"name":"Bulk B","success":true,"message":"Permiso creado con ID: <N2>"}
  ]
}
```

### 2. Bulk con body vacío
```json
{}
```
**Esperado (400):**
```json
{
  "success": false,
  "message": "Datos de entrada inválidos: Key: 'BulkCreatePermissionRequest.Permissions' Error:Field validation for 'Permissions' failed on the 'required' tag"
}
```

### 3. Bulk con array vacío
```json
{"permissions":[]}
```
**Esperado (400):** mismo formato, falla en validador `min=1`.

### 4. Bulk parcialmente fallido (uno duplicado)
Asumiendo que ya existe el nombre `Bulk A` (del paso 1):
```json
{
  "permissions": [
    {"name":"Bulk C","resource_id":1,"action_id":7,"scope_id":2},
    {"name":"Bulk A","resource_id":1,"action_id":8,"scope_id":2}
  ]
}
```
**Esperado (200):**
```json
{
  "success": true,
  "message": "1 de 2 permisos creados exitosamente",
  "results": [
    {"name":"Bulk C","success":true,"message":"Permiso creado con ID: <N>"},
    {"name":"Bulk A","success":false,"error":"ya existe un permiso con el nombre 'Bulk A'"}
  ]
}
```
⚠️ **BUG-PERMISSIONS-05:** El bulk **no es atómico**. Si un item falla, los
demás SÍ se persisten. El status code sigue siendo 200 y `success:true` aunque
hubo fallos. El cliente debe inspeccionar `results[i].success` para detectar
fallos parciales.

Decisión de negocio: si esto es intencional, documentar. Si debe ser
transaccional, envolver el use-case en una transacción y rollback si algún
item falla.

### 5. Filtro: GET /permissions?scope_id=2
**Esperado (200):** subset filtrado, `business_type_name` poblado.

### 6. Filtro: GET /permissions?business_type_id=1
**Esperado (200):** solo permissions de business_type 1.

### 7. Filtro: GET /permissions?name=Usuarios
**Esperado (200):** búsqueda parcial sobre name.

### 8. Path filter: GET /permissions/scope/2
**Observado:** lista filtrada por scope.
⚠️ Pero `business_type_name` vacío (BUG-PERMISSIONS-02 reaparece).

### 9. Path filter: GET /permissions/resource/Usuarios
**Esperado (200):** los 4 permissions de Usuarios.
⚠️ Mismo problema con `business_type_name`.

## Limpieza
```bash
# Vía API, no DB directa:
for id in <ids_bulk>; do
  curl -X DELETE "http://localhost:3050/api/v1/permissions/$id" -H "Authorization: Bearer $TOKEN"
done
```

## Notas
- Filtros `name`, `scope_id`, `business_type_id`, `resource` por **query**
  funcionan.
- Filtros equivalentes por **path** (`/scope/:scope_id`, `/resource/:resource`)
  también funcionan pero pierden el join con `business_type` en el mapper.
