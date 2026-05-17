# 02 — POST /users con datos inválidos

**Módulo:** users   **Tipo:** back   **Estado:** ✅ OK

## Pasos

### 1. Body vacío
```http
POST /api/v1/users
Authorization: Bearer <TOKEN>
Content-Type: application/json

{}
```
**Esperado (400):**
```json
{"error":"El nombre es inválido"}
```

### 2. Email mal formado
```json
{"name":"Test","email":"no-es-email","phone":"3001112233"}
```
**Esperado (400):** error de validación de email.

### 3. Nombre muy corto
```json
{"name":"x","email":"a@b.com"}
```
**Esperado (400):** mensaje sobre longitud mínima del nombre (min=2).

### 4. Phone con longitud ≠ 10
```json
{"name":"Test","email":"a@b.com","phone":"123"}
```
**Esperado (400):** mensaje sobre longitud del phone (debe ser len exacto 10).

### 5. avatar_url no URL
```json
{"name":"Test","email":"a@b.com","avatar_url":"not-a-url"}
```
**Esperado (400):** mensaje sobre URL inválida.

## Validaciones post
- Status `400` exactamente.
- No se crea registro en DB (`SELECT COUNT(*) FROM "user"` debe no incrementar).
