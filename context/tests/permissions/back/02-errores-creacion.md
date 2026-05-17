# 02 — POST /permissions errores

**Módulo:** permissions   **Tipo:** back   **Estado:** ⚠️ BUG

## Objetivo
Validar la respuesta del endpoint de creación ante body inválido, nombre
duplicado y foreign keys inválidas.

## Pasos

### 1. Body vacío
```http
POST /api/v1/permissions
Content-Type: application/json

{}
```
**Esperado (400):**
```json
{
  "error": "Datos de entrada inválidos: Key: 'CreatePermissionRequest.Name' Error:Field validation for 'Name' failed on the 'required' tag\nKey: 'CreatePermissionRequest.ResourceID' ...\nKey: 'CreatePermissionRequest.ActionID' ...\nKey: 'CreatePermissionRequest.ScopeID' ..."
}
```
✅ El validador retorna mensaje raw del binding de Gin. No incluye `success: false`
en el cuerpo (forma `{ error }` solamente).

### 2. Nombre duplicado
```json
{"name":"Create Usuarios","description":"x","resource_id":1,"action_id":1,"scope_id":2}
```
**Observado (409):**
```json
{ "error": "ya existe un permiso con el nombre 'Create Usuarios'" }
```
✅ Se maneja como 409 desde el use-case (validación previa). El SQLSTATE 23505
no se llega a propagar — el handler tiene fallback explícito en caso de que
ocurra (ver `create-permission.go` líneas 60-70).

### 3. FK inválida (resource_id inexistente)
```json
{"name":"Bad FK","description":"x","resource_id":999,"action_id":1,"scope_id":2}
```
**Observado (500):**
```json
{ "error": "Error interno del servidor" }
```

⚠️ **BUG-PERMISSIONS-04:** El error de FK constraint se mapea a 500 genérico
sin ningún detalle. Esperado: 400 con mensaje `"El resource_id no existe"`.

### 4. action_id inválido
Mismo patrón → 500 genérico.

### 5. scope_id inválido
```json
{"name":"Bad Scope","description":"x","resource_id":1,"action_id":1,"scope_id":99}
```
**Esperado:** 400 indicando que el scope no existe.
**Probable:** 500 (mismo patrón). Validar al ejecutar.

## Notas
- Inconsistencia de shape: errores devuelven `{ error }` plano; éxito
  devuelve `{ success, message }`. No hay `success: false` en errores 400/409
  de este módulo.
- Ver `RESULTS.md` para `BUG-PERMISSIONS-04` y fix sugerido (catch de
  `*pgconn.PgError` con code `23503` → 400).
