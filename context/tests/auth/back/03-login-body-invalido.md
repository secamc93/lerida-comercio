# 03 — Login con body inválido

**Módulo:** auth   **Tipo:** back   **Estado:** ✅ OK

## Objetivo
Bodies malformados o sin campos requeridos devuelven `400` con detalle de
validación (campo faltante / JSON inválido).

## Pasos

### 1. Body vacío `{}`

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json
X-Client-Type: api

{}
```

**Esperado (400):**
```json
{
  "error": "Datos de entrada inválidos",
  "details": "Key: 'LoginRequest.Email' Error:Field validation for 'Email' failed on the 'required' tag\nKey: 'LoginRequest.Password' Error:Field validation for 'Password' failed on the 'required' tag"
}
```

### 2. Body no JSON

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json
X-Client-Type: api

no json
```

**Esperado (400):**
```json
{
  "error": "Datos de entrada inválidos",
  "details": "invalid character 'o' in literal null (expecting 'u')"
}
```

### 3. Solo email, falta password

**Request:**
```json
{"email":"admin@lerida.local"}
```

**Esperado (400):**
- `details` debe mencionar `Field validation for 'Password' failed on the 'required' tag`.

## Validaciones post
- Status `400`.
- Mensaje genérico `Datos de entrada inválidos` + `details` con el error de validación.
- No se procesa autenticación (no hay hit a `GetUserByEmail`).
