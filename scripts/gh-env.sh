#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
#  gh-env.sh — Exporta GH_TOKEN para que `gh` use el token de este repo
#  sin tocar la configuración global (~/.config/gh).
#
#  Uso:
#      eval "$(./scripts/gh-env.sh)"
#      gh repo view
#
#  Estrategia de búsqueda (primer hit gana):
#    1. archivo `.gh-token`           ← simple, una línea con el PAT
#    2. campo `GITHUB_PERSONAL_ACCESS_TOKEN` dentro de `.mcp.json`
#
#  Ambos archivos están en `.gitignore`.
# ═══════════════════════════════════════════════════════════════════════

set -euo pipefail
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Repo y cuenta esperada para este proyecto.
REPO_OWNER="secamc93"
REPO_NAME="lerida-comercio"
REPO_FULL="${REPO_OWNER}/${REPO_NAME}"

token=""
if [ -f "$PROJECT_ROOT/.gh-token" ]; then
    token="$(tr -d '[:space:]' < "$PROJECT_ROOT/.gh-token")"
elif [ -f "$PROJECT_ROOT/.mcp.json" ]; then
    token="$(grep -oE '"GITHUB_PERSONAL_ACCESS_TOKEN"\s*:\s*"[^"]+"' "$PROJECT_ROOT/.mcp.json" \
        | head -1 \
        | sed -E 's/.*"([^"]+)"$/\1/')"
fi

if [ -z "$token" ]; then
    echo "echo '❌ No se encontró GH_TOKEN. Crea .gh-token o ajusta .mcp.json.' >&2; return 1 2>/dev/null || exit 1"
    exit 1
fi

# Pista de identidad en el prompt para que sepas en qué repo estás operando.
# Si tu shell ya define un PS1/RPROMPT, GH_PROMPT_INFO se exporta y vos lo
# podés incluir manualmente (ej. en ~/.zshrc:  PROMPT="\$GH_PROMPT_INFO $PROMPT").
echo "export GH_TOKEN=$token"
echo "export GITHUB_TOKEN=$token"
echo "export GH_REPO=$REPO_FULL"
echo "export GH_HOST=github.com"
echo "export GH_PROMPT_INFO='[gh:$REPO_FULL]'"
echo "echo '✅ gh CLI scoped → $REPO_FULL (cuenta $REPO_OWNER)'"
echo "echo '   GH_TOKEN     = ${token:0:18}…'"
echo "echo '   GH_REPO      = $REPO_FULL  (gh usa este repo por defecto)'"
echo "echo '   PROMPT hint  = \$GH_PROMPT_INFO  (agregá a tu PS1 si querés)'"
