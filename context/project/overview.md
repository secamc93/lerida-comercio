# Lérida Comercio — Resumen del proyecto

Estado vigente del monorepo. Actualizar cuando cambien arquitectura, modelos
o endpoints. Última actualización: **2026-05-13**.

## Qué es

Plataforma web de la ciudad de Lérida (Tolima, Colombia) con dos productos
combinados:

1. **Directorio digital de comercios** — categorías, búsqueda, fichas con
   teléfono/dirección/horario, gestión CRUD por administrador.
2. **Torneo de fútbol 8** — 16 equipos en todos contra todos, tabla de
   posiciones, calendario de partidos, estadísticas por jugador (goles,
   asistencias, amarillas, rojas, partidos).

## Stack

| Capa     | Tecnología                                        |
|----------|---------------------------------------------------|
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 |
| Backend  | Go 1.22 + Gin 1.10 + GORM 1.25 + JWT (HS256) + bcrypt |
| DB       | PostgreSQL 15 (Alpine)                            |
| Proxy    | Nginx 1.27                                        |
| CI       | GitHub Actions (un workflow por servicio)         |

## Estructura del repo

```
lerida-comercio/
├── back/
│   ├── central/                    # API REST
│   │   ├── cmd/main.go            # entry point + routing
│   │   ├── internal/
│   │   │   ├── auth/              # JWT + middleware (RequireAuth, RequireRole)
│   │   │   ├── config/            # carga de env
│   │   │   ├── db/                # conexión Postgres
│   │   │   └── handlers/          # auth, comercios, torneo
│   │   ├── Dockerfile             # multi-stage Go 1.22 alpine
│   │   ├── .env.example
│   │   └── go.mod
│   └── migration/                  # schema + seed
│       ├── cmd/main.go            # AutoMigrate + flag --seed
│       ├── shared/models/models.go # ÚNICA fuente del schema
│       ├── Dockerfile
│       └── go.mod
├── front/central/                  # Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # directorio (home)
│   │   │   ├── torneo/page.tsx    # torneo
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── LoginGate.tsx      # 3 flujos: admin/jugador/invitado
│   │   └── lib/
│   │       ├── api.ts             # fetch wrapper con JWT
│   │       └── auth-context.tsx   # AuthProvider + useAuth
│   ├── Dockerfile                 # standalone output
│   ├── next.config.ts             # rewrites /api → backend
│   └── .env.example
├── infra/
│   ├── compose-local/             # desarrollo
│   │   └── docker-compose.yaml    # postgres + adminer
│   ├── compose-prod/              # producción
│   │   └── docker-compose.yaml    # full stack
│   └── nginx/
│       ├── nginx.conf             # proxy /api → back, / → front
│       └── Dockerfile
├── .github/workflows/
│   ├── backend-ci.yml             # test Go + build Docker
│   ├── frontend-ci.yml            # build Next.js + Docker
│   └── nginx-ci.yml               # lint config + build
├── context/                       # contexto para Claude (este archivo)
├── .claude/                       # config Claude Code
├── CLAUDE.md
├── Makefile
└── README.md
```

## Puertos

| Servicio  | Local host | Dentro de Docker |
|-----------|-----------|------------------|
| Frontend  | 3000      | 3000             |
| Backend   | 3050      | 3050             |
| Postgres  | **5434**  | 5432             |
| Adminer   | 8081      | 8080             |
| Nginx (prod) | 80      | 80               |

> 5434 en lugar del 5433 estándar porque otro proyecto local ocupa 5433.

## Credenciales por defecto

- **Admin**: `admin / admin123` (creado por el seed)
- **Postgres**: usuario `lerida`, password `lerida_dev_2026`, DB `lerida_comercio`
- **JWT secret** en `.env` — cambiar en producción

## Modelos de datos (back/migration/shared/models/models.go)

### Comercios
- `Categoria` (id, slug único, nombre, icon, color, orden)
- `Comercio` (id, nombre, categoria_id, icon, descripcion, direccion,
  telefono, horario, rating 1-5, activo)

### Auth
- `Admin` (id, username único, password_hash bcrypt)

### Torneo
- `Equipo` (id, nombre único, color)
- `Jugador` (id, username único, password_hash, nombre, equipo_id, posicion,
  dorsal). Índice único compuesto `(equipo_id, dorsal)`.
- `Partido` (id, jornada, orden_jornada, local_equipo_id, visita_equipo_id,
  gol_local nullable, gol_visita nullable, jugado bool, fecha).
  Índice único `(jornada, orden_jornada)`.
- `JugadorStats` (jugador_id PK, goles, asistencias, amarillas, rojas, partidos)

## Endpoints (back/central/cmd/main.go)

Base: `/api/v1`

### Públicos (sin auth)
- `GET  /categorias` — lista categorías
- `GET  /comercios` — lista comercios (filtros: `?categoria_id=N&q=texto`)
- `GET  /comercios/:id` — detalle
- `GET  /torneo/equipos` — los 16 equipos
- `GET  /torneo/tabla` — tabla de posiciones calculada
- `GET  /torneo/partidos` — fixture (filtro `?jornada=N`)
- `GET  /torneo/jugadores` — lista jugadores (filtro `?equipo_id=N`)
- `GET  /torneo/jugadores/:id`
- `GET  /torneo/jugadores/:id/stats`

### Auth (públicos)
- `POST /auth/login/admin`        body: `{username, password}` → `{token, role:"admin", user}`
- `POST /auth/login/jugador`      body: `{username, password}` → `{token, role:"jugador", user}`
- `POST /auth/register/jugador`   body: `{username, password, nombre, equipo_id, posicion, dorsal}` → `{token, role, user}`

### Autenticado (cualquier rol)
- `GET  /auth/me` — devuelve `{role, user}` según el token

### Solo admin (RequireRole("admin"))
- `POST   /comercios`
- `PUT    /comercios/:id`
- `DELETE /comercios/:id`
- `PUT    /torneo/partidos/:id`         — actualizar marcador
- `PUT    /torneo/jugadores/:id/stats`  — actualizar stats
- `DELETE /torneo/jugadores/:id`        — borra jugador + sus stats

### Solo jugador (RequireRole("jugador"))
- `GET /torneo/mi-equipo` — devuelve el equipo del jugador logueado + roster

## Roles y permisos en el frontend

`role` viene del `auth-context.tsx` y se persiste en localStorage:

- **admin** — ve y edita todo (comercios, marcadores, stats de jugadores)
- **jugador** — pestañas extra "Mi Equipo" y "Mis Estadísticas"; solo lectura
  en tabla y fixture
- **invitado** — solo visualiza directorio y torneo

## Flujo del fixture (cómo se generaron los 120 partidos)

Generado **una sola vez** por el seed (`migration/cmd/main.go::generarFixture`):

- Algoritmo del círculo (round-robin): equipo[0] queda fijo, el resto rota.
- 16 equipos → 15 jornadas × 8 partidos = 120 partidos.
- Localía se alterna por jornada para repartir.
- Si ya hay partidos en la tabla al ejecutar seed, el generador no corre.

## Comandos clave

```bash
# Setup completo (primera vez)
make dev                   # docker-up + migrate + seed

# Desarrollo
make run-backend           # API en :3050
make run-frontend          # Next.js en :3000

# DB
make docker-up             # Postgres + Adminer
make docker-down           # detener
make docker-logs           # logs
make migrate               # crea tablas
make seed                  # inserta datos

# Build
make build-backend         # binario en back/central/central
make build-frontend        # .next/

# Limpieza
make clean
```

## Estado actual de la DB (verificado al inicializar)

```
 equipos | partidos | comercios | categorias | admins
---------+----------+-----------+------------+--------
      16 |      120 |        18 |          9 |      1
```

## Comercios sembrados (18)

Distribución: 3 restaurantes, 2 tiendas, 2 moda, 2 salud, 2 educación,
2 servicios, 2 belleza, 2 deportes, 1 transporte.

## Equipos sembrados (16)

Los Tigres FC, Águilas Doradas, Real Estrella, Deportivo Halcón, Sporting Club,
Atlético Norte, Unión Central, Racing Sur, Estudiantes FC, Defensores,
San Lorenzo, Independiente, Olímpico FC, Juventud Unida, Cóndores, Pumas SC.

## Decisiones técnicas relevantes

- **Pluralización en español**: GORM no pluraliza bien "Categoria" → se añadió
  `func (Categoria) TableName() string { return "categorias" }`.
- **JWT en lugar de sesiones**: stateless, fácil de escalar, suficiente para
  este nivel de complejidad.
- **bcrypt cost por defecto**: 10. No bajar.
- **Migration centralizada**: el módulo `back/migration` es la única fuente
  del schema. `back/central` lo importa con `replace` directive. No
  duplicar modelos.
- **Standalone Next.js**: `output: 'standalone'` para Docker pequeño y
  rápido (no necesita node_modules en runtime).
- **CORS**: configurable via `CORS_ALLOWED_ORIGINS` (coma-separado). En
  dev: `http://localhost:3000,http://localhost`.

## Cosas pendientes / decisiones abiertas

(Mover a `context/tasks/*.md` cuando arranquen.)

- No hay tests automatizados todavía. Idealmente: tests de handlers en Go
  con `httptest`, y tests de componentes en Next.js con Vitest.
- No hay HTTPS configurado en Nginx (falta certbot/letsencrypt).
- No hay paginación en los endpoints `GET` — devolvemos todo. Si crece,
  agregar `?page=1&page_size=20`.
- No hay rate limiting en el backend.
- Cambio de contraseña del admin se hace solo en el seed; no hay endpoint.
- Las stats del jugador son agregadas, no por partido. Si se quiere histórico
  por jornada, hay que crear `partido_jugador_stats`.

## Repositorio GitHub

- URL: https://github.com/secamc93/lerida-comercio
- Cuenta: `secamc93` (personal)
- Rama principal: `main`
- Workflows: `backend-ci`, `frontend-ci`, `nginx-ci` — disparan por path
  filtering (solo corren cuando cambia su carpeta).
