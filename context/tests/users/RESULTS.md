# RESULTS — users

## 2026-05-16 · primera pasada

| Caso                                | Resultado | Notas |
|-------------------------------------|-----------|-------|
| 01 — CRUD feliz                     | ⚠️ BUG    | Creación 201 OK, pero el user creado no aparece en GET /users → ver BUG-USERS-01. |
| 02 — Create validaciones            | ✅ OK     | Body vacío → 400 con `"El nombre es inválido"`. |
| 03 — Email duplicado                | ✅ OK     | 409 `el email ya está registrado`. |
| 04 — GET/PUT/DELETE inexistente     | ⚠️ BUG    | PUT /users/9999 devuelve 400 en vez de 404 → BUG-USERS-02. |
| 05 — Assign role                    | ⏳        | Pendiente ejecutar feliz + edge. |
| 06 — Sin token                      | ✅ OK     | 401 en todos. |
| 07 — Listado y filtros              | ⏳        | Pendiente cubrir todos los filtros. |

## Bugs encontrados

### BUG-USERS-01 · GET /users no lista users sin business para super admin

**Síntoma:** se crea `test1@lerida.local` (id=2) vía POST /users sin
`business_ids`. Aparece en DB pero NO en `GET /users?page=1&page_size=20`,
que solo devuelve el super admin (id=1).

**Hipótesis:** el repositorio aplica un JOIN obligatorio con
`user_businesses` o filtra por `business_id` del JWT (que es 0 para super
admin). Sin business asociado, el user "no existe" para el listado.

**Archivo a revisar:**
`back/central/services/auth/users/internal/infra/secondary/repository/*.go` —
buscar la query que arma el listado y el filtro por business.

**Severidad:** Media-Alta. El super admin debería poder ver TODOS los usuarios
de la plataforma, incluyendo huérfanos. Si el listado solo muestra los de
su business activo, los huérfanos quedan invisibles.

**Fix propuesto:**
- Si `business_id` no se envía en query y el JWT es super admin (scope
  platform) → no filtrar por business, devolver todo.
- Si se envía `business_id` → filtrar por ese.

### BUG-USERS-02 · PUT /users/9999 con body `{"name":"x"}` → 400 antes que 404

**Síntoma:** `PUT /users/9999` con un body cuyo `name` viola `min=2`
devuelve `400 Datos de entrada inválidos` en vez de comprobar que el user
no existe (`404`).

**Causa probable:** el handler valida el body antes que la existencia del
recurso. Comportamiento "técnicamente correcto" según Gin, pero confuso:
si envío un body **válido** apuntando a un id inexistente, sí da 404
(caso 6 del archivo 04).

**Severidad:** Baja. Es ordenación de validaciones — el cliente nunca
debería llegar acá con datos inválidos, pero el cambio de status confunde
testing.

**Fix opcional:** validar id (existencia) antes que el body. Considerar
si vale la pena modificar.
