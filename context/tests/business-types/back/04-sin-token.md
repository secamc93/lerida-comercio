# 04 — Business-types sin/con token inválido

**Módulo:** business-types   **Tipo:** back   **Estado:** ✅ OK

## Pasos

### 1. GET /business-types sin Authorization
**Esperado (401):** `{ "error": "Token de autorización requerido" }`.

### 2. POST /business-types sin token
**Esperado (401):** mismo mensaje.

### 3. PUT /business-types/1 con token malformado
```http
PUT /api/v1/business-types/1
Authorization: Bearer fake.token.xxx
```
**Esperado (401):** mensaje con `token is malformed`.

### 4. DELETE /business-types/1 con firma alterada
**Esperado (401):** firma inválida.

## Validaciones post
- 401 sin alterar DB.
- Ningún log de éxito en backend.
