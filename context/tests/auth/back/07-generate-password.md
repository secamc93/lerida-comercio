# 07 — Generate password

**Módulo:** auth   **Tipo:** back   **Estado:** ⚠️ BUG (revisión de seguridad)

## Objetivo
Generar una nueva contraseña aleatoria para el usuario indicado.

## Pasos

### 1. POST /api/v1/auth/generate-password (autenticado)

**Request:**
```http
POST /api/v1/auth/generate-password
Authorization: Bearer <TOKEN>
Content-Type: application/json

{"length": 12}
```

**Observado (200):**
```json
{
  "success": true,
  "email": "admin@lerida.local",
  "password": "0.Y-32_o22yy",
  "message": "Nueva contraseña generada para el usuario admin@lerida.local"
}
```

## Validaciones post
- Status `200`.
- `password` es una cadena de la longitud solicitada.
- DB: el hash `password` del registro en `"user"` cambió.
- Tras la rotación, el caso `01` (login admin/admin123) **deja de funcionar**;
  hay que loguear con la password recién generada.

## Variante: super admin regenera password de otro usuario

```http
POST /api/v1/auth/generate-password
Authorization: Bearer <TOKEN super admin>
Content-Type: application/json

{"user_id": 2}
```
**Esperado (200):** misma estructura, pero `email`/`password` corresponden al user 2.

Como **no super admin** con `user_id` distinto al propio:
**Esperado (403):**
```json
{"error":"No tienes permisos para generar contraseña de otro usuario"}
```

## Notas
- ⚠️ **Destructivo:** rota la password del admin → ejecutar contra un usuario
  test (caso `01` de users), o usar el caso de "regenerar propia password"
  pero asegurarte de actualizar `auth/shared/test_data.md` con la nueva.
- ⚠️ Retornar el password en texto plano dentro de la response queda en logs
  si alguien captura el body: confirmar que el logger zerolog **no** está
  logueando el body de respuesta (verificar `back/central/shared/log/*`).
- El handler distingue super admin vía middleware (`middleware.IsSuperAdmin`).
