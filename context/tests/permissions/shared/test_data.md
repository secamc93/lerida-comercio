# Datos base — Permissions

Base: `http://localhost:3050/api/v1/permissions`. Token: super admin.

## Permissions seed (28 registros)

Todos `scope_id=2` (business). Combinación `(resource_id, action_id)` cubre los
CRUD básicos para 7 recursos. `business_type_id=1` para 24 registros, `NULL`
para los 4 de Notificaciones (resource_id=7).

```sql
SELECT id, name, resource_id, action_id, scope_id, business_type_id
FROM permission ORDER BY id;
```

Resumen:

| Rango id | Recurso        | Notas                                   |
|----------|----------------|-----------------------------------------|
| 1-4      | Usuarios       | Create/Read/Update/Delete               |
| 5-8      | Permisos       | "                                       |
| 9-12     | Roles          | "                                       |
| 13-16    | Recursos       | "                                       |
| 17-20    | Empresas       | "                                       |
| 21-24    | Integraciones  | "                                       |
| 25-28    | Notificaciones | `business_type_id = NULL` (genéricos)   |

## Contrato

### POST /permissions
```json
{
  "name": "Crear usuario",        // requerido, único
  "code": "users:create",         // opcional (campo deprecado, ver BUG-PERMISSIONS-01)
  "description": "...",           // opcional
  "resource_id": 1,               // requerido
  "action_id": 1,                 // requerido
  "scope_id": 2,                  // requerido (1=platform, 2=business)
  "business_type_id": 1           // opcional (puntero)
}
```

Respuesta exitosa (201):
```json
{ "success": true, "message": "Permiso creado con ID: 29" }
```
Nota: el response **NO devuelve el objeto creado**, solo el id incrustado en el mensaje.

### PUT /permissions/:id
Mismos campos requeridos que POST. Misma forma de respuesta (mensaje con id).

### DELETE /permissions/:id
Sin body. Respuesta `200 { success: true, message: "Permiso eliminado con ID: N" }`.

### POST /permissions/bulk
```json
{
  "permissions": [
    {"name":"Bulk A","resource_id":1,"action_id":5,"scope_id":2},
    {"name":"Bulk B","resource_id":1,"action_id":6,"scope_id":2}
  ]
}
```
- `permissions` requerido, `min=1`.
- Respuesta `200` con `results: []` reportando éxito/fallo por item.
- Si algún item falla por nombre duplicado, los demás SÍ se crean (semipersistente).

## Filtros disponibles (path / query)

- `GET /permissions` con query: `business_type_id`, `name`, `scope_id`, `resource`.
- `GET /permissions/:id`
- `GET /permissions/scope/:scope_id`
- `GET /permissions/resource/:resource` (nombre del recurso, no id — string)

## Forma de respuesta del recurso (`PermissionResponse`)

```json
{
  "id": 1,
  "name": "Create Usuarios",
  "code": "",
  "description": "Create Usuarios",
  "resource": "Usuarios",
  "action": "Create",
  "resource_id": 1,
  "action_id": 1,
  "scope_id": 2,
  "scope_name": "Business",
  "scope_code": "business",
  "business_type_id": 1,
  "business_type_name": "Lerida Comercio"
}
```

**Observaciones de campos:**
- `code` siempre llega vacío en TODA respuesta — la columna no existe en la
  tabla. Ver `BUG-PERMISSIONS-01`.
- `business_type_name` aparece poblado solo en `GET /permissions` (lista raíz);
  está vacío en `/permissions/:id`, `/scope/:scope_id`, `/resource/:resource`.
  Ver `BUG-PERMISSIONS-02`.

## Limpieza
- Borrar permissions de prueba vía `DELETE /permissions/:id` antes de cerrar.
- Si `POST /bulk` deja items con nombres tipo `Bulk %`, listarlos con
  `SELECT id, name FROM permission WHERE name LIKE 'Bulk %';` y eliminarlos por
  id vía API.
