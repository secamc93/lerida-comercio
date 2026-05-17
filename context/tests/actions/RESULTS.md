# RESULTS — actions

## 2026-05-16 · primera pasada

| Caso                                | Resultado | Notas |
|-------------------------------------|-----------|-------|
| 01 — CRUD feliz                     | ✅ OK     | POST/GET/PUT/DELETE devuelven `data` con el objeto. |
| 02 — Create errores                 | ✅ OK     | Duplicado → 409 limpio; body vacío → 400. Sin FK que probar. |
| 03 — Edge & not-found               | ⚠️ BUG    | GET /actions/9999 → 500 (BUG-ACTIONS-01); DELETE con FK → 500 (BUG-ACTIONS-02). |
| 04 — Sin token                      | ✅ OK     | 401 limpio. |

## Bugs encontrados

### BUG-ACTIONS-01 · `GET /actions/:id` devuelve 500 cuando el id no existe

**Reproducir:** `GET /actions/9999`.

**Síntoma:**
```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error": "error al obtener action: action con ID 9999 no encontrado"
}
HTTP 500
```

**Severidad:** Alta. El error de dominio (`action con ID N no encontrado`)
ya está construido correctamente en el repo/usecase, pero el handler no lo
diferencia de un error interno.

**Archivo a revisar:**
`back/central/services/auth/actions/internal/infra/primary/handlers/get-action-by-id.go`

**Fix:**
```go
if errors.Is(err, domain.ErrActionNotFound) {
    c.JSON(http.StatusNotFound, ...)
    return
}
// fallback 500
```
(El error de dominio probablemente ya existe en `internal/domain/errors.go`.
Si no, definirlo y mapearlo desde el repo.)

### BUG-ACTIONS-02 · `DELETE /actions/:id` con FK violation devuelve 500

**Reproducir:** `DELETE /actions/1` (Create — referenciado por 7 permissions).

**Síntoma:**
```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error": "error al eliminar action: no se puede eliminar el action porque tiene 7 permiso(s) asociado(s)"
}
HTTP 500
```

**Severidad:** Alta. La validación de integridad está bien implementada en
el use-case (texto descriptivo del problema), pero el handler responde 500
en vez de 409.

**Archivo a revisar:**
`back/central/services/auth/actions/internal/infra/primary/handlers/delete-action.go`
y `internal/app/delete-action.go` (donde se decide el error).

**Fix:**
- Definir `domain.ErrActionInUse` en `internal/domain/errors.go`.
- En el use-case, retornar este error envuelto con `fmt.Errorf("%w: ...", ...)`.
- En el handler, capturar con `errors.Is(...)` → 409.

## Patrón general

- Respuestas siempre con forma `{ success, message, [data|error] }`.
- POST/PUT devuelven `data` (objeto creado/actualizado). ✅
- 404 correcto en PUT/DELETE inexistente, pero **mal** en GET (BUG-ACTIONS-01).
- 500 indebido para errores de negocio (FK in-use).

## IDs huérfanos

Ninguno tras esta pasada. Los actions test (`TestAction`) fueron borrados
vía API.
