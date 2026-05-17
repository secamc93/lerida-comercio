# 02 — POST /roles errores

**Módulo:** roles   **Tipo:** back   **Estado:** ⚠️ BUG

## Pasos

### 1. Body vacío
**Esperado (400):**
```json
{
  "error": "Key: 'CreateRoleRequest.Name' Error:Field validation for 'Name' failed on the 'required' tag\nKey: 'CreateRoleRequest.Description' Error:Field validation for 'Description' failed on the 'required' tag\nKey: 'CreateRoleRequest.Level' Error:Field validation for 'Level' failed on the 'required' tag\nKey: 'CreateRoleRequest.ScopeID' Error:Field validation for 'ScopeID' failed on the 'required' tag\nKey: 'CreateRoleRequest.BusinessTypeID' Error:Field validation for 'BusinessTypeID' failed on the 'required' tag",
  "message": "Datos de entrada inválidos",
  "success": false
}
```

### 2. Nombre duplicado (existing role name)
```json
{"name":"Super Admin","description":"x","level":3,"scope_id":2,"business_type_id":1}
```

**Observado actualmente (500):**
```json
{
  "error": "ERROR: duplicate key value violates unique constraint \"uni_role_name\" (SQLSTATE 23505)",
  "message": "Error al crear el rol",
  "success": false
}
```

**Esperado (recomendado, 409):**
```json
{"success": false, "error": "El rol ya existe", "message": "..."}
```

⚠️ **BUG-ROLES-02:** El error de DB **(SQLSTATE 23505)** se filtra al
cliente. Debería mapearse a `ErrRoleNameAlreadyExists` en domain y
devolver `409 Conflict`. Ver RESULTS.

### 3. scope_id inválido / inexistente
```json
{"name":"X","description":"x","level":3,"scope_id":99,"business_type_id":1}
```
**Esperado:** error claro de FK (deber mapearse a 400/404).

### 4. business_type_id no existente
Similar al anterior.

## Notas
- Al fix: catch en repo de error `*pgconn.PgError` con code `23505` → mapear
  a error de dominio + 409 en el handler.
