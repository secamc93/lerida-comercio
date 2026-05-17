# 04 — Permissions sin/con token inválido

**Módulo:** permissions   **Tipo:** back   **Estado:** ✅ OK

## Pasos

### 1. GET /permissions sin Authorization
**Esperado (401):** `{ "error": "Token de autorización requerido" }`.

### 2. POST /permissions sin token
**Esperado (401):** mismo mensaje.

### 3. POST /permissions/bulk sin token
**Esperado (401):**.

### 4. DELETE /permissions/1 con token malformado
```http
DELETE /api/v1/permissions/1
Authorization: Bearer fake.token.xxx
```
**Esperado (401):** mensaje con `token is malformed` o similar.

### 5. GET /permissions con firma alterada
**Esperado (401):** firma inválida.

## Validaciones post
- 401 sin alterar DB.
- Ningún log de éxito en el backend.
