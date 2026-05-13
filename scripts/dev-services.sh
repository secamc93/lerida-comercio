#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# dev-services.sh — Gestor de servicios de desarrollo (tmux)
#
# Uso:
#   ./scripts/dev-services.sh <comando> [servicio]
#
# Comandos:
#   start <servicio|all>     Iniciar servicio(s) en tmux
#   stop <servicio|all>      Detener servicio(s)
#   restart <servicio>       Reiniciar un servicio
#   status                   Ver estado de todos los servicios
#   logs <servicio> [N]      Leer últimas N líneas de log (default: 80)
#   tail <servicio>          Log resumido (40 líneas)
#   attach                   Adjuntar a la sesión tmux (Ctrl+b d para salir)
#   kill-zombies             Matar procesos Go/Next.js huérfanos
#   ports                    Ver puertos en uso
#
# Servicios:
#   infra       Docker (PostgreSQL+PostGIS, Adminer, MinIO externo)
#   migrate    AutoMigrate + (opcional) seed
#   backend     Go API central (puerto 3050)
#   frontend    Next.js dashboard (puerto 3000)
#   all         infra + backend + frontend
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

PROJECT_ROOT="/home/cam/Desktop/lerida-comercio"
TMUX_SESSION="lerida"

# Directorios
BACKEND_DIR="$PROJECT_ROOT/back/central"
MIGRATION_DIR="$PROJECT_ROOT/back/migration"
FRONTEND_DIR="$PROJECT_ROOT/front/central"
DOCKER_LOCAL="$PROJECT_ROOT/infra/compose-local"

# Mapeo servicio → ventana tmux
declare -A SVC_WINDOW=(
    [backend]="backend"
    [frontend]="frontend"
    [migrate]="migrate"
)

# Mapeo servicio → comando
declare -A SVC_CMD=(
    [backend]="cd $BACKEND_DIR && go run cmd/main.go"
    [frontend]="cd $FRONTEND_DIR && pnpm dev"
    [migrate]="cd $MIGRATION_DIR && go run cmd/main.go"
)

# Mapeo servicio → puerto
declare -A SVC_PORT=(
    [backend]="3050"
    [frontend]="3000"
)

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ─── Helpers ────────────────────────────────────────────

ensure_session() {
    if ! tmux has-session -t "$TMUX_SESSION" 2>/dev/null; then
        tmux new-session -d -s "$TMUX_SESSION" -n "main"
        tmux send-keys -t "$TMUX_SESSION:main" "echo '=== Lérida Comercio · Dev Session ==='" Enter
    fi
}

# Devuelve 0 si la ventana del servicio existe
is_running() {
    local svc="$1"
    local win="${SVC_WINDOW[$svc]:-}"
    [ -z "$win" ] && return 1
    tmux list-windows -t "$TMUX_SESSION" -F '#{window_name}' 2>/dev/null | grep -q "^${win}$"
}

kill_port() {
    local port="$1"
    local pids
    pids=$(lsof -ti ":$port" 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "  ${YELLOW}Matando procesos en puerto $port: $pids${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# ─── Infraestructura (Docker) ──────────────────────────

start_infra() {
    echo -e "${BLUE}[infra]${NC} Verificando servicios Docker..."
    if docker ps --format '{{.Names}}' | grep -q "lerida-postgres"; then
        echo -e "${GREEN}[infra]${NC} Ya corriendo"
        return 0
    fi
    echo -e "${BLUE}[infra]${NC} Iniciando PostgreSQL+PostGIS, Adminer..."
    docker-compose -f "$DOCKER_LOCAL/docker-compose.yaml" up -d 2>&1 | tail -5
    echo -e "${BLUE}[infra]${NC} Esperando inicialización (3s)..."
    sleep 3
    echo -e "${GREEN}[infra]${NC} Listo"
}

stop_infra() {
    echo -e "${BLUE}[infra]${NC} Deteniendo servicios Docker..."
    docker-compose -f "$DOCKER_LOCAL/docker-compose.yaml" down 2>&1 | tail -3
    echo -e "${GREEN}[infra]${NC} Detenido"
}

# ─── Servicios en tmux ──────────────────────────────────

start_service() {
    local svc="$1"
    local win="${SVC_WINDOW[$svc]:-}"
    local cmd="${SVC_CMD[$svc]:-}"
    local port="${SVC_PORT[$svc]:-}"

    if [ -z "$win" ] || [ -z "$cmd" ]; then
        echo -e "${RED}Servicio desconocido: $svc${NC}"
        echo "Servicios válidos: backend, frontend, migrate"
        return 1
    fi

    if is_running "$svc"; then
        echo -e "${YELLOW}[$svc]${NC} Ya está corriendo en ventana tmux '$win'"
        return 0
    fi

    if [ -n "$port" ]; then
        kill_port "$port"
    fi

    ensure_session

    echo -e "${BLUE}[$svc]${NC} Iniciando en ventana tmux '$win'..."
    tmux new-window -t "$TMUX_SESSION" -n "$win"
    tmux send-keys -t "$TMUX_SESSION:$win" "$cmd" Enter

    echo -e "${GREEN}[$svc]${NC} Iniciado${port:+ (puerto $port)}"
}

stop_service() {
    local svc="$1"
    local win="${SVC_WINDOW[$svc]:-}"
    local port="${SVC_PORT[$svc]:-}"

    if [ -z "$win" ]; then
        echo -e "${RED}Servicio desconocido: $svc${NC}"
        return 1
    fi

    if ! is_running "$svc"; then
        echo -e "${YELLOW}[$svc]${NC} No está corriendo"
        if [ -n "$port" ]; then
            kill_port "$port"
        fi
        return 0
    fi

    echo -e "${BLUE}[$svc]${NC} Deteniendo..."

    tmux send-keys -t "$TMUX_SESSION:$win" C-c 2>/dev/null || true
    sleep 2
    tmux kill-window -t "$TMUX_SESSION:$win" 2>/dev/null || true

    if [ -n "$port" ]; then
        kill_port "$port"
    fi

    echo -e "${GREEN}[$svc]${NC} Detenido"
}

restart_service() {
    local svc="$1"
    stop_service "$svc"
    sleep 1
    start_service "$svc"
}

# ─── Leer logs ──────────────────────────────────────────

read_logs() {
    local svc="$1"
    local lines="${2:-80}"
    local win="${SVC_WINDOW[$svc]:-}"

    if [ -z "$win" ]; then
        echo -e "${RED}Servicio desconocido: $svc${NC}"
        return 1
    fi

    if ! is_running "$svc"; then
        echo -e "${YELLOW}[$svc]${NC} No está corriendo, no hay logs activos"
        return 1
    fi

    tmux capture-pane -t "$TMUX_SESSION:$win" -p -S "-$lines" 2>/dev/null
}

# ─── Estado ─────────────────────────────────────────────

show_status() {
    echo ""
    echo -e "${CYAN}═══ Lérida Comercio · Dev Services ═══${NC}"
    echo ""

    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "lerida-postgres"; then
        echo -e "  ${GREEN}●${NC} infra        Docker (PG:5434 Adminer:8081)"
    else
        echo -e "  ${RED}○${NC} infra        Docker (detenido)"
    fi

    # MinIO externo (compartido con otros proyectos)
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "minio_local"; then
        echo -e "  ${GREEN}●${NC} minio        externo (S3 :9000, console :9001)"
    else
        echo -e "  ${YELLOW}○${NC} minio        externo (no detectado)"
    fi

    for svc in backend frontend; do
        local port="${SVC_PORT[$svc]:-}"
        local port_info=""
        [ -n "$port" ] && port_info=" :$port"

        if is_running "$svc"; then
            if [ -n "$port" ] && lsof -i ":$port" &>/dev/null; then
                echo -e "  ${GREEN}●${NC} ${svc}$(printf '%*s' $((13 - ${#svc})) '')Corriendo${port_info}"
            else
                echo -e "  ${YELLOW}◐${NC} ${svc}$(printf '%*s' $((13 - ${#svc})) '')Iniciando...${port_info}"
            fi
        else
            echo -e "  ${RED}○${NC} ${svc}$(printf '%*s' $((13 - ${#svc})) '')Detenido${port_info}"
        fi
    done

    echo ""

    if tmux has-session -t "$TMUX_SESSION" 2>/dev/null; then
        echo -e "  ${CYAN}tmux session:${NC} $TMUX_SESSION"
        echo -e "  ${CYAN}ventanas:${NC} $(tmux list-windows -t "$TMUX_SESSION" -F '#{window_name}' 2>/dev/null | tr '\n' ' ')"
        echo -e "  ${CYAN}attach:${NC}     tmux attach -t $TMUX_SESSION  (o '$0 attach')"
    else
        echo -e "  ${YELLOW}Sin sesión tmux activa${NC}"
    fi
    echo ""
}

# ─── Kill zombies ───────────────────────────────────────

kill_zombies() {
    echo -e "${BLUE}Buscando procesos zombie...${NC}"
    local found=0

    local go_pids
    go_pids=$(pgrep -f "go run cmd/main.go" 2>/dev/null || true)
    if [ -n "$go_pids" ]; then
        echo -e "  ${YELLOW}Go run:${NC} $go_pids"
        echo "$go_pids" | xargs kill -9 2>/dev/null || true
        found=1
    fi

    local go_tmp
    go_tmp=$(pgrep -f "/tmp/go-build.*main" 2>/dev/null || true)
    if [ -n "$go_tmp" ]; then
        echo -e "  ${YELLOW}Go tmp:${NC} $go_tmp"
        echo "$go_tmp" | xargs kill -9 2>/dev/null || true
        found=1
    fi

    local next_pids
    next_pids=$(pgrep -f "next dev" 2>/dev/null || true)
    if [ -n "$next_pids" ]; then
        echo -e "  ${YELLOW}Next.js:${NC} $next_pids"
        echo "$next_pids" | xargs kill -9 2>/dev/null || true
        found=1
    fi

    for port in 3000 3050; do
        local port_pids
        port_pids=$(lsof -ti ":$port" 2>/dev/null || true)
        if [ -n "$port_pids" ]; then
            echo -e "  ${YELLOW}Puerto $port:${NC} $port_pids"
            echo "$port_pids" | xargs kill -9 2>/dev/null || true
            found=1
        fi
    done

    if [ "$found" -eq 0 ]; then
        echo -e "${GREEN}No hay procesos zombie${NC}"
    else
        echo -e "${GREEN}Limpieza completa${NC}"
    fi
}

# ─── Puertos ────────────────────────────────────────────

show_ports() {
    echo ""
    echo -e "${CYAN}═══ Puertos del proyecto ═══${NC}"
    echo ""

    local docker_ports
    docker_ports=$(docker ps --format '{{.Names}}:{{.Ports}}' 2>/dev/null || true)

    for port in 3000 3050 5434 8081 9000 9001; do
        local pid
        pid=$(lsof -ti ":$port" 2>/dev/null | head -1 || true)
        if [ -n "$pid" ]; then
            local proc
            proc=$(ps -p "$pid" -o comm= 2>/dev/null || echo "?")
            echo -e "  ${GREEN}●${NC} :$port  $proc (pid $pid)"
        elif echo "$docker_ports" | grep -qE "0\.0\.0\.0:($port|[0-9]+-[0-9]+)->.*$port"; then
            local container
            container=$(echo "$docker_ports" | grep -E "0\.0\.0\.0:($port|[0-9]+-[0-9]+)->.*$port" | head -1 | cut -d: -f1)
            echo -e "  ${GREEN}●${NC} :$port  docker ($container)"
        else
            echo -e "  ${RED}○${NC} :$port  libre"
        fi
    done
    echo ""
}

# ─── Main ───────────────────────────────────────────────

CMD="${1:-}"
SVC="${2:-}"
ARG3="${3:-}"

case "$CMD" in
    start)
        if [ "$SVC" = "all" ]; then
            start_infra
            start_service "backend"
            start_service "frontend"
        elif [ "$SVC" = "infra" ]; then
            start_infra
        elif [ -n "$SVC" ]; then
            start_service "$SVC"
        else
            echo "Uso: $0 start <servicio|all>"
            echo "Servicios: infra, backend, frontend, migrate, all"
            exit 1
        fi
        ;;
    stop)
        if [ "$SVC" = "all" ]; then
            for s in frontend backend migrate; do
                stop_service "$s" 2>/dev/null || true
            done
            stop_infra
            tmux kill-session -t "$TMUX_SESSION" 2>/dev/null || true
        elif [ "$SVC" = "infra" ]; then
            stop_infra
        elif [ -n "$SVC" ]; then
            stop_service "$SVC"
        else
            echo "Uso: $0 stop <servicio|all>"
            exit 1
        fi
        ;;
    restart)
        if [ -z "$SVC" ]; then
            echo "Uso: $0 restart <servicio>"
            exit 1
        fi
        if [ "$SVC" = "infra" ]; then
            stop_infra
            start_infra
        else
            restart_service "$SVC"
        fi
        ;;
    status)
        show_status
        ;;
    logs)
        if [ -z "$SVC" ]; then
            echo "Uso: $0 logs <servicio> [lineas]"
            exit 1
        fi
        read_logs "$SVC" "${ARG3:-80}"
        ;;
    tail)
        if [ -z "$SVC" ]; then
            echo "Uso: $0 tail <servicio>"
            exit 1
        fi
        read_logs "$SVC" 40
        ;;
    attach)
        if ! tmux has-session -t "$TMUX_SESSION" 2>/dev/null; then
            echo -e "${YELLOW}No hay sesión tmux activa. Inicia algo con '$0 start ...' primero.${NC}"
            exit 1
        fi
        tmux attach -t "$TMUX_SESSION"
        ;;
    kill-zombies)
        kill_zombies
        ;;
    ports)
        show_ports
        ;;
    help|--help|-h|"")
        echo ""
        echo -e "${CYAN}dev-services.sh${NC} — Gestor de servicios de desarrollo · Lérida Comercio"
        echo ""
        echo "Comandos:"
        echo "  start <svc|all>     Iniciar servicio(s)"
        echo "  stop <svc|all>      Detener servicio(s)"
        echo "  restart <svc>       Reiniciar servicio"
        echo "  status              Estado de todos los servicios"
        echo "  logs <svc> [N]      Leer últimas N líneas (default: 80)"
        echo "  tail <svc>          Log resumido (40 líneas)"
        echo "  attach              Adjuntar tmux (Ctrl+b d para salir)"
        echo "  kill-zombies        Matar procesos huérfanos"
        echo "  ports               Ver puertos en uso"
        echo ""
        echo "Servicios:"
        echo "  infra       Docker (PostgreSQL+PostGIS, Adminer)"
        echo "  migrate     AutoMigrate (corre y termina)"
        echo "  backend     Go API (puerto 3050)"
        echo "  frontend    Next.js (puerto 3000)"
        echo "  all         infra + backend + frontend"
        echo ""
        echo "Nota: MinIO se asume externo (contenedor 'minio_local' compartido)."
        echo ""
        ;;
    *)
        echo -e "${RED}Comando desconocido: $CMD${NC}"
        echo "Usa '$0 help' para ver los comandos disponibles"
        exit 1
        ;;
esac
