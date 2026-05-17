# RESULTS — business-types

## 2026-05-16 · primera pasada

| Caso                                | Resultado | Notas |
|-------------------------------------|-----------|-------|
| 01 — CRUD feliz                     | ⚠️ BUG    | PUT con `is_active=false` no aplica (BUG-BT-06); code se autogenera con sufijo random (BUG-BT-04). |
| 02 — Create errores                 | ✅ OK     | Validación + duplicados manejados con slug + mensaje. |
| 03 — Edge & not-found               | ⚠️ BUG    | GET/PUT/DELETE 9999 → 500 (BUG-BT-01/02/03); DELETE de BT referenciado pasa sin error (BUG-BT-05). |
| 04 — Sin token                      | ✅ OK     | 401 limpio. |

## Bugs encontrados

### BUG-BT-01 · `GET /business-types/:id` devuelve 500 con `error:"internal_error"` cuando el id no existe

**Reproducir:** `GET /business-types/9999`.

**Síntoma:**
```json
{
  "success": false,
  "error": "internal_error",
  "message": "Error interno del servidor"
}
HTTP 500
```

**Severidad:** Alta. Cliente no puede distinguir not-found de caída interna.

**Archivo a revisar:**
`back/central/services/auth/bussines/internal/infra/primary/controllers/businesstypehandler/get-business-type-by-id.go`

**Fix:** capturar `errors.Is(err, gorm.ErrRecordNotFound)` o el error de
dominio equivalente → 404 con slug `not_found`.

### BUG-BT-02 · `PUT /business-types/:id` devuelve 500 cuando el id no existe

Mismo patrón que BUG-BT-01, en el handler `update-business-type.go`.

### BUG-BT-03 · `DELETE /business-types/:id` devuelve 500 cuando el id no existe

Mismo patrón en `delete-business-type.go`.

### BUG-BT-04 · El campo `code` autogenerado añade sufijo aleatorio impredecible

**Reproducir:**
```http
POST /business-types {"name":"Test BT","description":"x"}
```

**Síntoma:** `data.code = "test_bt_9vB6ZA"`. La siguiente vez será otro
sufijo, lo cual rompe test reproducibles y la idea de "code estable como
identificador semántico".

**Archivo a revisar:**
`back/central/services/auth/bussines/internal/app/usecasebusinesstype/create-business-type.go`
y/o el mapper que genera el code.

**Recomendación:**
- Si la intención es que el cliente envíe code y, si no lo hace, se genere
  desde el name, hacerlo determinístico (slug del name) y solo añadir sufijo
  si ya existe colisión.
- O hacer `code` obligatorio en el body si debe ser semántico.

### BUG-BT-05 (CRÍTICO) · `DELETE /business-types/:id` no valida integridad

**Reproducir:**
```http
DELETE /api/v1/business-types/1
```
Con permissions referenciando `business_type_id=1`.

**Síntoma:**
```json
{ "success": true, "message": "Tipo de negocio eliminado exitosamente" }
HTTP 200
```

**Efectos colaterales medidos:**
1. La fila `business_type` id=1 **desaparece** (la query `SELECT FROM
   business_type` la deja fuera; soft o hard delete sin distinguir).
2. **Todas las permissions** con `business_type_id=1` quedan con
   `business_type_id = NULL` por la FK `ON DELETE SET NULL`.

**Severidad:** Crítica. Pérdida silenciosa de relaciones entre permissions y
business_types. Si la app depende de filtrar permissions por business_type,
quedan invisibles.

**Archivo a revisar:**
- `back/central/services/auth/bussines/internal/app/usecasebusinesstype/delete-business-type.go`
- FK definitions en `back/migration/shared/models/permission.go` y `business.go`.

**Fix propuesto:**
1. Antes de eliminar, contar `SELECT count(*) FROM business WHERE business_type_id=?`
   y `SELECT count(*) FROM permission WHERE business_type_id=?`.
2. Si hay referencias, devolver `409 Conflict` con cuenta de referencias.
3. Alternativa: hacer hard-delete intencional pero loguear las permissions
   afectadas y exponerlas en la respuesta.
4. Considerar cambiar la FK a `ON DELETE RESTRICT` para fallar a nivel de DB.

### BUG-BT-06 · `PUT` con `is_active=false` no aplica el cambio

**Reproducir:**
```http
PUT /business-types/2
Content-Type: application/json

{"name":"X","is_active":false}
```

**Síntoma:** En la respuesta `data.is_active` vuelve a `true`. La columna en
DB queda en `true`.

**Severidad:** Media. No se puede desactivar un BT vía la API; la única vía
sería un UPDATE manual en DB.

**Causa probable:** el mapper de request a entidad ignora `is_active=false`
porque lo trata como zero-value de Go. Patrón típico de uso de `bool` en vez
de `*bool` cuando el campo es opcional.

**Archivo a revisar:**
`back/central/services/auth/bussines/internal/infra/primary/controllers/businesstypehandler/request/business-type-request.go`
y el mapper.

**Fix:** cambiar el campo `IsActive bool` a `IsActive *bool` en el request
del PUT, y aplicar el valor sólo si el puntero no es nil.

## Patrón general

- POST y errores de creación bien implementados (slug + mensaje).
- Errores not-found en GET/PUT/DELETE son catastróficamente genéricos (500
  con `error:internal_error`).
- DELETE no valida referencias — el bug más serio del módulo.

## IDs huérfanos / contaminación post-test

**SÍ HAY contaminación grave de la DB tras esta pasada:**
- El BT id=1 (`Lerida Comercio`) fue eliminado durante el caso 03 (probando
  DELETE de BT referenciado).
- Se recreó vía API como id=4 con los mismos campos (`name`, `code`,
  `description`). Pero los IDs no coinciden con el seed original.
- Las permissions (28 rows) ahora tienen `business_type_id = NULL` para todas
  las que originalmente eran 1.

**Restauración:** correr `make seed` después de testing si se necesita el
estado original. Las permissions volverán a tener `business_type_id = 1`.
