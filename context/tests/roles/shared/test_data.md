# Datos base — Roles

Base: `http://localhost:3050/api/v1/roles`. Token: super admin.

## Roles seed

| ID | Nombre        | Scope    | Level | is_system | business_type_id |
|----|---------------|----------|-------|-----------|------------------|
| 1  | Super Admin   | platform | 1     | true      | 0                |
| 2  | Operador      | platform | 2     | true      | 0                |
| 3  | Administrador | business | 1     | false     | 1                |

## Contrato

### POST /roles
```json
{
  "name": "Tester",              // requerido, único
  "description": "Rol de pruebas", // requerido
  "level": 3,                    // requerido, uint
  "is_system": false,            // opcional
  "scope_id": 2,                 // requerido (1=platform, 2=business)
  "business_type_id": 1          // requerido si scope=business
}
```

### PUT /roles/:id
Mismos campos requeridos al crear.

### POST /roles/:id/permissions
```json
{ "permission_ids": [1, 2, 3] }
```

### DELETE /roles/:id/permissions/:permission_id
Sin body.

## Filtros disponibles
- `GET /roles/scope/:scope_id`
- `GET /roles/level/:level` — ⚠️ ver BUG-ROLES-03 (URI binding falla)
- `GET /roles/system`

## Limpieza
Borrar roles test creados durante la pasada antes de cerrar la sesión:
`DELETE /roles/:id` (verificar que no quede colgado).
