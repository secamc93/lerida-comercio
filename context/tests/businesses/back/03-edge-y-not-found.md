# 03 — GET/PUT/DELETE businesses edge cases

**Módulo:** businesses   **Tipo:** back   **Estado:** ⚠️ BUG

## Pasos

### 1. GET /businesses/9999 (inexistente)
**Observado (500):**
```json
{
  "success": false,
  "error": "internal_error",
  "message": "Error interno del servidor"
}
```

⚠️ **BUG-BUSINESSES-03:** Mismo patrón que BUG-BT-01. El handler no
distingue `record not found` → 500 sin mensaje útil. Esperado: 404 con
mensaje `"Negocio no encontrado"`.

### 2. PUT /businesses/9999
```bash
curl -X PUT http://localhost:3050/api/v1/businesses/9999 \
  -H "Authorization: Bearer $TOKEN" -F "name=X"
```
**Observado (500):** mismo formato.

### 3. DELETE /businesses/9999
**Observado (500):**
```json
{
  "success": false,
  "error": "internal_error",
  "message": "Error interno del servidor"
}
```
Mismo problema.

### 4. PUT /businesses/9999/activate
**Observado (404):**
```json
{ "message": "business no encontrado", "success": false }
```
✅ Aquí sí responde 404 correctamente. La forma del payload es distinta
(`message` con minúsculas, sin `error`).

### 5. PUT /businesses/9999/deactivate
**Esperado (404):** mismo formato que arriba. Validar al ejecutar.

### 6. GET /businesses/abc (id no numérico)
**Esperado (400):** mensaje sobre id inválido. Validar al ejecutar la forma
exacta.

### 7. GET /businesses/9999/configured-resources
**Observado (404):**
```json
{
  "success": false,
  "error": "business no encontrado",
  "message": "Business no encontrado"
}
```
✅ Mensaje útil con 404.

## Resumen
| Endpoint                                  | 9999 → status |
|-------------------------------------------|---------------|
| GET    /businesses/:id                    | ❌ 500         |
| PUT    /businesses/:id                    | ❌ 500         |
| DELETE /businesses/:id                    | ❌ 500         |
| PUT    /businesses/:id/activate           | ✅ 404         |
| PUT    /businesses/:id/deactivate         | ✅ 404 (asumido) |
| GET    /businesses/:id/configured-resources | ✅ 404         |

Los handlers de **activate/deactivate/configured-resources** sí mapean
correctamente, pero los CRUD básicos no.

## Notas
- El fix es localizado: el handler de Get/Put/Delete debería capturar el
  error de dominio o `gorm.ErrRecordNotFound` antes de hacer fallback al 500.
