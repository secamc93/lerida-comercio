# RESULTS — resources

## 2026-05-16 · primera pasada

| Caso                                | Resultado | Notas |
|-------------------------------------|-----------|-------|
| 01 — CRUD feliz                     | ✅ OK     | POST/GET/PUT/DELETE devuelven `data` con el objeto. |
| 02 — Create errores                 | ⚠️ BUG    | Nombre duplicado → 409 OK; FK inválida → 500 SQL raw (BUG-RESOURCES-02). |
| 03 — Edge & not-found               | ⚠️ BUG    | GET /resources/9999 → 500 (BUG-RESOURCES-01); PUT/DELETE sí dan 404. |
| 04 — Sin token                      | ✅ OK     | 401 limpio. |

## Bugs encontrados

### BUG-RESOURCES-01 · `GET /resources/:id` devuelve 500 cuando el id no existe

**Reproducir:** `GET /resources/9999`.

**Síntoma:**
```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error": "error al obtener recurso: record not found"
}
HTTP 500
```

**Severidad:** Alta. Forma de error inconsistente con PUT/DELETE del mismo
recurso, que sí devuelven 404 con mensaje claro.

**Archivo a revisar:**
- `back/central/services/auth/resources/internal/app/get-resource-by-id.go` o
- `back/central/services/auth/resources/internal/infra/primary/handlers/get-resource-by-id.go`

**Fix:**
1. Capturar `gorm.ErrRecordNotFound` en el repo y mapear a `domain.ErrResourceNotFound`.
2. En handler: `errors.Is(err, domain.ErrResourceNotFound)` → 404 con mensaje
   `"Recurso no encontrado"`.

### BUG-RESOURCES-02 · FK violation en POST/PUT expone SQL raw como 500

**Reproducir:**
```http
POST /resources
{"name":"WithBT","description":"x","business_type_id":999}
```

**Síntoma:**
```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error": "error al crear recurso: ERROR: insert or update on table \"resource\" violates foreign key constraint \"fk_business_type_resources\" (SQLSTATE 23503)"
}
HTTP 500
```

**Severidad:** Alta. Filtra detalles internos al cliente; debería ser 400
input inválido.

**Fix:**
1. En `internal/infra/secondary/repository/resource.go`, capturar:
   ```go
   var pgErr *pgconn.PgError
   if errors.As(err, &pgErr) && pgErr.Code == "23503" {
       return domain.ErrResourceInvalidBusinessType
   }
   ```
2. Definir error en `internal/domain/errors.go`.
3. Handler: mapear a 400 con mensaje `"El business_type_id no existe"`.

### BUG-RESOURCES-03 (menor) · `business_type_id` viene `0` cuando es NULL en DB

**Síntoma:** todos los resources del seed tienen `business_type_id = NULL`
pero la respuesta JSON los expone como `"business_type_id": 0`. Cliente no
puede distinguir "genérico" de "id 0".

**Severidad:** Baja. El frontend puede asumir `0 = genérico` por convención,
pero rompe el contrato.

**Fix:** en `PermissionResponse`/`ResourceResponse`, declarar el campo como
`*uint` o `omitempty`. Alternativamente, mantener `uint` y documentar la
convención.

### BUG-RESOURCES-04 (menor) · Paginación anidada en `data.resources`

**Síntoma:** La respuesta de `GET /resources` empaqueta los items y la
paginación dentro de `data`:
```json
{
  "data": {
    "resources": [...],
    "total": 7, "page": 1, "page_size": 10, "total_pages": 1
  }
}
```

Comparar con `users` que devuelve `data` plano + objeto `pagination` separado.

**Severidad:** Baja. Inconsistencia de contrato entre módulos. Decidir un
formato común y alinear.

## Patrón general

- Respuestas tienen forma consistente `{ success, message, [data|error] }`.
- 400/409 funcionan correctamente para validación e input inválido.
- 500 se usa para errores no esperados pero también para `record not found`
  en GET — anti-patrón.

## IDs huérfanos / contaminación post-test

Ninguno tras esta pasada.
