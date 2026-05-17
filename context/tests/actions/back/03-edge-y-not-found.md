# 03 — GET/PUT/DELETE actions edge cases

**Módulo:** actions   **Tipo:** back   **Estado:** ⚠️ BUG

## Pasos

### 1. GET /actions/9999 (inexistente)
**Observado (500):**
```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error": "error al obtener action: action con ID 9999 no encontrado"
}
```

⚠️ **BUG-ACTIONS-01:** El error de dominio `action con ID 9999 no encontrado`
está bien construido en el use-case/repo, pero el handler no lo distingue
del resto de errores → mapea a 500. Debería ser 404.

### 2. PUT /actions/9999
```http
PUT /api/v1/actions/9999
Content-Type: application/json

{"name":"X","description":"x"}
```
**Observado (404):**
```json
{
  "success": false,
  "message": "Action no encontrado",
  "error": "action con ID 9999 no encontrado"
}
```
✅ El PUT sí mapea correctamente. El handler de PUT distingue el error y
retorna 404.

### 3. DELETE /actions/9999
**Observado (404):** mismo formato que PUT. ✅

### 4. GET /actions/abc (id no numérico)
**Observado (400):**
```json
{
  "success": false,
  "message": "ID de action inválido",
  "error": "El ID del action debe ser un número válido"
}
```
✅

### 5. DELETE /actions/1 (referenciado por permissions)
```http
DELETE /api/v1/actions/1
```
Action id=1 (`Create`) tiene 7 permissions asociadas.

**Observado (500):**
```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error": "error al eliminar action: no se puede eliminar el action porque tiene 7 permiso(s) asociado(s)"
}
```

⚠️ **BUG-ACTIONS-02:** La validación de integridad referencial **sí** está
implementada en el use-case, pero el handler no la distingue de un error
interno y retorna 500. Debería ser **409 Conflict** o **400 Bad Request**.

## Resumen
| Endpoint                | 9999 (no existe) | abc (malformado) | id referenciado |
|-------------------------|------------------|-------------------|------------------|
| GET    /actions/:id     | ❌ 500            | ✅ 400             | n/a              |
| PUT    /actions/:id     | ✅ 404            | ✅ 400 (asumido)   | n/a              |
| DELETE /actions/:id     | ✅ 404            | ✅ 400 (asumido)   | ❌ 500            |

## Notas
- El mismo patrón que `BUG-RESOURCES-01`: el GetByID handler no captura el
  not-found.
- Para `BUG-ACTIONS-02`, el error de dominio existe (con texto en español)
  pero el handler `delete-action.go` no lo identifica para mapear el status.
