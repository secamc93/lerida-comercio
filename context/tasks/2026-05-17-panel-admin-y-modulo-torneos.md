# 2026-05-17 — Panel admin, módulo torneos y refactors

## Auth — diseño original restaurado y compatible con backend hexagonal
- `layout.tsx`, `page.tsx` (Directorio), `LoginGate`, `Navbar` restaurados al diseño original emerald/dorado.
- `src/lib/auth-context.tsx` + nuevo `src/lib/auth-actions.ts` (server actions) hablan con el backend hexagonal: `/auth/login` (email+password), cookie `session_token`, `/auth/verify`. Login admin real; jugador/invitado quedan como stub.
- Eliminadas referencias de marca *probability* (logo en `LoginForm`, footer, sidebar).

## Negocios — comercio = business + campos extra
- `business` extendido con `phone`, `schedule`, `rating`, `category`, `icon` (11 capas hexagonales del módulo `bussines`). Migración aplicada.
- `business_type`: creado `comercio`. NO existe tipo `torneo` (ver abajo).
- `POST/PUT /businesses` usa `multipart/form-data`.

## Panel admin `/panel` (nuevo)
- Layout con sidebar izquierdo retráctil propio (no el de probability): módulos IAM, Negocios, Torneos.
- `/panel/iam` — pestañas Usuarios/Roles/Recursos/Permisos/Acciones (reusa los `*List` de `services/auth/*`).
- `/panel/negocios` — pestañas Negocios / Tipos de negocio.
- `/panel/torneos` — ver módulo torneos.
- `/home` redirige a `/panel`. Navbar público muestra "⚙️ Panel" para admins.

## Módulo Torneos (nuevo, back + front)
- **Torneo es una entidad propia** (`models.Torneo`) que pertenece a un `Business` — cualquier negocio puede organizar torneos. NO es un tipo de negocio.
- Modelos: `torneo`, `equipo`, `jugador`, `partido`, `partido_evento`. Equipos/jugadores/partidos cuelgan de `torneo_id`.
- Backend hexagonal en `back/central/services/modules/torneo/` (+ `services/modules/bundle.go`, enchufado en `init.go`).
  - CRUD torneo (`/torneo/torneos?business_id=`), CRUD equipos/jugadores/partidos (`?torneo_id=`), eventos, registrar resultado, tabla de posiciones calculada, goleadores calculados desde `partido_evento`, generador de fixture round-robin.
- Frontend hexagonal en `front/central/src/services/modules/torneo/` + página `/panel/torneos` con flujo de 2 niveles: elegir negocio → elegir/crear torneo → pestañas Equipos/Jugadores/Partidos/Tabla/Goleadores.

## Reglas de diseño
- Nuevo `.claude/rules/design.md`: estilo único de tablas, componente `Pagination` compartido (`@/shared/ui`), tabs con íconos, sin títulos de página redundantes, paleta emerald/dorado.
- Tablas de los 6 `*List` unificadas a ese estándar. Paginación unificada.

## Pendiente (futuro)
- Conectar el directorio público `/` al CRUD de negocios tipo comercio (hoy llama a `/api/v1/comercios`/`/categorias` que no existen).
- Tablas con muchas columnas se recortan (`overflow-hidden`); evaluar `overflow-x-auto`.
- `mobile/` (Flutter, 2 GB) sin trackear — definir `.gitignore` adecuado antes de incluirlo.
