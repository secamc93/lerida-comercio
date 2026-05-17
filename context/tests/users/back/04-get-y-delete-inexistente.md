# 04 — GET/PUT/DELETE con IDs inválidos o inexistentes

**Módulo:** users   **Tipo:** back   **Estado:** ✅ OK

## Pasos

### 1. GET /users/0 (id inválido por validación)
```http
GET /api/v1/users/0
Authorization: Bearer <TOKEN>
```
**Esperado (400):**
```json
{"error":"ID inválido: Key: 'GetUserByIDRequest.ID' Error:Field validation for 'ID' failed on the 'required' tag"}
```

### 2. GET /users/9999 (id válido pero inexistente)
**Esperado (404):**
```json
{"error":"Usuario no encontrado"}
```

### 3. DELETE /users/0
**Esperado (400):** mismo error de validación.

### 4. DELETE /users/9999
**Esperado (404):** `Usuario no encontrado`.

### 5. PUT /users/9999 con body válido
```http
PUT /api/v1/users/9999
Authorization: Bearer <TOKEN>
Content-Type: application/json

{"name":"x"}
```
**Observado actualmente (400):** `Datos de entrada inválidos`.

⚠️ **BUG-USERS-02:** El PUT con id inexistente debería devolver `404`, no
`400`. El validador del request rechaza algo antes (probablemente el handler
intenta validar el body y al usar un struct con todos opcionales, name="x"
falla `min=2`). Confirmar: probar `{"name":"válido"}` y validar que entonces
sí devuelva 404.

### 6. PUT /users/9999 con body válido (name ≥ 2)
```http
PUT /api/v1/users/9999
Authorization: Bearer <TOKEN>
Content-Type: application/json

{"name":"Editado"}
```
**Esperado (404):** `Usuario no encontrado`.

## Notas
- Documentar en `RESULTS.md` el resultado del caso 6 al ejecutarlo.
