# Lérida Comercio

Monorepo de **Lérida Comercio** — un directorio digital de comercios + un
torneo de fútbol 8. Plataforma SaaS multi-negocio con panel de administración.

🌐 Producción: **https://leridacomercio.com**

---

## Descripción general

El proyecto reúne en un solo repositorio el backend, el frontend, la app móvil
y toda la infraestructura. Está pensado para desarrollarse **asistido por IA**
(Claude Code): la documentación viva, las reglas y el contexto del proyecto
están versionados para que la IA y las personas trabajen con la misma base.

- **Backend** — API REST en Go (Gin + GORM), JWT, PostgreSQL.
- **Frontend** — Next.js 16 + TypeScript + Tailwind v4.
- **Móvil** — app en `mobile/`.
- **Infra** — Docker Compose (local y producción), Terraform (AWS), Nginx.

## Cómo se compone

```
lerida-comercio/
├── back/
│   ├── central/      API REST principal (Go, arquitectura hexagonal)
│   ├── migration/    AutoMigrate + seed de la base de datos
│   └── models/       Modelos GORM compartidos (fuente única del schema)
├── front/
│   └── central/      App Next.js (App Router, Server Components)
├── mobile/           App móvil
├── infra/
│   ├── compose-local/   Postgres + Adminer + MinIO (desarrollo)
│   ├── compose-deploy/  Stack de producción (imágenes desde ECR)
│   ├── nginx/           Reverse proxy
│   └── terraform/       Infraestructura AWS como código
├── scripts/          Utilidades de desarrollo (tmux, gh-env, etc.)
├── context/          Contexto persistente del proyecto (estado, tareas, tests)
├── .claude/          Reglas y configuración para Claude Code
└── CLAUDE.md         Guía principal para la IA
```

Puertos locales: frontend `3000` · backend `3050` · Postgres `5434` ·
Adminer `8081` · MinIO `9000/9001`.

## Herramientas necesarias

Para trabajar en el repo necesitás instalado:

| Herramienta | Versión | Para qué |
|---|---|---|
| **Go** | 1.24+ | Backend y migraciones |
| **Node.js** | 22+ | Frontend |
| **pnpm** | 10.x | Gestor de paquetes del frontend |
| **Docker** + Compose | reciente | Base de datos local y despliegue |
| **Terraform** | 1.6+ | Infraestructura AWS (`infra/terraform/`) |
| **GitHub CLI (`gh`)** | reciente | PRs, workflows, secrets |

> El **AWS CLI** y las credenciales de AWS las administra **solo el dueño del
> proyecto** — no son necesarias para desarrollar features.

Arranque rápido: `make dev` (levanta DB + migra + seed). Ver más targets con
`make help`.

## Servicios de desarrollo (tmux)

Los servicios se levantan **orquestados dentro de una sesión `tmux`** (`lerida`)
mediante `scripts/dev-services.sh`. Esto permite que la IA controle el ciclo de
vida de cada servicio y, sobre todo, **lea los logs en vivo** para entender el
comportamiento de la aplicación y diagnosticar problemas.

```bash
./scripts/dev-services.sh start all        # infra + backend + frontend
./scripts/dev-services.sh status
./scripts/dev-services.sh logs backend 200 # la IA lee estos logs
./scripts/dev-services.sh restart backend
./scripts/dev-services.sh attach           # adjuntar la sesión tmux
```

Atajos equivalentes en el Makefile: `make up | down | status | attach |
logs-backend | logs-frontend | restart-backend | restart-frontend`.

> La IA **siempre revisa los logs de tmux** antes de concluir: así verifica el
> efecto real de un cambio y entiende el flujo de la aplicación, en vez de
> suponer. Nunca se arranca el backend con `go run ... &` ni `nohup` — siempre
> mediante el script.

## MCPs

El repo trae configurados estos MCP servers (`.mcp.json`) para usar con Claude
Code:

- **`playwright`** — pruebas en navegador real: la IA navega, hace clics,
  llena formularios y valida la UI de forma automatizada (testing E2E del
  frontend).
- `chrome-devtools` / `chrome-browser` — inspección de red y consola del navegador
- `postgres-lerida` — consultas a la base de datos (solo lectura para verificar)
- `github` — operaciones sobre el repositorio
- `docker` — gestión de contenedores
- `fetch` — peticiones HTTP (testing de API)
- `sequential-thinking` — razonamiento estructurado

## Seguridad — proyecto asistido por IA

Este es un proyecto que se desarrolla con asistencia de IA. Regla **no
negociable**:

- ❌ **Nunca** se commitean secretos, contraseñas, tokens ni claves.
- Los archivos `.env`, `.env.*`, `*.pem`, `terraform.tfstate*` y `.gh-token`
  están en `.gitignore` y **deben quedar fuera del repo**.
- Las credenciales de testing para la IA viven en `.env.AI` (gitignored);
  plantilla en `.env.AI.example`.
- Si algo necesita un secreto, va por variable de entorno o GitHub Secret,
  nunca hardcodeado.

## Convenciones de desarrollo

Todo cambio debe respetar:

- **Arquitectura hexagonal** — dependencias `Infra → App → Domain`; el dominio
  nunca conoce las capas externas. Detalle en `.claude/rules/architecture.md`.
- **Modularidad** — los módulos no comparten repositorios entre sí; si un
  módulo necesita datos de otro, replica solo las consultas `SELECT`. Ver
  `.claude/rules/backend-conventions.md`.
- **Tests unitarios** — cada cambio de lógica viene con sus tests. Backend:
  `go test ./...`. Frontend: según el módulo.
- **Idioma** — comunicación, comentarios y mensajes de commit en español;
  identificadores de código en inglés.

Antes de cambios grandes, leé `CLAUDE.md` y la carpeta `context/`.

## Documentación

- `CLAUDE.md` — guía principal (arquitectura, convenciones, comandos).
- `context/project/` — estado del proyecto, modelos, endpoints, infra AWS.
- `.claude/rules/` — reglas detalladas (arquitectura, deploy, testing, diseño).
