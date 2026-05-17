# 04 — Actions sin/con token inválido

**Módulo:** actions   **Tipo:** back   **Estado:** ✅ OK

## Pasos

### 1. GET /actions sin Authorization
**Esperado (401):** `{ "error": "Token de autorización requerido" }`.

### 2. POST /actions sin token
**Esperado (401):** mismo mensaje.

### 3. PUT /actions/1 con token malformado
```http
PUT /api/v1/actions/1
Authorization: Bearer fake.token.xxx
```
**Esperado (401):** mensaje con `token is malformed`.

### 4. DELETE /actions/1 con firma alterada
**Esperado (401):** firma inválida.

## Validaciones post
- 401 sin alterar DB.
- Ningún log de éxito en backend.
