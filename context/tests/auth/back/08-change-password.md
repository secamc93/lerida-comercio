# 08 — Change password

**Módulo:** auth   **Tipo:** back   **Estado:** ⏳ Pendiente ejecución

## Objetivo
Cambiar la contraseña del usuario autenticado entregando la actual y la nueva.

## Pasos

### 1. Cambio exitoso

**Request:**
```http
POST /api/v1/auth/change-password
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "current_password": "admin123",
  "new_password": "NuevaP4ssw0rd!"
}
```

**Esperado (200):**
```json
{"success": true, "message": "Contraseña actualizada correctamente"}
```

### 2. Current password incorrecto

```json
{"current_password": "WRONG", "new_password": "OtraP4ss!"}
```

**Esperado (401 o 400):** error indicando contraseña actual inválida.

### 3. Nueva password vacía / muy corta

```json
{"current_password": "admin123", "new_password": ""}
```

**Esperado (400):** error de validación.

### 4. Sin token

**Esperado (401):** `Token de autorización requerido`.

## Validaciones post
- DB: hash de password actualizado.
- Re-login con la nueva password debe funcionar (caso `01`).
- Re-login con la password vieja debe fallar (caso `02`).
- Si el campo `last_login_at` era nil (primer login), `require_password_change`
  debería pasar a `false` tras el cambio.

## Notas
- Validar contrato exacto (campos `current_password` vs `currentPassword`)
  leyendo `back/central/services/auth/login/internal/infra/primary/handlers/request/change-password-request.go`
  antes de ejecutar.
- Tras rotar password en este caso, **restaurar a admin123** para que el
  resto de tests siga corriendo (o actualizar `shared/test_data.md`).
