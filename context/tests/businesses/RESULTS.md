# RESULTS — businesses

## 2026-05-16 · primera pasada

| Caso                                | Resultado | Notas |
|-------------------------------------|-----------|-------|
| 01 — CRUD feliz                     | ⚠️ BUG    | POST/PUT funcionan; respuesta tiene campos vacíos (phone, email, website) sin uso (BUG-BUSINESSES-04); forma de `business_type` distinta entre POST y GET (BUG-BUSINESSES-05). |
| 02 — Create errores                 | ⚠️ BUG    | Sin BT / BT inválido → 400 OK; **name y code duplicados pasan sin error** (BUG-BUSINESSES-01/02). |
| 03 — Edge & not-found               | ⚠️ BUG    | GET/PUT/DELETE 9999 → 500 (BUG-BUSINESSES-03); activate/deactivate sí dan 404. |
| 04 — Sin token                      | ✅ OK     | 401 limpio. |
| 05 — Activate/deactivate            | ✅ OK     | 200/404/400 correctos. |
| 06 — Configured resources           | ✅ OK     | 200/404/400 correctos; super admin requiere `?business_id=`. |

## Bugs encontrados

### BUG-BUSINESSES-01 · Nombres de business duplicados pasan sin error

**Reproducir:** crear dos businesses con el mismo `name` y BTs distintos (o
mismo).

**Síntoma:** ambos POST devuelven 201 y se guardan en DB con IDs distintos.

**Severidad:** Media-Alta. Si el negocio espera `name` único, la app
producirá colisiones en frontend (selectores por nombre). Si **no** debe ser
único, ignorar.

**Archivo a revisar:**
- `back/migration/shared/models/business.go` — agregar tag UNIQUE si aplica.
- `back/central/services/auth/bussines/internal/app/usecasebusiness/create-business.go` —
  validar existencia previa.

### BUG-BUSINESSES-02 · Codes de business duplicados pasan sin error

**Reproducir:** crear business con `code="lerida-comercio"` (mismo que otro
ya existente).

**Síntoma:** POST devuelve 201 sin error.

**Severidad:** Alta. El handler **tiene** un caso definido
(`ErrBusinessCodeAlreadyExists` → 409), pero NO se dispara. Causas posibles:
1. La columna `business.code` no tiene constraint UNIQUE en DB → revisar
   `\d business`.
2. El repositorio no detecta la colisión antes del INSERT.
3. El mapper genera codes aleatorios y por eso casi nunca colisionan, pero
   cuando el cliente envía un code explícito sí se cuela.

**Fix:**
1. Agregar UNIQUE constraint a `business.code` (en `models/business.go`).
2. Capturar `SQLSTATE 23505` en repo → `ErrBusinessCodeAlreadyExists`.

### BUG-BUSINESSES-03 · GET/PUT/DELETE /businesses/:id devuelve 500 si id no existe

**Síntoma:**
```json
{
  "success": false,
  "error": "internal_error",
  "message": "Error interno del servidor"
}
HTTP 500
```

**Severidad:** Alta. Mismo patrón que en otros módulos. Contrasta con los
endpoints `activate/deactivate` y `configured-resources` del mismo módulo,
que sí dan 404 correctamente.

**Archivos a revisar:**
- `back/central/services/auth/bussines/internal/infra/primary/controllers/businesshandler/get-business-by-id.go`
- `update-business.go`
- `delete-business.go`

**Fix:** capturar `errors.Is(err, gorm.ErrRecordNotFound)` o el equivalente
de dominio en cada handler y devolver 404 antes del fallback 500.

### BUG-BUSINESSES-04 (menor) · Respuesta de POST incluye campos sin uso (`phone`, `email`, `website`)

**Síntoma:** la respuesta de `POST /businesses` siempre incluye:
```json
"phone": "", "email": "", "website": ""
```
Pero el `BusinessRequest` (y la tabla `business`) **no** los acepta como
input. Vienen del response builder/mapper que tiene campos legacy.

**Severidad:** Baja. Espacio desperdiciado en payload; cliente puede
confundirse.

**Archivo a revisar:**
`back/central/services/auth/bussines/internal/infra/primary/controllers/businesshandler/response/business-response.go`
y el mapper. Eliminar campos no usados o agregar soporte en el modelo si la
intención era exponerlos.

### BUG-BUSINESSES-05 (menor) · Inconsistencia: `business_type` en POST vs GET

**Síntoma:**
- En la respuesta de `POST /businesses`, el `business_type` viene como
  string: `"business_type": "Lerida Comercio"`.
- En la respuesta de `GET /businesses/:id`, viene como objeto anidado:
  ```json
  "business_type": { "id": <BT>, "name": "...", "code": "...", ... }
  ```

**Severidad:** Baja. El frontend debe manejar ambas formas o tener tipos
distintos. Decidir un solo formato y migrar.

**Fix:** alinear el mapper de POST y PUT con el de GET (mostrar objeto
anidado siempre) o viceversa.

## Patrón general

- POST y validaciones específicas (campo requerido, BT inválido) funcionan
  con `error` como slug + `message` legible.
- Validaciones de unicidad (`name`, `code`) están ausentes (BUG-BUSINESSES-01/02).
- 404 cubre activate/deactivate/configured-resources, pero **NO** los CRUD
  básicos (BUG-BUSINESSES-03).
- El uso de multipart/form-data complica los tests; con `curl -F` funciona.
  Asegurarse de NO enviar `Content-Type: application/json`.

## IDs huérfanos / contaminación post-test

- Tres businesses creados (`Comercio Test Edit`, `Comercio Test`, `Otro`)
  con ids 1, 2 y 3 fueron soft-deleted vía `DELETE /businesses/:id`. Quedan
  en DB con `deleted_at` poblado.
- La tabla `business_resource_configured` puede tener filas asociadas con
  `deleted_at` también pobladas o huérfanas. Validar con
  `SELECT * FROM business_resource_configured;`.

Si se quiere reiniciar limpio, ejecutar `make seed` (recrea solo lo que el
seeder cubre — businesses no aparecen en seed, así que quedan como historico).
