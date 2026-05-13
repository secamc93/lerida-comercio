# CLAUDE.md

Guía para Claude Code cuando trabaje en este repositorio.

## Resumen rápido

Monorepo de **Lérida Comercio** — un directorio digital de comercios + torneo de fútbol 8 — con:

- `back/central/` — API REST en **Go + Gin + GORM**
- `back/migration/` — AutoMigrate y seed de la base de datos
- `front/central/` — App **Next.js 16 + TypeScript + Tailwind**
- `infra/compose-local/` — Postgres 15 + Adminer (desarrollo)
- `infra/compose-prod/` — Stack completo con Nginx
- `infra/nginx/` — Reverse proxy

Detalles completos del proyecto (arquitectura, modelos, endpoints, comandos)
están en **[`context/project/overview.md`](./context/project/overview.md)**.
Léelo cuando necesites entender el estado actual.

## Carpeta `context/`

Todo el contexto persistente del proyecto vive en `context/`. Antes de
implementar algo grande, revisa la carpeta relevante para no duplicar trabajo
ni romper decisiones previas.

```
context/
├── project/   # Estado del proyecto: arquitectura, modelos, endpoints
├── tasks/     # Tareas en curso, backlog, notas de decisiones
└── tests/     # Especificaciones de testing, casos de prueba documentados
```

### Cuándo leer cada subcarpeta

- **`context/project/`** — siempre que necesites recordar la arquitectura, los
  modelos de datos, qué endpoints existen, qué puertos usa cada servicio, o
  cómo se relacionan los servicios entre sí.
- **`context/tasks/`** — cuando el usuario pida algo que pueda ser continuación
  de trabajo previo, o cuando quieras dejar registro de una tarea pendiente
  o decisión técnica importante.
- **`context/tests/`** — cuando vayas a escribir tests, modificar tests, o
  cuando necesites entender qué cobertura tiene un módulo.

### Cuándo escribir en `context/`

- Después de una sesión donde se cambió la arquitectura, agregaste tablas,
  endpoints, o servicios → actualiza `context/project/overview.md`.
- Cuando dejas trabajo a medias o tomas una decisión que vale la pena
  documentar → crea un `.md` en `context/tasks/` con la fecha en el nombre
  (por ejemplo `2026-05-15-migrar-jwt-a-cookies.md`).
- Cuando agregas una suite de tests significativa → documenta el alcance en
  `context/tests/`.

Mantén los archivos **cortos y útiles**: hechos verificables, decisiones con
su razón, no narrativa. Si algo se puede derivar del código, no lo dupliques
aquí.

## Convenciones del proyecto

### Idioma
- El usuario responde y prefiere comunicarse en **español**.
- Comentarios, mensajes de commit, errores HTTP y UI: español.
- Nombres de identificadores en código: inglés (estándar de programación).

### Backend (Go)
- Módulos: `back/central` y `back/migration`. `central` importa `migration`
  con `replace` directive (no copies modelos, importa desde
  `github.com/secamc93/lerida-comercio/back/migration/shared/models`).
- Framework HTTP: **Gin**. ORM: **GORM**. Auth: **JWT (HS256)** con bcrypt.
- Estructura: `cmd/main.go` arranca todo; `internal/{auth,config,db,handlers}`
  contiene la lógica. No metas lógica de negocio en `cmd/`.
- Variables de entorno se cargan desde `.env` (godotenv) con fallback a
  defaults sensatos en `internal/config/config.go`.
- Errores hacia el cliente: `c.JSON(httpCode, gin.H{"error": "..."})`.

### Frontend (Next.js)
- **App Router** + Server Components por defecto. `"use client"` solo cuando
  hace falta interactividad (useState, eventos, localStorage).
- Cliente API en `src/lib/api.ts` — usa `api<T>(path, opts)` con auth
  automática vía localStorage.
- Contexto de auth en `src/lib/auth-context.tsx`. Roles: `admin | jugador | invitado`.
- Estilos: **Tailwind v4**. Paleta: `emerald` (verde), `yellow/amber` (dorado).
- No agregues librerías de UI pesadas (shadcn, MUI, etc.) sin avisar primero.

### Base de datos
- Postgres 15. **Una sola fuente de verdad** para el schema:
  `back/migration/shared/models/models.go`.
- Migraciones via GORM AutoMigrate (`make migrate`). El seed
  (`make seed` o `--seed`) inserta categorías, comercios, 16 equipos,
  admin/admin123 y genera el fixture round-robin (120 partidos).
- Todas las tablas usan plural en español: `comercios`, `categorias`,
  `equipos`, `jugadores`, `partidos`, `jugador_stats`, `admins`.

### Puertos locales (importante)
- Frontend: **3000**
- Backend: **3050**
- Postgres: **5434** (5433 está ocupado por otro proyecto)
- Adminer: **8081**

### Git / GitHub
- Repo: `git@github.com:secamc93/lerida-comercio.git`
- Rama principal: `main`
- No hagas push sin confirmar con el usuario primero.
- Workflows en `.github/workflows/` — uno por servicio (backend, frontend,
  nginx). Cada uno se dispara solo cuando cambian archivos de su carpeta.

## Comandos comunes

```bash
make dev               # Setup completo: levanta DB + migra + seed
make docker-up         # Solo Postgres + Adminer
make migrate           # Crea tablas
make seed              # Inserta datos iniciales
make run-backend       # API en :3050
make run-frontend      # Next.js en :3000
make build-frontend    # Build de producción
```

## Antes de cambios grandes

1. Lee `context/project/overview.md` para conocer el estado.
2. Si vas a agregar endpoints/modelos: piensa primero en `back/migration/shared/models/`
   y luego en `back/central/internal/handlers/`.
3. Si vas a agregar páginas: define el endpoint primero, luego el cliente
   en `src/lib/api.ts`, luego la UI.
4. Verifica que compile (`go build ./...` y `pnpm build`) antes de dar
   la tarea por terminada.

## No hagas

- No instales pnpm/npm packages sin avisar.
- No cambies el puerto de Postgres sin razón (5434 está fijo).
- No commitees archivos `.env` (están en `.gitignore`).
- No introduzcas un ORM/framework distinto sin discutir antes.
- No dupliques modelos GORM — siempre importa desde `back/migration/shared/models`.
