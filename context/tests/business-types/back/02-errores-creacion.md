# 02 — POST /business-types errores

**Módulo:** business-types   **Tipo:** back   **Estado:** ✅ OK

## Pasos

### 1. Body vacío
```http
POST /api/v1/business-types
Content-Type: application/json

{}
```
**Esperado (400):**
```json
{
  "success": false,
  "error": "invalid_request",
  "message": "Los datos proporcionados son inválidos: Key: 'BusinessTypeRequest.Name' Error:Field validation for 'Name' failed on the 'required' tag"
}
```
✅ Note la forma: `error` es un **slug** (`invalid_request`), no el mensaje
literal. El mensaje legible va en `message`.

### 2. Nombre duplicado
```json
{"name":"Lerida Comercio","description":"x"}
```
**Esperado (409):**
```json
{
  "success": false,
  "error": "name_already_exists",
  "message": "El nombre del tipo de negocio ya está en uso. Por favor, proporciona un nombre diferente."
}
```
✅ Slug `name_already_exists`, mensaje legible.

### 3. Code duplicado (con name distinto)
```json
{"name":"Otro","code":"lerida-comercio","description":"x"}
```
**Esperado (409):** debería responder con `error: "code_already_exists"` y
mensaje explicando el conflicto.

Verificar al ejecutar si esto está implementado, porque el `code` también es
UNIQUE en DB.

### 4. Solo nombre (sin code → autogenerado)
```json
{"name":"Solo Nombre"}
```
**Esperado (201):** `data.code = "solo_nombre_<random6>"`.

## Notas
- Forma de error con `error` como slug es **distinta** al resto de módulos.
  El frontend puede usar el slug como i18n key.
- Forma consistente y bien implementada en POST. Los problemas surgen en
  PUT/DELETE/GET (ver casos 03 y RESULTS).
