# 02 — POST /actions errores

**Módulo:** actions   **Tipo:** back   **Estado:** ✅ OK

## Pasos

### 1. Body vacío
```http
POST /api/v1/actions
Content-Type: application/json

{}
```
**Esperado (400):**
```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "error": "Key: 'CreateActionRequest.Name' Error:Field validation for 'Name' failed on the 'required' tag"
}
```

### 2. Nombre duplicado
```json
{"name":"Create","description":"x"}
```
(Asume action `Create` ya existe — está en seed con id=1.)

**Esperado (409):**
```json
{
  "success": false,
  "message": "Action ya existe",
  "error": "ya existe un action con el nombre 'Create'"
}
```
✅ El handler valida antes de insertar y devuelve 409 limpio.

### 3. Sin description
```json
{"name":"NewAction"}
```
**Esperado (201):** `description` opcional, se acepta vacío.

### 4. Name muy largo (>50 chars)
**Esperado:** 400 con mensaje de constraint de longitud. Validar al ejecutar
si hay validación de tamaño explícita.

## Notas
- A diferencia de `resources` y `business-types`, actions **no** acepta
  `business_type_id`, así que no hay caso de FK violation aquí.
- Forma de error consistente: `{ success: false, message, error }`.
