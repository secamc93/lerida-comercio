# 02 — Login con credenciales inválidas

**Módulo:** auth   **Tipo:** back   **Estado:** ✅ OK

## Objetivo
Tanto password incorrecto como email inexistente devuelven `401` con mensaje
genérico (no revela cuál de los dos falló).

## Pasos

### 1. Password incorrecto

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json
X-Client-Type: api

{"email":"admin@lerida.local","password":"WRONG"}
```

**Esperado (401):**
```json
{"error":"credenciales inválidas"}
```

### 2. Email inexistente

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json
X-Client-Type: api

{"email":"noexiste@x.com","password":"x"}
```

**Esperado (401):**
```json
{"error":"credenciales inválidas"}
```

## Validaciones post
- Ambos casos devuelven el **mismo mensaje genérico** — no debe filtrar
  si el email existe (mitigación de user enumeration).
- Status `401` exactamente, no `403` ni `400`.
- No se actualiza `last_login_at` en DB.
