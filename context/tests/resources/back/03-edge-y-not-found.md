# 03 — GET/PUT/DELETE resources edge cases

**Módulo:** resources   **Tipo:** back   **Estado:** ⚠️ BUG

## Objetivo
Validar 404 limpio en `GET/PUT/DELETE /resources/<id-inexistente>` y la
forma de error ante id malformado.

## Pasos

### 1. GET /resources/9999 (inexistente)
**Observado (500):**
```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error": "error al obtener recurso: record not found"
}
```

⚠️ **BUG-RESOURCES-01:** `gorm.ErrRecordNotFound` se propaga al handler sin
mapear → 500. Debería ser 404 con mensaje `"Recurso no encontrado"`. Mismo
patrón que `BUG-ROLES-03`, pero aquí no se mitiga.

### 2. PUT /resources/9999
```http
PUT /api/v1/resources/9999
Content-Type: application/json

{"name":"X","description":"x"}
```
**Observado (404):**
```json
{
  "success": false,
  "message": "Recurso no encontrado",
  "error": "recurso con ID 9999 no encontrado"
}
```
✅ El PUT sí maneja el caso (porque hace un GetByID interno antes y captura el
not-found con su propio error de dominio).

### 3. DELETE /resources/9999
**Observado (404):** mismo formato que PUT. ✅

### 4. GET /resources/abc (id no numérico)
**Observado (400):**
```json
{
  "success": false,
  "message": "ID de recurso inválido",
  "error": "El ID del recurso debe ser un número válido"
}
```
✅ Validación de tipo correcta.

### 5. PUT /resources/abc
**Esperado (400):** misma forma de error que arriba. Validar al ejecutar.

## Resumen
| Endpoint                 | 9999 (no existe) | abc (malformado) |
|--------------------------|------------------|-------------------|
| GET    /resources/:id    | ❌ 500            | ✅ 400             |
| PUT    /resources/:id    | ✅ 404            | ✅ 400 (asumido)   |
| DELETE /resources/:id    | ✅ 404            | ✅ 400 (asumido)   |

## Notas
- El bug está localizado solo en GET; la corrección debe agregarse en
  `back/central/services/auth/resources/internal/app/get-resource-by-id.go`
  o en el handler — capturar `errors.Is(err, gorm.ErrRecordNotFound)` y
  retornar 404.
