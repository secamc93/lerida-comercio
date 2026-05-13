# Lérida Comercio

Monorepo del **directorio digital de comercios** y **torneo de fútbol 8** de Lérida.

> Este README está pensado para que tanto humanos como agentes de IA (Claude
> Code, Cursor, Aider, etc.) puedan entender, levantar y operar el proyecto
> sin contexto previo.

---

## 1. Resumen

- **Backend**: Go 1.22 + Gin + GORM + PostgreSQL 15/PostGIS. Arquitectura
  hexagonal por módulo (`domain / app / infra/primary / infra/secondary`).
  Único entrypoint: `back/central/cmd/main.go` → `cmd/internal/server.Init`.
- **Frontend**: Next.js 16 (App Router, Turbopack) + React 19 + TypeScript +
  Tailwind v4. Cliente API en `src/lib/api.ts`. Servicios organizados por
  dominio en `src/services/`.
- **Modelos GORM**: viven en su propio módulo `back/models` (Go module
  independiente, importado vía `replace` por `back/migration` y
  `back/central`). Única fuente de verdad del schema.
- **Infra dev**: Postgres 15 + PostGIS en Docker (`infra/compose-local`),
  MinIO externo (`minio_local`, S3-compatible), Adminer para administrar la
  DB.
- **Orquestación dev**: script `scripts/dev-services.sh` montado sobre tmux,
  con atajos en el `Makefile`.

---

## 2. Estructura del repo

```
lerida-comercio/
├── back/
│   ├── central/                 # API HTTP (Go module)
│   │   ├── cmd/                 # main.go + server/init + routes
│   │   ├── services/auth/       # módulo de autenticación + RBAC
│   │   │   ├── login/           # POST /auth/login, change-password, etc.
│   │   │   ├── users/           # CRUD usuarios
│   │   │   ├── roles/           # CRUD roles
│   │   │   ├── permissions/     # CRUD permisos
│   │   │   ├── resources/       # CRUD recursos
│   │   │   ├── actions/         # CRUD acciones
│   │   │   ├── bussines/        # CRUD businesses (multi-tenant)
│   │   │   └── middleware/      # JWT, CORS, security headers
│   │   └── shared/              # paquetes compartidos: db, env, log, jwt,
│   │                            #   storage(S3), email, redis, rabbitmq,
│   │                            #   bedrock, dynamo, metrics, httpclient, errs
│   ├── migration/               # ejecuta AutoMigrate y seed (Go module)
│   │   ├── cmd/main.go          # --reset y --seed
│   │   └── seed/                # SQL/Go seeds
│   └── models/                  # **paquete único de modelos GORM** (Go module)
├── front/
│   └── central/                 # Next.js dashboard
│       └── src/
│           ├── app/             # rutas (App Router)
│           ├── services/        # módulos por dominio (auth, etc.)
│           ├── shared/          # ui primitives, contexts, hooks, utils
│           └── lib/             # api.ts, auth-context.tsx, utils
├── infra/
│   ├── compose-local/           # Postgres+PostGIS, Adminer
│   ├── compose-prod/            # stack producción
│   └── nginx/                   # reverse proxy
├── scripts/
│   ├── dev-services.sh          # orquestador tmux (start/stop/logs/...)
│   └── gh-env.sh                # exporta GH_TOKEN scoped al repo
├── context/                     # contexto persistente para IA
│   ├── project/                 # arquitectura, modelos, endpoints
│   ├── tasks/                   # backlog, decisiones
│   └── tests/                   # cobertura
├── .claude/
│   └── rules/                   # reglas operativas para Claude Code
├── CLAUDE.md                    # guía principal para agentes
├── Makefile                     # atajos de TODO el workflow
└── .mcp.json                    # config MCP (no se commitea)
```

---

## 3. Stack y versiones

| Capa | Tecnología | Versión |
|---|---|---|
| Lenguaje backend | Go | 1.22+ |
| Framework HTTP | Gin | v1.10 |
| ORM | GORM | v1.31 |
| Base de datos | PostgreSQL + PostGIS | 15 / 3.4 |
| Object storage (dev) | MinIO | latest |
| Auth | JWT HS256 + bcrypt | golang-jwt/jwt/v5 |
| Logger | zerolog | v1.35 |
| Frontend | Next.js (Turbopack) | 16.2 |
| UI | React + Tailwind | 19 / 4 |
| Forms | react-hook-form + zod | — |
| Mapas | leaflet + react-leaflet | — |
| Package manager | pnpm | 10 |
| Contenedores | Docker + docker-compose v2 | — |
| Orquestación dev | tmux | 3+ |

---

## 4. Puertos

| Servicio | Puerto host | Notas |
|---|---|---|
| Frontend (Next.js) | **3000** | `pnpm dev` |
| Backend (Go API) | **3050** | binario Go |
| Postgres + PostGIS | **5434** | host:5434 → cont:5432. **No 5433** (reservado por otro proyecto) |
| Adminer | **8081** | http://localhost:8081 |
| MinIO API (S3) | **9000** | contenedor externo `minio_local` |
| MinIO Console | **9001** | usuario `minioadmin / minioadmin` |

---

## 5. Quick start

### 5.1 Pre-requisitos

```bash
go version       # >= 1.22
node -v          # >= 18
pnpm -v          # >= 8
docker --version
tmux -V          # 3+
```

### 5.2 Configurar variables de entorno

```bash
# Backend (ya está creado .env en este repo)
cp back/central/.env.example back/central/.env       # solo si no existe
cp back/migration/.env.example back/migration/.env

# Frontend (si aplica)
# Next.js lee NEXT_PUBLIC_API_URL del entorno; default http://localhost:3050
```

El `.env` de `back/central` ya viene con `RELAX_ENV=1`, MinIO/Postgres/etc.
apuntando a localhost. Si falta algún servicio (Redis, RabbitMQ), el backend
loguea un warn y sigue.

### 5.3 Levantar TODO con un solo comando

```bash
make up
```

Este atajo:
1. Sube los contenedores Docker (`compose-local`: Postgres + Adminer).
2. Inicia el backend Go en una ventana tmux (`backend`).
3. Inicia el frontend Next.js en otra ventana tmux (`frontend`).

Usa `make status` para ver el estado y `make attach` para entrar a la sesión
tmux (Ctrl+b d para salir sin matar).

### 5.4 Primera migración + seed (solo la primera vez o cuando reseteas)

```bash
cd back/migration
go run ./cmd --reset --seed     # --reset es DESTRUCTIVO: dropea todas las tablas
```

El seed crea:
- `business_type`: Lerida Comercio
- 2 scopes (`platform`, `business`)
- 13 actions (Create/Read/Update/.../Migrate)
- 7 resources (Usuarios, Permisos, Roles, Recursos, Empresas, Integraciones, Notificaciones)
- 3 roles (Super Admin, Operador, Administrador)
- 28 permissions (CRUD × 7 recursos)
- 1 usuario super admin: **admin@lerida.local / admin123**

### 5.5 Probar el login

```bash
curl -X POST http://localhost:3050/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lerida.local","password":"admin123"}'
# → HTTP 200, is_super_admin: true, scope: platform
```

Frontend: abrir <http://localhost:3000>.

---

## 6. Comandos del Makefile

### Orquestación tmux

```bash
make up                # infra + backend + frontend (sesión tmux `lerida`)
make down              # detiene todo y cierra la sesión
make status            # estado de servicios y puertos
make attach            # entra a la sesión tmux
make logs-backend      # últimas 100 líneas del backend
make logs-frontend     # últimas 100 líneas del frontend
make restart-backend   # Ctrl+C + clean + reinicia
make restart-frontend  # ídem
make kill-zombies      # mata procesos go/next.js huérfanos
make ports             # qué proceso ocupa cada puerto del stack
```

### Build y migraciones

```bash
make docker-up         # solo levanta Postgres + Adminer
make docker-down
make migrate           # cd back/migration && go run ./cmd
make seed              # cd back/migration && go run ./cmd --seed
make run-backend       # corre `go run cmd/main.go` directo (sin tmux)
make run-frontend      # `pnpm dev` directo
make build-frontend    # build producción Next.js
make test-backend
make test-frontend
make clean             # borra binarios + node_modules + .next
```

### GitHub CLI scoped al repo

```bash
eval "$(make gh-env)"  # exporta GH_TOKEN (cuenta secamc93) y GH_REPO
gh auth status         # debe decir Active account: true (GH_TOKEN)
gh pr list             # ya apunta a secamc93/lerida-comercio
```

Ver §8 para detalles.

---

## 7. Modelo de datos (auth básicos)

Único paquete: `back/models` (Go module). Entidades:

```
business_type ──┬── role ─────── role_permissions ─── permission ──┬── resource
                │                                                  ├── action
                │                                                  └── scope
                └── business ─── business_staff ─── user ─── user_roles
                                                          └── user_businesses
```

- **scope**: `platform` (super admin global) o `business` (acotado al negocio).
- **Super Admin**: `role_id=1`, `scope=platform`. Autoriza vía código (no requiere filas en `role_permissions`).
- **Administrador**: `scope=business`, ligado a `business_type=Lerida Comercio`. Tiene CRUD de los 6 recursos de negocio (todo menos `Notificaciones`).
- **Operador**: `scope=platform`. Sin permisos asignados aún.

Las tablas usan `SingularTable: true` (configurado en `shared/db`). Por eso son `user`, `role`, `permission` (no `users`, `roles`, `permissions`). Las pivote conservan plural por la convención de GORM many2many: `role_permissions`, `user_roles`, `user_businesses`.

---

## 8. GitHub CLI (per-project, sin tocar el global)

El repo trae un patrón para tener `gh` apuntando a la cuenta correcta sin
interferir con otros proyectos.

```bash
eval "$(make gh-env)"
```

- Lee el PAT desde `.gh-token` o de `.mcp.json` (ambos en `.gitignore`).
- Exporta `GH_TOKEN`, `GITHUB_TOKEN`, `GH_REPO=secamc93/lerida-comercio`,
  `GH_HOST=github.com`.
- `gh` prioriza la env var sobre el keyring global → la cuenta activa pasa a
  ser `secamc93`.
- Sin `eval`, `gh` vuelve al keyring global (otro usuario u otro repo).

**Si el token vence**: regenerar en https://github.com/settings/tokens y
pegarlo en `.gh-token` o `.mcp.json`. Verificar con `gh auth status` —
debe decir `Active account: true` y `(GH_TOKEN)` (no `(keyring)`).

---

## 9. MCP (Model Context Protocol)

`.mcp.json` (gitignored) define los MCP servers que la IA puede usar:

| Server | Para qué |
|---|---|
| `postgres-lerida` | Consultas SQL directas contra la DB local |
| `chrome-browser` | Puppeteer (automatización general) |
| `github` | API de GitHub (usa el PAT del mismo .mcp.json) |
| `sequential-thinking` | Razonamiento estructurado |
| `fetch` | HTTP requests |
| `docker` | Gestión de contenedores |
| `chrome-devtools` | Browser DevTools (necesita Chrome con `--remote-debugging-port=9222`) |
| `playwright` | E2E |

Reiniciar Claude Code después de editar `.mcp.json`.

---

## 10. Carpetas para agentes de IA

| Carpeta | Cuándo leerla / escribirla |
|---|---|
| `CLAUDE.md` | Guía principal del proyecto. Léela primero. |
| `.claude/rules/` | Reglas operativas (infra-ops, deploy, testing, architecture, backend-conventions, test-credentials). |
| `context/project/` | Estado de la arquitectura, modelos, endpoints. |
| `context/tasks/` | Tareas en curso, decisiones técnicas (un `.md` por fecha). |
| `context/tests/` | Casos de prueba documentados. |

Antes de un cambio grande: lee `CLAUDE.md` + `context/project/overview.md` +
las reglas relevantes. Después: si tomaste decisiones no obvias, dejá un
`.md` en `context/tasks/YYYY-MM-DD-titulo.md`.

---

## 11. Convenciones

- **Idioma**: español en comentarios, errores HTTP, UI y mensajes de commit.
  Identificadores en inglés (estándar).
- **Backend**: gin para HTTP, GORM para ORM. Errores al cliente como
  `c.JSON(status, gin.H{"error": "..."})`. Variables de entorno via
  `shared/env`.
- **Frontend**: Server Components por defecto. `"use client"` solo cuando hace
  falta interactividad. No instalar librerías de UI pesadas (shadcn, MUI)
  sin avisar.
- **Modelos**: una sola fuente de verdad en `back/models`. No duplicar
  structs GORM.
- **Migraciones**: GORM AutoMigrate vía `make migrate`. Para reset destructivo:
  `--reset`.
- **Git**: no pushear sin confirmar con el dueño. No commitear `.env`, `.mcp.json`,
  `.gh-token`, `*.pem`. Verificar con `git check-ignore -v <archivo>`.

---

## 12. Reset rápido (cuando algo se rompió mucho)

```bash
make down                  # tumba todo
docker volume rm lerida-postgres-data     # borra DB (ATENCIÓN: destruye datos)
make docker-up
cd back/migration && go run ./cmd --reset --seed
make up
```

---

## 13. Producción

Pendiente de documentar. Vive en `infra/compose-prod` + workflows de
GitHub Actions en `.github/workflows/`. El nginx de producción está en
`infra/nginx/`.

---

## 14. Soporte y dudas

Lee, en orden:
1. Este README.
2. `CLAUDE.md`.
3. `.claude/rules/*.md` (especialmente `infra-ops.md`).
4. `context/project/overview.md`.

Si nada de eso responde la pregunta, registra la decisión nueva en
`context/tasks/` cuando la tomes.
