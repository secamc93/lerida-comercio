.PHONY: help dev docker-up docker-down docker-logs docker-ps \
        migrate seed run-backend run-frontend install-frontend \
        build-backend build-frontend test-backend test-frontend \
        clean

# ===== HELP =====
help:
	@echo "Lérida Comercio - Monorepo Tasks"
	@echo ""
	@echo "Infrastructure:"
	@echo "  make docker-up         Levanta Postgres y servicios locales"
	@echo "  make docker-down       Detiene servicios"
	@echo "  make docker-logs       Sigue logs de Docker"
	@echo "  make docker-ps         Lista contenedores"
	@echo ""
	@echo "Database:"
	@echo "  make migrate           Ejecuta migraciones (crea tablas)"
	@echo "  make seed              Inserta datos iniciales (16 equipos, comercios)"
	@echo ""
	@echo "Backend (Go):"
	@echo "  make run-backend       Inicia la API en :3050"
	@echo "  make build-backend     Compila binario"
	@echo "  make test-backend      Corre tests"
	@echo ""
	@echo "Frontend (Next.js):"
	@echo "  make install-frontend  pnpm install"
	@echo "  make run-frontend      Inicia Next.js en :3000"
	@echo "  make build-frontend    Build de producción"
	@echo ""
	@echo "All-in-one:"
	@echo "  make dev               docker-up + migrate + seed (setup completo)"

# ===== INFRA =====
docker-up:
	cd infra/compose-local && docker compose up -d

docker-down:
	cd infra/compose-local && docker compose down

docker-logs:
	cd infra/compose-local && docker compose logs -f

docker-ps:
	cd infra/compose-local && docker compose ps

# ===== DATABASE =====
migrate:
	cd back/migration && go run cmd/main.go

seed:
	cd back/migration && go run cmd/main.go --seed

# ===== BACKEND =====
run-backend:
	cd back/central && go run cmd/main.go

build-backend:
	cd back/central && go build -o central ./cmd/main.go

test-backend:
	cd back/central && go test ./...

# ===== FRONTEND =====
install-frontend:
	cd front/central && pnpm install

run-frontend:
	cd front/central && pnpm dev

build-frontend:
	cd front/central && pnpm build

test-frontend:
	cd front/central && pnpm test

# ===== DEV SETUP =====
dev: docker-up
	@echo "Esperando que Postgres esté listo..."
	@sleep 5
	@$(MAKE) migrate
	@$(MAKE) seed
	@echo ""
	@echo "✅ Setup completo. Ahora:"
	@echo "   - make run-backend  (en una terminal)"
	@echo "   - make run-frontend (en otra terminal)"

# ===== TMUX DEV ORQUESTADOR =====
# Atajos al script ./scripts/dev-services.sh (sesión tmux 'lerida').
# Para más comandos: ./scripts/dev-services.sh help
up:
	@./scripts/dev-services.sh start all

down:
	@./scripts/dev-services.sh stop all

ps status:
	@./scripts/dev-services.sh status

attach:
	@./scripts/dev-services.sh attach

logs-backend:
	@./scripts/dev-services.sh logs backend 100

logs-frontend:
	@./scripts/dev-services.sh logs frontend 100

restart-backend:
	@./scripts/dev-services.sh restart backend

restart-frontend:
	@./scripts/dev-services.sh restart frontend

kill-zombies:
	@./scripts/dev-services.sh kill-zombies

ports:
	@./scripts/dev-services.sh ports

# ===== GH CLI scoped al repo (cuenta secamc93) =====
# Uso:  eval "$(make gh-env)"   → exporta GH_TOKEN solo en tu shell actual
gh-env:
	@./scripts/gh-env.sh

# ===== CLEAN =====
clean:
	rm -f back/central/central back/migration/migration
	rm -rf front/central/.next front/central/node_modules
