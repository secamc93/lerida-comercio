# Datos base — Businesses

Base: `http://localhost:3050/api/v1/businesses`. Token: super admin.

## Estado del seed (al inicio)

Sin businesses en seed:
```sql
SELECT id, name, code, business_type_id, is_active FROM business ORDER BY id;
-- (0 rows)
```

Crear al menos uno antes de probar GET/PUT/DELETE/configured-resources.

## Contrato

### POST /businesses (multipart/form-data)

⚠️ **Importante:** el endpoint espera **multipart/form-data**, NO JSON. Esto
es así porque acepta archivos (`logo_file`, `navbar_image_file`). Usar
`curl -F` o `multipart` desde el cliente, no `Content-Type: application/json`.

Campos:
| Campo                | Tipo    | Requerido | Default       |
|----------------------|---------|-----------|---------------|
| name                 | string  | sí        | -             |
| code                 | string  | no        | auto (slug+random) |
| business_type_id     | uint    | sí        | -             |
| timezone             | string  | no        | "America/Bogota" |
| address              | string  | no        | ""            |
| description          | string  | no        | ""            |
| logo_file            | file    | no        | -             |
| primary_color        | string  | no        | "#1f2937"     |
| secondary_color      | string  | no        | "#3b82f6"     |
| tertiary_color       | string  | no        | "#10b981"     |
| quaternary_color     | string  | no        | "#fbbf24"     |
| navbar_image_file    | file    | no        | -             |
| custom_domain        | string  | no        | ""            |
| is_active            | bool    | no        | true          |
| enable_delivery      | bool    | no        | false         |
| enable_pickup        | bool    | no        | false         |
| enable_reservations  | bool    | no        | true (verificado en respuesta) |

Respuesta `201`:
```json
{
  "success": true,
  "message": "Negocio creado exitosamente",
  "data": {
    "id": <N>, "name": "...", "description": "...", "address": "...",
    "phone": "", "email": "", "website": "",
    "logo_url": "", "primary_color": "...", ..., "navbar_image_url": "",
    "is_active": true, "business_type_id": <BT>, "business_type": "Lerida Comercio",
    "created_at": "...", "updated_at": "..."
  }
}
```

### PUT /businesses/:id
Mismo multipart. Todos los campos opcionales. Respuesta `200` con `data`
actualizado.

### DELETE /businesses/:id
Sin body. Respuesta `200`:
```json
{ "success": true, "message": "Negocio eliminado exitosamente" }
```
Soft-delete (campo `deleted_at` poblado en DB).

### GET /businesses (paginación)
Query: `?page=1&page_size=10`. Sin filtros adicionales documentados.

Respuesta:
```json
{
  "success": true,
  "message": "Negocios obtenidos exitosamente",
  "data": [ /* items */ ],
  "pagination": {
    "current_page": 1, "per_page": 10, "total": 0,
    "last_page": 0, "has_next": false, "has_prev": false
  }
}
```
✅ Forma consistente con `users`.

### GET /businesses/simple
Sin paginación, sin filtros:
```json
{ "success": true, "message": "Negocios obtenidos exitosamente", "data": [] }
```

### GET /businesses/:id
Respuesta con info completa (incluye `business_type` anidado, no solo el id).

### PUT /businesses/:id/activate y /deactivate
Sin body. Respuesta:
```json
{ "success": true, "message": "Business [des]activado exitosamente" }
```

### GET /businesses/configured-resources
Devuelve lista de **todos** los businesses con su configuración de recursos
activos/inactivos.

### GET /businesses/:id/configured-resources
Mismo formato para un solo business.

### PUT /businesses/configured-resources/:resource_id/activate?business_id=N
Activa el recurso N para el business indicado.
Sin business_id en query → 400 (super admin requiere el param).

### PUT /businesses/configured-resources/:resource_id/deactivate?business_id=N
Mismo patrón.

## Limpieza
- Borrar businesses de prueba vía `DELETE /businesses/:id`.
- Soft delete — los IDs no se reutilizan; `SELECT id, name, deleted_at FROM
  business` muestra históricos.
