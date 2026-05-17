# 06 — Roles y permisos del usuario autenticado

**Módulo:** auth   **Tipo:** back   **Estado:** ✅ OK

## Objetivo
`GET /auth/roles-permissions` devuelve el rol activo, business activo,
business_type, scope y recursos disponibles para el usuario del token.

## Pasos

### 1. Como super admin

**Request:**
```http
GET /api/v1/auth/roles-permissions
Authorization: Bearer <TOKEN>
```

**Esperado (200):**
```json
{
  "success": true,
  "data": {
    "is_super": true,
    "business_id": 0,
    "business_name": "",
    "business_type_id": 0,
    "business_type_name": "",
    "role": {
      "id": 1,
      "name": "Super Admin",
      "description": "Super administrador con acceso total"
    },
    "resources": null,
    "subscription_status": "active"
  }
}
```

### 2. Como usuario business (cuando exista)

Crear un usuario en un business, hacer login con ese usuario, y validar:
- `is_super == false`
- `business_id != 0`
- `business_name` poblado
- `resources` no nulo, con la lista de recursos activos de ese business

## Validaciones post
- `is_super == true` solo si algún rol tiene `scope_code == "platform"`.
- Super admin con `business_id == 0` → `resources` puede ser `null` (no
  está scoped a un business todavía).
