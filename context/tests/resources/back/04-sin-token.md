# 04 — Resources sin/con token inválido

**Módulo:** resources   **Tipo:** back   **Estado:** ✅ OK

## Pasos

### 1. GET /resources sin Authorization
**Esperado (401):** `{ "error": "Token de autorización requerido" }`.

### 2. POST /resources sin token
**Esperado (401):** mismo mensaje.

### 3. PUT /resources/1 con token malformado
```http
PUT /api/v1/resources/1
Authorization: Bearer fake.token.xxx
```
**Esperado (401):** mensaje con `token is malformed`.

### 4. DELETE /resources/1 con firma alterada
**Esperado (401):** firma inválida.

## Validaciones post
- 401 sin alterar DB.
- Ningún log de éxito en backend.
