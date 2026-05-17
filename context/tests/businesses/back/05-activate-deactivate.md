# 05 — Activate / Deactivate business

**Módulo:** businesses   **Tipo:** back   **Estado:** ✅ OK

## Objetivo
Validar los endpoints `PUT /businesses/:id/activate` y `/deactivate` que
flipean el campo `is_active` sin necesidad de pasar por PUT genérico.

## Precondiciones
- Token de super admin.
- Existe un business con id conocido.

## Pasos

### 1. PUT /businesses/<N>/deactivate
```http
PUT /api/v1/businesses/<N>/deactivate
Authorization: Bearer <TOKEN>
```
**Esperado (200):**
```json
{ "message": "Business desactivado exitosamente", "success": true }
```

Verificar:
```bash
curl -s "http://localhost:3050/api/v1/businesses/<N>" -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['is_active'])"
# → False
```

### 2. PUT /businesses/<N>/activate
**Esperado (200):**
```json
{ "message": "Business activado exitosamente", "success": true }
```

Verificar: `is_active` vuelve a `true`.

### 3. PUT /businesses/9999/activate (inexistente)
**Observado (404):**
```json
{ "message": "business no encontrado", "success": false }
```
✅ Mensaje correcto, 404 correcto. Forma plana sin `error`.

### 4. PUT /businesses/9999/deactivate
**Esperado (404):** mismo formato.

### 5. PUT /businesses/abc/activate (id no numérico)
**Esperado (400):**
```json
{
  "success": false,
  "message": "Parámetros inválidos",
  "error": "El id debe ser un número válido"
}
```

## Notas
- Forma de respuesta inconsistente con CRUD básico: aquí `success` y
  `message` aparecen en distinto orden y sin `data`. Ver `BUG-BUSINESSES-06`
  si quieres consolidar.
- Útil cuando se quiere alternar estado sin enviar el resto del payload
  multipart.
