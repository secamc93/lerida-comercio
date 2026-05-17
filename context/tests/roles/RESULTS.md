# RESULTS — roles

## 2026-05-16 · primera pasada

| Caso                                | Resultado | Notas |
|-------------------------------------|-----------|-------|
| 01 — CRUD feliz                     | ✅ OK     | POST/GET/PUT/DELETE + asignar/quitar permisos OK. |
| 02 — Create errores                 | ⚠️ BUG    | Duplicado expone error SQL raw → BUG-ROLES-02. |
| 03 — PUT/DELETE inexistente, level  | ⚠️ BUG    | PUT 9999 → 500 raw GORM (BUG-ROLES-03); `/level/:level` no parsea (BUG-ROLES-04). |
| 04 — Sin token / token inválido     | ✅ OK     | 401 limpio. |

## Bugs encontrados

### BUG-ROLES-01 · `role_name`, `scope_name`, `scope_code` vacíos en GET /roles/:id/permissions

**Síntoma:** la respuesta de `GET /roles/3/permissions` trae los permisos,
pero `role_name=""` y los campos `scope_name`, `scope_code` de cada permiso
están vacíos.

**Severidad:** Baja. Datos disponibles en otras consultas, pero rompe el
contrato de la respuesta.

**Archivo:** `back/central/services/auth/roles/internal/infra/secondary/repository/*.go`
— el JOIN con `role` y `scope` falta o el mapper no pobla los campos.

### BUG-ROLES-02 · Duplicate key expone SQLSTATE al cliente

**Reproducir:** `POST /roles` con `name` ya existente.

**Síntoma:**
```json
{
  "error": "ERROR: duplicate key value violates unique constraint \"uni_role_name\" (SQLSTATE 23505)",
  "message": "Error al crear el rol",
  "success": false
}
HTTP 500
```

**Severidad:** Alta. Filtra detalles internos de DB; el cliente recibe 500
cuando es un conflicto de input → debería ser 409.

**Fix propuesto:**
1. En `internal/infra/secondary/repository/repository.go` (o el archivo
   que ejecute el `Create`), capturar el `pgconn.PgError`:
   ```go
   var pgErr *pgconn.PgError
   if errors.As(err, &pgErr) && pgErr.Code == "23505" {
       return domain.ErrRoleNameAlreadyExists
   }
   ```
2. Definir el error en `internal/domain/errors.go`.
3. En el handler, mapear `errors.Is(err, domain.ErrRoleNameAlreadyExists)` → `409 Conflict`.

### BUG-ROLES-03 · `gorm.ErrRecordNotFound` se filtra como 500

**Reproducir:** `PUT /roles/9999`.

**Síntoma:**
```json
{
  "error": "record not found",
  "message": "Error al actualizar el rol",
  "success": false
}
HTTP 500
```

**Severidad:** Alta. El handler debería retornar `404`. Es el mismo patrón
que BUG-ROLES-02 pero para `record not found`.

**Fix:**
1. Repositorio: capturar `errors.Is(err, gorm.ErrRecordNotFound)` → devolver
   `domain.ErrRoleNotFound`.
2. Handler: `errors.Is(err, domain.ErrRoleNotFound)` → `404`.

### BUG-ROLES-04 · `GET /roles/level/:level` no parsea el path param

**Síntoma:** `GET /roles/level/1` devuelve `400` con
`Level failed on the 'required' tag`.

**Causa probable:** en el request struct `GetRolesByLevelRequest`, el campo
`Level` no tiene `uri:"level"` (o el handler no llama `c.ShouldBindUri`).

**Severidad:** Alta. El endpoint está completamente roto.

**Fix:**
1. Validar `internal/infra/primary/handlers/request/get-roles-by-level-request.go`.
2. Tag esperado: `Level uint \`uri:"level" binding:"required,min=1"\``
3. Handler: `if err := c.ShouldBindUri(&req); err != nil { ... }` antes que
   `ShouldBindQuery`.
