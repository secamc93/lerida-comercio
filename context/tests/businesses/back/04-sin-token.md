# 04 — Businesses sin/con token inválido

**Módulo:** businesses   **Tipo:** back   **Estado:** ✅ OK

## Pasos

### 1. GET /businesses sin Authorization
**Esperado (401):** `{ "error": "Token de autorización requerido" }`.

### 2. POST /businesses sin token
**Esperado (401):** mismo mensaje.

### 3. PUT /businesses/1 con token malformado
```http
PUT /api/v1/businesses/1
Authorization: Bearer fake.token.xxx
Content-Type: multipart/form-data; ...
```
**Esperado (401):** mensaje con `token is malformed`.

### 4. DELETE /businesses/1 sin token
**Esperado (401):** firma inválida / token requerido.

### 5. PUT /businesses/1/activate sin token
**Esperado (401):** mismo mensaje.

### 6. GET /businesses/configured-resources sin token
**Esperado (401):** mismo mensaje.

## Validaciones post
- 401 sin alterar DB.
- Ningún log de éxito en backend.
