# Casos de prueba E2E — `context/tests/`

Casos de prueba **manuales documentados** del backend `back/central` (SaaS
multi-tenant + RBAC) y del frontend `front/central`.

> El README anterior describía un proyecto previo (directorio Lérida + torneo).
> El proyecto se refactorizó a SaaS hexagonal; esta carpeta refleja el estado
> actual del repo.

## Estructura

```
context/tests/
├── <modulo>/
│   ├── back/      NN-kebab-descripcion.md   (uno por escenario, no por endpoint)
│   ├── front/     NN-kebab-descripcion.md   (UI con Playwright)
│   ├── shared/    test_data.md (credenciales, IDs base)
│   └── RESULTS.md (registro de ejecuciones por fecha + bugs)
```

Módulos vigentes (alineados con `back/central/services/auth/`):

- `auth/` — login, verify, change-password, generate-password, tokens.
- `users/` — CRUD users + assign-role.
- `roles/` — CRUD roles + filtros + permisos asignados al rol.
- `permissions/` — CRUD permissions + bulk + filtros.
- `resources/` — CRUD recursos.
- `actions/` — CRUD acciones.
- `businesses/` — CRUD negocios + activate/deactivate + configured-resources.
- `business-types/` — CRUD tipos de negocio.

## Convención de nombres

`NN-kebab-descripcion.md` donde `NN` es `01`, `02`, … dentro de la carpeta.
Si quieres prefijar con `CU-` (caso de uso) también vale; mantén el formato
parejo dentro de un mismo módulo.

## Formato del archivo de caso

```markdown
# NN — Título corto

**Módulo:** <modulo>   **Tipo:** back | front   **Estado:** ✅ OK | ❌ FAIL | ⚠️ BUG

## Objetivo
Una línea: qué se valida.

## Precondiciones
- Backend up en `:3050`, frontend en `:3000`
- Token JWT de super admin (ver `auth/shared/test_data.md`)
- Datos base sembrados

## Pasos

### 1. Acción
**Request:**
\`\`\`http
POST /api/v1/auth/login
Content-Type: application/json
X-Client-Type: api

{"email":"admin@lerida.local","password":"admin123"}
\`\`\`

**Esperado (200):**
\`\`\`json
{ "success": true, "data": { "token": "...", ... } }
\`\`\`

### 2. ...

## Validaciones post
- Status code
- Forma del payload
- Efecto en DB (si aplica) — `SELECT ...`

## Notas
- Bugs encontrados se anotan en `RESULTS.md` del módulo y se referencian aquí.
```

## Reglas durante ejecución

Ver `.claude/rules/testing.md`. Resumen:
- Crear/modificar SOLO vía API (no INSERT directo).
- Postgres MCP es solo lectura (`SELECT`) para verificar efectos.
- Base URL backend: `http://localhost:3050/api/v1`. Frontend: `http://localhost:3000`.
- En tests E2E **siempre** incluir `X-Client-Type: api` en `POST /auth/login`
  (si no, el backend setea cookie HttpOnly y omite el token del body — ver
  bug abierto en `auth/RESULTS.md`).
