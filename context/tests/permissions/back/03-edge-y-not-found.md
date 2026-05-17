# 03 — GET/PUT/DELETE permissions edge cases

**Módulo:** permissions   **Tipo:** back   **Estado:** ✅ OK

## Objetivo
Validar el comportamiento 404 y errores de URI binding en los endpoints de
permissions.

## Pasos

### 1. GET /permissions/9999 (inexistente)
**Esperado (404):**
```json
{ "error": "Permiso no encontrado" }
```
✅ El handler mapea correctamente `gorm.ErrRecordNotFound` a 404 (a diferencia
de otros módulos como resources/actions/business-types).

### 2. PUT /permissions/9999
```http
PUT /api/v1/permissions/9999
Content-Type: application/json

{"name":"Inv","description":"x","resource_id":1,"action_id":1,"scope_id":2}
```
**Esperado (404):** `{ "error": "Permiso no encontrado" }`.

### 3. DELETE /permissions/9999
**Esperado (404):** `{ "error": "Permiso no encontrado" }`.

### 4. GET /permissions/abc (id inválido)
**Esperado (400):** mensaje indicando que id debe ser numérico. Validar al
ejecutar la forma exacta de la respuesta.

### 5. GET /permissions/scope/99 (scope inexistente)
**Esperado (200):** lista vacía `{ success, data: [], total: 0 }`.
✅ El endpoint no falla, simplemente devuelve vacío.

### 6. GET /permissions/resource/NoExiste
**Esperado (200):** lista vacía. El path param `:resource` es el **nombre**
del recurso (string), no su id.

## Notas
- Bugs (otras formas de respuesta): la respuesta de 404 trae solo `{ error }`
  sin `success: false`. En la respuesta exitosa hay `success: true`. Esta
  asimetría debería unificarse pero no es bloqueante.
