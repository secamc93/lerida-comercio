# 05 — Asignar rol a usuario en business(es)

**Módulo:** users   **Tipo:** back   **Estado:** ⏳ Pendiente verificación

## Objetivo
Asignar uno o varios pares `(business_id, role_id)` a un usuario.

## Precondiciones
- Usuario `<N>` creado (caso `01`).
- Roles existentes (`Super Admin`=1, `Operador`=2, `Administrador`=3, etc.).
- Business activo (id ≥ 1) si se asigna scope business.

## Pasos

### 1. Body vacío
```http
POST /api/v1/users/<N>/assign-role
Authorization: Bearer <TOKEN>
Content-Type: application/json

{}
```
**Esperado (400):**
```json
{"error":"Datos de entrada inválidos: Key: 'AssignRoleToUserBusinessRequest.Assignments' Error:Field validation for 'Assignments' failed on the 'required' tag"}
```

### 2. Asignación válida (rol business)
```json
{
  "assignments": [
    {"business_id": 1, "role_id": 3}
  ]
}
```
**Esperado (200):** `success: true`.

### 3. Asignación múltiple
```json
{
  "assignments": [
    {"business_id": 1, "role_id": 3},
    {"business_id": 2, "role_id": 3}
  ]
}
```
**Esperado (200):** las 2 asignaciones quedan en DB (`user_roles`,
`user_businesses`).

### 4. Asignación global (super admin) — business_id = 0
```json
{ "assignments": [{"business_id": 0, "role_id": 1}] }
```
**Esperado:** validar comportamiento. El validator marca `business_id`
como `omitempty,min=1` → enviar `0` lo trata como omitido → solo aplica
`role_id`. Confirmar si el handler luego inserta con business_id NULL
para super admin (ver `BusinessStaff` en seed).

### 5. role_id inválido
```json
{ "assignments": [{"business_id": 1, "role_id": 99999}] }
```
**Esperado:** error 400 o 404 indicando rol no encontrado.

### 6. Usuario inexistente
```http
POST /api/v1/users/9999/assign-role
```
**Esperado:** error `404 Usuario no encontrado` (o `400` si valida ID antes).

## Validaciones post
- DB: filas en `user_roles` (`user_id`, `role_id`) y `user_businesses`
  (`user_id`, `business_id`) creadas/actualizadas.
- Al volver a hacer login con ese usuario (caso pendiente), el token debería
  incluir `business_id` y `role_id` resueltos.
