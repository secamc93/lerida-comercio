# 05 — Verify token inválido o ausente

**Módulo:** auth   **Tipo:** back   **Estado:** ✅ OK

## Objetivo
Sin token, con header malformado, o con token corrupto → `401`.

## Pasos

### 1. Sin header `Authorization`

**Request:**
```http
GET /api/v1/auth/verify
```

**Esperado (401):**
```json
{"error":"Token de autorización requerido"}
```

### 2. Token malformado

**Request:**
```http
GET /api/v1/auth/verify
Authorization: Bearer abc.def.ghi
```

**Esperado (401):**
```json
{
  "error": "Token inválido: error al parsear token: token is malformed: could not JSON decode header: invalid character 'i' looking for beginning of value"
}
```

### 3. Token expirado

Generar un JWT firmado con el mismo secret pero `exp` en el pasado, y enviarlo.

**Esperado (401):** mensaje que incluya `token is expired` o equivalente.

### 4. Token con firma inválida

Tomar un token válido y modificar el último carácter de la firma.

**Esperado (401):** mensaje que incluya `signature is invalid` o equivalente.

## Validaciones post
- Status `401` en todos los casos.
- No se accede al recurso protegido (no aparecen logs de éxito).

## Notas
- El mensaje del caso `2` filtra detalles internos del parser. Aceptable en
  dev, considerar simplificarlo en producción (registrar en `RESULTS.md` si
  decidimos restringir).
