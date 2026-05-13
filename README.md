# Lérida Comercio

Monorepo del directorio digital de comercios y torneo de fútbol 8 de Lérida.

## Estructura

```
lerida-comercio/
├── back/
│   ├── central/         # API REST (Go + Gin + GORM)
│   └── migration/       # Migraciones de base de datos
├── front/
│   └── central/         # Web app (Next.js 15 + TS + Tailwind)
├── infra/
│   ├── compose-local/   # docker-compose para desarrollo local
│   └── nginx/           # Reverse proxy para producción
└── .github/workflows/   # CI/CD por servicio
```

## Stack

- **Backend:** Go 1.22+, Gin, GORM, PostgreSQL 15
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, TailwindCSS
- **DB:** PostgreSQL 15 (Docker con volumen local)
- **Reverse Proxy:** Nginx
- **CI/CD:** GitHub Actions (uno por servicio)

## Quick start

```bash
# Setup completo: levanta Postgres, crea tablas, inserta datos
make dev

# En otra terminal: inicia el backend
make run-backend       # http://localhost:3050

# En otra terminal: inicia el frontend
make install-frontend  # solo la primera vez
make run-frontend      # http://localhost:3000
```

## Puertos

| Servicio   | Puerto local | Dentro de Docker |
|------------|--------------|------------------|
| Frontend   | 3000         | 3000             |
| Backend    | 3050         | 3050             |
| Postgres   |  5434         | 5432             |
| Nginx prod | 80 / 443     | 80 / 443         |

## Variables de entorno

Copia los archivos `.env.example` a `.env` en cada subproyecto:

```bash
cp back/central/.env.example back/central/.env
cp back/migration/.env.example back/migration/.env
cp front/central/.env.example front/central/.env.local
```

## Tareas comunes

Ver todas: `make help`
