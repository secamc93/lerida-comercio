# 02 — POST /resources errores

**Módulo:** resources   **Tipo:** back   **Estado:** ⚠️ BUG

## Pasos

### 1. Body vacío
```http
POST /api/v1/resources
Content-Type: application/json

{}
```
**Esperado (400):**
```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "error": "Key: 'CreateResourceRequest.Name' Error:Field validation for 'Name' failed on the 'required' tag"
}
```
✅ Forma `{ success: false, message, error }`.

### 2. Nombre duplicado
Asume que `TestResource` ya existe (creado en 01).
```json
{"name":"TestResource","description":"otra"}
```
**Esperado (409):**
```json
{
  "success": false,
  "message": "Recurso ya existe",
  "error": "ya existe un recurso con el nombre 'TestResource'"
}
```
✅ El handler valida previamente y devuelve 409 limpio.

### 3. business_type_id inválido (FK)
```json
{"name":"WithBT","description":"x","business_type_id":999}
```
**Observado (500):**
```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error": "error al crear recurso: ERROR: insert or update on table \"resource\" violates foreign key constraint \"fk_business_type_resources\" (SQLSTATE 23503)"
}
```

⚠️ **BUG-RESOURCES-02:** El error de FK se filtra al cliente como 500 con
mensaje SQL raw. Debe mapearse a 400 con texto amigable
`"El business_type_id no existe"`.

## Notas
- Diferencia con `permissions`: aquí sí viene `success: false` en errores, y
  además un `error` con el mensaje original. La forma es más consistente.
- Bug en RESULTS.md (`BUG-RESOURCES-02`).
