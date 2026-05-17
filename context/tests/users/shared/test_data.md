# Datos base — Users

## Endpoint base
`http://localhost:3050/api/v1/users`

## Estado en DB (seed inicial)

```sql
SELECT id, email, name FROM "user" ORDER BY id;
-- id | email              | name
-- 1  | admin@lerida.local | Super Admin
```

## Contrato (resumido — ver `back/central/services/auth/users/internal/infra/primary/handlers/request/*.go`)

### POST /users
```json
{
  "name": "Test User",          // requerido, 2-100
  "email": "test@x.com",        // requerido, formato email
  "phone": "3001112233",        // opcional, len exacto 10
  "avatar_url": "https://...",  // opcional, URL válida
  "is_active": true,            // opcional
  "scope_id": 2,                // opcional: 1 platform | 2 business
  "business_ids": [1, 2]        // opcional
}
```
La password **se genera automáticamente** en backend y se devuelve UNA VEZ.

### PUT /users/:id
Mismos campos, todos opcionales.

### POST /users/:id/assign-role
```json
{
  "assignments": [
    {"business_id": 1, "role_id": 3},
    {"business_id": 0, "role_id": 1}   // business_id=0 admitido solo para super admin
  ]
}
```

### GET /users (paginación)
Query: `?page=1&page_size=10&name=&email=&phone=&role_id=&business_id=&is_active=&sort_by=created_at&sort_order=desc&include_deleted=false`.

Respuesta:
```json
{
  "success": true,
  "data": [ /* users */ ],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total": N,
    "last_page": M,
    "has_next": bool,
    "has_prev": bool
  }
}
```

## Limpieza tras tests
- Borrar usuarios de prueba (`DELETE /users/:id`) antes de terminar.
- Si el delete falla, anotar el ID en `RESULTS.md` para limpieza manual.
