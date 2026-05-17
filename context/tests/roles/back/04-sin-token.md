# 04 — Roles sin/con token inválido

**Módulo:** roles   **Tipo:** back   **Estado:** ✅ OK

## Pasos

### 1. GET /roles sin Authorization
**Esperado (401):** `{"error":"Token de autorización requerido"}`.

### 2. POST /roles con token malformado
**Esperado (401):** mensaje con `token is malformed`.

### 3. DELETE /roles/1 con firma alterada
**Esperado (401):** firma inválida.

## Validaciones post
- 401 sin alterar DB.
- Ningún log de éxito.
