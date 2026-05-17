# 02 — POST /businesses errores

**Módulo:** businesses   **Tipo:** back   **Estado:** ⚠️ BUG

## Pasos

### 1. Sin name
```bash
curl -X POST http://localhost:3050/api/v1/businesses \
  -H "Authorization: Bearer $TOKEN" \
  -F "business_type_id=<BT>"
```
**Esperado (400):**
```json
{
  "success": false,
  "error": "invalid_request",
  "message": "Los datos proporcionados son inválidos: Key: 'BusinessRequest.Name' Error:Field validation for 'Name' failed on the 'required' tag"
}
```
✅

### 2. Sin business_type_id
```bash
curl -X POST http://localhost:3050/api/v1/businesses \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Sin BT"
```
**Esperado (400):**
```json
{
  "success": false,
  "error": "business_type_required",
  "message": "El tipo de negocio es obligatorio. Por favor, proporciona un tipo de negocio válido."
}
```
✅ Validación específica con error slug.

### 3. business_type_id inválido
```bash
curl -X POST http://localhost:3050/api/v1/businesses \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Comercio BadBT" -F "business_type_id=999"
```
**Esperado (400):**
```json
{
  "success": false,
  "error": "business_type_invalid",
  "message": "El tipo de negocio especificado no existe o no es válido. Por favor, verifica el ID del tipo de negocio."
}
```
✅ Validación previa al INSERT, mensaje claro.

### 4. Name duplicado
Asume que ya existe un business `Comercio Test`.
```bash
curl -X POST http://localhost:3050/api/v1/businesses \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Comercio Test" -F "business_type_id=<BT>"
```
**Observado (201):**
```json
{ "success": true, "data": { "id": <N+1>, "name": "Comercio Test", ... } }
```

⚠️ **BUG-BUSINESSES-01:** No hay constraint UNIQUE en `business.name`, así
que duplicados pasan. Cada uno termina con un `code` autogenerado distinto.
Decisión de negocio: ¿el nombre debe ser único? Si sí, agregar constraint y
validación.

### 5. Code duplicado
```bash
curl -X POST http://localhost:3050/api/v1/businesses \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Otro" -F "code=lerida-comercio" -F "business_type_id=<BT>"
```
**Observado (201):** se crea sin error pese a que `code` se supone UNIQUE.

⚠️ **BUG-BUSINESSES-02:** Códigos duplicados pasan. El handler tiene un
caso `ErrBusinessCodeAlreadyExists` definido en `domain`, pero no se dispara.
Probablemente el repositorio no lo emite cuando hay colisión, o el unique
constraint no existe en DB.

Verificar:
```sql
\d business
-- Buscar UNIQUE en columna code.
```

## Notas
- Validaciones de input (name vacío, BT inválido) funcionan bien.
- Validaciones de unicidad (`name`, `code`) están **ausentes** o **rotas**.
