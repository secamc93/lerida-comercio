# 03 — GET/PUT/DELETE business-types edge cases

**Módulo:** business-types   **Tipo:** back   **Estado:** ⚠️ BUG

## Pasos

### 1. GET /business-types/9999 (inexistente)
**Observado (500):**
```json
{
  "success": false,
  "error": "internal_error",
  "message": "Error interno del servidor"
}
```

⚠️ **BUG-BT-01:** El handler no distingue `record not found` de errores
reales. Debería ser 404 con mensaje `"Tipo de negocio no encontrado"`.

### 2. PUT /business-types/9999
```http
PUT /api/v1/business-types/9999
Content-Type: application/json

{"name":"X","description":"x"}
```
**Observado (500):**
```json
{
  "success": false,
  "error": "internal_error",
  "message": "Error interno del servidor"
}
```

⚠️ **BUG-BT-02:** Mismo problema en PUT. Sin mensaje útil al cliente.

### 3. DELETE /business-types/9999
**Observado (500):**
```json
{
  "success": false,
  "error": "internal_error",
  "message": "Error interno del servidor"
}
```

⚠️ **BUG-BT-03:** Mismo problema en DELETE.

### 4. GET /business-types/abc (id no numérico)
**Esperado (400):** mensaje indicando que id debe ser numérico. Validar al
ejecutar la forma exacta.

### 5. DELETE de un BT referenciado por businesses o permissions
```http
DELETE /api/v1/business-types/1
```
Asume que `business_type_id=1` está referenciado por:
- `business` (al menos un row con `business_type_id=1`) — FK sin ON DELETE.
- `permission` (decenas) — FK con `ON DELETE SET NULL`.

**Observado (durante esta pasada):**
```json
{ "success": true, "message": "Tipo de negocio eliminado exitosamente" }
HTTP 200
```

⚠️ **BUG-BT-05 (CRÍTICO):** El delete pasa sin error pero:
- Las permissions referenciadas quedan con `business_type_id = NULL` (cascade
  SET NULL).
- Si hay businesses referenciados, en realidad el FK debería bloquear, pero
  no se observó error.
- En DB la fila del BT **desaparece** (no parece soft delete pese a tener
  `deleted_at`).

**Recomendación:** validar integridad referencial **antes** de eliminar, y
devolver `409 Conflict` con detalle de cuántos businesses/permissions están
usando el BT.

### 6. PUT con `is_active=false`
Como se observó en `01-crud-feliz.md`, el `is_active` enviado en false vuelve
a `true` después del update. `BUG-BT-06`.

## Notas
- Los 3 verbos GET/PUT/DELETE devuelven el mismo 500 genérico cuando el id no
  existe. Un solo fix en el mapper de error del handler resolvería los 3.
