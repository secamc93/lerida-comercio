# Datos base — Business Types

Base: `http://localhost:3050/api/v1/business-types`. Token: super admin.

## Estado del seed (al inicio)

```sql
SELECT id, name, code, is_active FROM business_type ORDER BY id;
```

| ID | Nombre          | Code            | is_active |
|----|-----------------|-----------------|-----------|
| 1  | Lerida Comercio | lerida-comercio | true      |

⚠️ **Importante:** durante la primera pasada de tests, **se eliminó por error
el BT id=1** (caso 03 lo recreó como id=4). Si la DB se reinicializa con
`make seed`, vuelve al estado original.

## Contrato

### POST /business-types
```json
{
  "name": "Restaurante",        // requerido, único
  "code": "restaurante",        // opcional (si vacío, se autogenera con sufijo aleatorio)
  "description": "...",         // opcional
  "icon": "store",              // opcional (nombre de ícono)
  "is_active": true             // opcional, default true
}
```

Respuesta `201`:
```json
{
  "success": true,
  "message": "Tipo de negocio creado exitosamente",
  "data": { "id": <N>, "name": "...", "code": "...", "description": "...",
            "icon": "...", "is_active": true,
            "created_at": "...", "updated_at": "..." }
}
```

⚠️ Si NO se envía `code`, el backend genera uno con la forma
`<slug-del-name>_<6chars-random>`, e.g. `test_bt_9vB6ZA`. Esto **no es
predecible** y rompe testing reproducible. Ver `BUG-BT-04`.

### PUT /business-types/:id
Mismos campos. **No permite cambiar `code`** (lo conserva). Respuesta `200`
con `data` actualizado.

### DELETE /business-types/:id
Sin body. Respuesta `200`:
```json
{ "success": true, "message": "Tipo de negocio eliminado exitosamente" }
```

⚠️ El delete es **destructivo y no valida integridad referencial**. Si
business_type está referenciado por `business` o `permission`:
- `business`: FK sin `ON DELETE`, así que al borrar BT con businesses
  asociados, el INSERT/UPDATE de business fallaría. Pero **el delete del BT
  pasa sin error** porque hace soft delete (`deleted_at`) y la FK no se viola.
- `permission`: FK con `ON DELETE SET NULL`. Si BT se borra de verdad (no
  soft), todas las permissions referenciadas quedan con `business_type_id =
  NULL`. Ver `BUG-BT-05`.

### GET /business-types
Sin paginación.
```json
{
  "success": true,
  "message": "Tipos de negocio obtenidos exitosamente",
  "data": [ /* lista plana */ ]
}
```

## Limpieza
- Borrar BTs de prueba vía `DELETE /business-types/:id` antes de cerrar.
- **No** borrar el BT 1 (`Lerida Comercio`) — usuarios y businesses lo
  referencian.
- Si por error se borra: recrear con
  `POST /business-types {"name":"Lerida Comercio","code":"lerida-comercio",...}`.
