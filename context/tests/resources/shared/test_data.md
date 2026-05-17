# Datos base — Resources

Base: `http://localhost:3050/api/v1/resources`. Token: super admin.

## Resources seed (7 registros)

```sql
SELECT id, name, business_type_id FROM resource ORDER BY id;
```

| ID | Nombre         | business_type_id |
|----|----------------|-------------------|
| 1  | Usuarios       | NULL              |
| 2  | Permisos       | NULL              |
| 3  | Roles          | NULL              |
| 4  | Recursos       | NULL              |
| 5  | Empresas       | NULL              |
| 6  | Integraciones  | NULL              |
| 7  | Notificaciones | NULL              |

Todos genéricos (sin business_type asociado).

## Contrato

### POST /resources
```json
{
  "name": "users",              // requerido, único
  "description": "...",         // opcional
  "business_type_id": 1         // opcional (puntero; nil = genérico)
}
```
Respuesta `201`:
```json
{
  "success": true,
  "message": "Recurso creado exitosamente",
  "data": { "id": <N>, "name": "...", "description": "...",
            "business_type_id": 0, "business_type_name": "",
            "created_at": "...", "updated_at": "..." }
}
```

### PUT /resources/:id
Mismos campos. Respuesta `200` con `data` del objeto actualizado.

### DELETE /resources/:id
Sin body. Respuesta `200`:
```json
{ "success": true, "message": "Recurso eliminado permanentemente con ID: <N>" }
```
⚠️ Mensaje dice "permanentemente" pero la tabla tiene `deleted_at`. Verificar
si es soft o hard delete.

### GET /resources (paginación)
Query: `?page=1&page_size=10&name=&description=&business_type_id=&sort_by=name&sort_order=asc`.

Respuesta:
```json
{
  "success": true,
  "message": "Recursos obtenidos exitosamente",
  "data": {
    "resources": [ /* items */ ],
    "total": 7,
    "page": 1,
    "page_size": 10,
    "total_pages": 1
  }
}
```

⚠️ Nota: la paginación queda **anidada en `data.resources`** (no en
`pagination` separado como en `users`). Inconsistente con el resto de
módulos.

## Forma de respuesta del recurso

```json
{
  "id": 1,
  "name": "Usuarios",
  "description": "Gestión de usuarios",
  "business_type_id": 0,
  "business_type_name": "",
  "created_at": "...",
  "updated_at": "..."
}
```

`business_type_id` viene `0` cuando es NULL en DB (no se preserva como
puntero/null en respuesta).

## Limpieza
- Borrar resources de prueba vía `DELETE /resources/:id` antes de cerrar.
- Tras el DELETE, los IDs no se reutilizan (autoincrement sigue).
