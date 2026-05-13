# Infraestructura y Operaciones

## AWS CLI

Siempre `--profile probability --region us-east-1`.

## Produccion (SSH)

```bash
# Conectar
ssh -i "/home/cam/Desktop/probability/probability.pem" ubuntu@ec2-3-224-189-33.compute-1.amazonaws.com

# Logs back
ssh -i ".../probability.pem" ubuntu@ec2-... "cd /home/ubuntu/probability/infra/compose-prod && docker compose logs --tail 50 back-central"
```

Dir servidor: `/home/ubuntu/probability/infra/compose-prod/`
Solo docker/docker compose (podman desinstalado).
Si `docker compose up -d` falla por monitoring: `docker compose up -d rabbitmq redis back-central back-testing front-central front-website nginx front-testing`

## Servicios de Desarrollo (tmux)

Script principal: `./scripts/dev-services.sh` (sesión tmux `lerida`).
Atajos del Makefile: `make up | down | status | attach | logs-backend | logs-frontend | restart-backend | restart-frontend | ports | kill-zombies`.

```bash
./scripts/dev-services.sh status
./scripts/dev-services.sh start all          # infra + backend + frontend
./scripts/dev-services.sh restart backend    # detiene + limpia + inicia
./scripts/dev-services.sh logs backend 100
./scripts/dev-services.sh attach             # adjuntar tmux (Ctrl+b d para salir)
./scripts/dev-services.sh kill-zombies
./scripts/dev-services.sh ports
```

Puertos: Postgres :5434 · Adminer :8081 · MinIO :9000 (consola :9001) · backend :3050 · frontend :3000.
MinIO se asume externo (contenedor `minio_local` compartido entre proyectos), no está en el compose del proyecto.

NUNCA `go run cmd/main.go &` ni `nohup`. Siempre el script.

## GitHub

SIEMPRE `gh` CLI. NUNCA MCP de GitHub (problemas de autenticacion).

**OBLIGATORIO en cada terminal nueva antes de usar `gh`:**

```bash
eval "$(make gh-env)"       # alias de eval "$(./scripts/gh-env.sh)"
```

Esto exporta `GH_TOKEN` con el PAT de `secamc93` y fija `GH_REPO=secamc93/lerida-comercio`,
sin tocar el keyring global (donde `velocity` queda como default). Verificar con `gh auth status`
— debe decir `Active account: true` y `(GH_TOKEN)`, no `(keyring)`.

El token vive en `.mcp.json` o `.gh-token` (ambos en `.gitignore`). Si `gh auth status` muestra
`Bad credentials`, regenerar el PAT en https://github.com/settings/tokens y reemplazar en el archivo.

```bash
gh pr create --title "T" --body "B" --base main
gh pr merge <n> --squash
gh run list --limit 5
```

Feature branch sync: `git fetch origin && git merge main --no-edit && git push origin <branch>`
Si >50 conflictos: crear branch nuevo y rescatar codigo especifico.
