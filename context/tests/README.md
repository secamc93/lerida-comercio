# tests/

Planes de testing, casos edge identificados y cobertura por módulo.

> Esto **no** son los tests en sí (esos viven junto al código que prueban,
> con extensión `_test.go` o `.test.tsx`). Aquí documentamos **qué probar**
> y **por qué**.

## Estado actual

- ❌ Backend: sin tests automatizados.
- ❌ Frontend: sin tests automatizados.

## Backlog de tests sugerido

### Backend (Go)
- `handlers/auth_handler_test.go`
  - login admin OK / credenciales inválidas
  - login jugador OK / credenciales inválidas
  - registro jugador: username duplicado, dorsal duplicado en mismo equipo,
    posición inválida
  - `me` con token válido/expirado/sin header
- `handlers/comercios_handler_test.go`
  - CRUD con permisos correctos
  - filtros `q` y `categoria_id`
- `handlers/torneo_handler_test.go`
  - cálculo de la tabla con varios escenarios
  - upsert de stats
  - mi-equipo según token

### Frontend (Next.js)
- `LoginGate`: cambio entre pasos, validaciones, manejo de errores del API
- `Navbar`: badge cambia según rol
- `page.tsx (Directorio)`: filtros por categoría y búsqueda
- `torneo/page.tsx`: cambio de jornada, edición de marcador

## Cómo arrancar

Cuando estemos listos para testing:

**Backend:**
```bash
go test ./...
```
Usar `httptest` + un Postgres de test (puede ser el mismo container con
otra DB).

**Frontend:**
Instalar Vitest + Testing Library:
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

## Convención

Si identificas un caso edge raro mientras desarrollas, déjalo documentado
aquí con un archivo por módulo (`backend-auth.md`, `frontend-torneo.md`,
etc.) y un checklist de casos.
