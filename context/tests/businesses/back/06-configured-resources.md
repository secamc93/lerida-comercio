# 06 — Configured Resources de business

**Módulo:** businesses   **Tipo:** back   **Estado:** ✅ OK

## Objetivo
Validar los endpoints que listan/togglean qué `resources` están activos para
cada `business` (relación `business_resource_configured`).

## Precondiciones
- Token de super admin.
- Existe un business con id conocido (referido como `<BID>` abajo).
- Existen los 7 resources del seed.

## Endpoints
- `GET /businesses/configured-resources` — lista para **todos** los businesses.
- `GET /businesses/:id/configured-resources` — uno solo.
- `PUT /businesses/configured-resources/:resource_id/activate?business_id=<BID>`
- `PUT /businesses/configured-resources/:resource_id/deactivate?business_id=<BID>`

## Pasos

### 1. GET /businesses/configured-resources
**Esperado (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": <BID>, "name": "...", "code": "...",
      "resources": [
        {"resource_id": 1, "resource_name": "Usuarios", "is_active": true},
        {"resource_id": 2, "resource_name": "Permisos", "is_active": true},
        ...
      ],
      "created_at": "...", "updated_at": "..."
    }
  ]
}
```

⚠️ Note: el campo en DB se llama `active` (no `is_active`). En la respuesta
de la API se expone como `is_active` (mapper renombra). Documentado para que
no confunda al hacer `SELECT * FROM business_resource_configured`.

### 2. GET /businesses/<BID>/configured-resources
**Esperado (200):**
```json
{
  "success": true,
  "message": "Configuración de recursos del business obtenida exitosamente",
  "data": {
    "id": <BID>, "name": "...", "code": "...",
    "resources": [ /* 7 items */ ],
    "created_at": "...", "updated_at": "..."
  }
}
```

### 3. PUT desactivar recurso 1 para el business
```http
PUT /api/v1/businesses/configured-resources/1/deactivate?business_id=<BID>
Authorization: Bearer <TOKEN>
```
**Esperado (200):**
```json
{ "message": "Recurso desactivado exitosamente", "success": true }
```

Verificar:
```bash
curl -s "http://localhost:3050/api/v1/businesses/<BID>/configured-resources" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json; rs = json.load(sys.stdin)['data']['resources']; print([r for r in rs if r['resource_id']==1])"
# → [{'resource_id':1, 'resource_name':'Usuarios', 'is_active': False}]
```

### 4. PUT activar recurso 1
**Esperado (200):**
```json
{ "message": "Recurso activado exitosamente", "success": true }
```
Vuelve a `is_active: true`.

### 5. Super admin sin `business_id` en query
```http
PUT /api/v1/businesses/configured-resources/1/activate
```
**Esperado (400):**
```json
{
  "success": false,
  "message": "Parámetro requerido",
  "error": "El business_id es requerido en el query param"
}
```
✅ Validación correcta: super admin debe especificar business_id (regla de
`.claude/rules/backend-conventions.md`).

### 6. Resource inexistente
```http
PUT /api/v1/businesses/configured-resources/99/activate?business_id=<BID>
```
**Observado (404):**
```json
{
  "success": false,
  "message": "recurso no encontrado",
  "error": "recurso no encontrado"
}
```
✅

### 7. Business inexistente
```http
PUT /api/v1/businesses/configured-resources/1/activate?business_id=9999
```
**Esperado (404):** `"business no encontrado"`. Validar al ejecutar.

### 8. business_id no numérico
```http
PUT /api/v1/businesses/configured-resources/1/activate?business_id=abc
```
**Esperado (400):** `"El business_id debe ser un número válido"`. Validar.

## Notas
- Endpoint bien implementado en general; los códigos 400/404/200 son
  consistentes y los mensajes descriptivos.
- Para super admin **siempre** enviar `?business_id=`. Para users con
  business asignado, el middleware fuerza su business_id (ignora el query).
