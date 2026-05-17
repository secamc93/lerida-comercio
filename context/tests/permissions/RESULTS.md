# RESULTS — permissions

## 2026-05-16 · primera pasada

| Caso                                | Resultado | Notas |
|-------------------------------------|-----------|-------|
| 01 — CRUD feliz                     | ⚠️ BUG    | POST/PUT no devuelven el objeto creado, solo mensaje con id. `code` vacío, `business_type_name` inconsistente. |
| 02 — Create errores                 | ⚠️ BUG    | Nombre duplicado → 409 OK; FK inválida → 500 genérico (BUG-PERMISSIONS-04). |
| 03 — Edge & not-found               | ✅ OK     | 404 limpio en GET/PUT/DELETE inexistente. |
| 04 — Sin token                      | ✅ OK     | 401 en todos los verbos. |
| 05 — Bulk + filtros                 | ⚠️ BUG    | Bulk no atómico (BUG-PERMISSIONS-05); path-filters pierden `business_type_name`. |

## Bugs encontrados

### BUG-PERMISSIONS-01 · Campo `code` siempre vacío en respuesta

**Síntoma:** todas las respuestas de `/permissions/*` traen `"code": ""`.

**Causa:** la tabla `permission` no tiene columna `code` (`\d permission`),
pero el `PermissionResponse` lo expone como string. El handler `CreatePermission`
acepta `code` en el body pero nunca lo persiste — se descarta silenciosamente.

**Severidad:** Media. El frontend que dependa de `code` como identificador
estable (e.g. `users:create`) no tiene forma de obtenerlo.

**Archivo a revisar:**
- `back/migration/shared/models/permission.go` — agregar columna `code`.
- `back/central/services/auth/permissions/internal/infra/secondary/repository/mappers/mappers.go` —
  mapear `code` desde la entidad de DB.
- O bien quitar `code` de `PermissionResponse` y de los requests si se decide
  derivarlo desde `resource+action`.

### BUG-PERMISSIONS-02 · `business_type_name` vacío en respuestas anidadas

**Síntoma:** `GET /permissions` (lista raíz) trae `business_type_name`
poblado. Pero `GET /permissions/:id`, `GET /permissions/scope/:scope_id` y
`GET /permissions/resource/:resource` lo dejan vacío aunque `business_type_id`
sí está poblado.

**Severidad:** Baja. UI puede joiner por id, pero rompe contrato.

**Archivo a revisar:**
`back/central/services/auth/permissions/internal/infra/secondary/repository/permission_repository.go` —
las queries usadas por los endpoints de scope/resource/getByID no hacen
`Joins("BusinessType")` o el mapper no copia el campo.

### BUG-PERMISSIONS-03 · POST/PUT permission no devuelve el objeto creado

**Síntoma:**
```json
POST /permissions → 201 { "success": true, "message": "Permiso creado con ID: 29" }
PUT  /permissions/29 → 200 { "success": true, "message": "Permiso actualizado con ID: 29" }
```

Comparar con `resources`, `actions` y `business-types` que **sí** devuelven
`data: { /* objeto */ }` en POST/PUT.

**Severidad:** Media. Forza al cliente a hacer un GET adicional para mostrar
el detalle del recurso recién creado.

**Fix:** en `back/central/services/auth/permissions/internal/app/create-permission.go`
y `update-permission.go`, devolver el objeto (no solo el id) y ajustar
`response.PermissionMessageResponse` para incluir `data`.

### BUG-PERMISSIONS-04 · FK inválida en POST/PUT → 500 genérico sin contexto

**Reproducir:** `POST /permissions` con `resource_id=999`.

**Síntoma:**
```json
{ "error": "Error interno del servidor" }
HTTP 500
```

El handler captura el error pero el mensaje al cliente es opaco. En logs del
backend aparece el SQLSTATE 23503 (foreign_key_violation).

**Severidad:** Alta. El cliente no puede distinguir entre input inválido y
caída interna real.

**Fix:**
1. En `permission_repository.go`, capturar `*pgconn.PgError`:
   ```go
   var pgErr *pgconn.PgError
   if errors.As(err, &pgErr) && pgErr.Code == "23503" {
       return domain.ErrPermissionInvalidFK
   }
   ```
2. En handler: `errors.Is(err, domain.ErrPermissionInvalidFK)` → 400 con
   mensaje específico citando la FK violada (`resource_id`, `action_id`,
   `scope_id` o `business_type_id`).

### BUG-PERMISSIONS-05 · `/permissions/bulk` no es transaccional

**Reproducir:** enviar 2 items, donde el segundo tiene un nombre ya existente.

**Síntoma:** el primer item se crea, el segundo falla. Status 200 con
`success: true` y `results: [{success:true}, {success:false, error:...}]`.

**Severidad:** Media. Si el cliente espera "todo o nada", queda con datos
parciales. Si la API explícitamente permite fallos parciales, debería
documentarse y el status code debería reflejarlo (e.g. 207 Multi-Status).

**Archivo a revisar:**
`back/central/services/auth/permissions/internal/app/bulk-create-permissions.go` —
decidir comportamiento (transacción o no) y alinear con el contrato.

## Patrón general (módulo permissions)

- Respuestas de éxito tienen `success: true` + `message`/`data`.
- Respuestas de error tienen forma variada:
  - `{ "error": "..." }` (404, sin `success`)
  - `{ "success": false, "message": "..." }` (bulk inválido)
  - `{ "error": "Error interno del servidor" }` (500 raw)

Recomendación: unificar a `{ "success": boolean, "message": "...", "error": "..." }`.

## IDs huérfanos / contaminación post-test

Ninguno tras esta pasada (los items `Test Perm` y `Bulk *` fueron borrados via
`DELETE /permissions/:id`). El soft-delete deja `deleted_at` poblado en DB.
