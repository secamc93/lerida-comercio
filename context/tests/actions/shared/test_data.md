# Datos base — Actions

Base: `http://localhost:3050/api/v1/actions`. Token: super admin.

## Actions seed (13 registros)

```sql
SELECT id, name FROM action ORDER BY id;
```

| ID | Nombre    |
|----|-----------|
| 1  | Create    |
| 2  | Read      |
| 3  | Update    |
| 4  | Delete    |
| 5  | Manage    |
| 6  | Approve   |
| 7  | Reject    |
| 8  | Assign    |
| 9  | Schedule  |
| 10 | Report    |
| 11 | Configure |
| 12 | Audit     |
| 13 | Migrate   |

Las actions 1-4 son referenciadas por permissions (FK `permission.action_id`).

## Contrato

### POST /actions
```json
{
  "name": "create",        // requerido, único
  "description": "..."     // opcional
}
```

Respuesta `201`:
```json
{
  "success": true,
  "message": "Action creado exitosamente",
  "data": { "id": <N>, "name": "...", "description": "...",
            "created_at": "...", "updated_at": "..." }
}
```

### PUT /actions/:id
Mismos campos. Respuesta `200` con `data` actualizado.

### DELETE /actions/:id
Sin body. Respuesta `200`:
```json
{ "success": true, "message": "Action eliminado con ID: <N>" }
```

### GET /actions (paginación)
Query: `?page=1&page_size=10&name=`.

Respuesta:
```json
{
  "success": true,
  "message": "Actions obtenidos exitosamente",
  "data": {
    "actions": [ /* items */ ],
    "total": 13, "page": 1, "page_size": 10, "total_pages": 2
  }
}
```

⚠️ Mismo formato anidado que `resources` (data.actions + paginación dentro
de data). Inconsistente con `users`.

## Limpieza
- Borrar actions de prueba vía `DELETE /actions/:id` antes de cerrar.
- **No** intentar borrar actions 1-4 desde tests: están referenciadas por
  permissions y el delete falla con 500 (`BUG-ACTIONS-03`).
