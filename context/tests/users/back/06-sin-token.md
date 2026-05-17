# 06 — Acceso sin/con token inválido

**Módulo:** users   **Tipo:** back   **Estado:** ✅ OK

## Objetivo
Todos los endpoints de `/users` requieren JWT. Sin token → `401`.

## Pasos

### 1. POST /users sin header `Authorization`
```http
POST /api/v1/users
Content-Type: application/json

{"name":"x","email":"y@z.com"}
```
**Esperado (401):**
```json
{"error":"Token de autorización requerido"}
```

### 2. GET /users con token malformado
```http
GET /api/v1/users
Authorization: Bearer abc.def.ghi
```
**Esperado (401):** mensaje con `token is malformed`.

### 3. DELETE /users/1 con token de firma alterada
**Esperado (401):** mensaje con `signature is invalid` o similar.

## Validaciones post
- Status `401` en todos los casos.
- No se ejecuta ninguna mutación en DB.
