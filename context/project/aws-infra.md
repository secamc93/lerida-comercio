# Infraestructura AWS — Lérida Comercio

Aprovisionada 2026-05-18. Perfil `default`, cuenta `334689162817`, región `us-east-1`.

**Gestionada con Terraform** en `infra/terraform/` (estado local, gitignored).
Los recursos se crearon con AWS CLI y luego se importaron al state; `terraform
plan` no muestra drift. Cambios futuros: editar los `.tf` y `terraform apply`.

## Inventario

| Recurso | Identificador |
|---|---|
| S3 bucket | `lerida-comercio-storage-334689162817` (versioning ON, acceso público bloqueado) |
| ECR repo | `334689162817.dkr.ecr.us-east-1.amazonaws.com/lerida-comercio` (scan on push) |
| Key pair | `lerida-comercio` → `~/.ssh/lerida-comercio.pem` (chmod 400) |
| Security Group | `sg-02aa32bab1b0e8fe0` (`lerida-comercio-sg`) — inbound 22/80/443 |
| EC2 | `i-0f2ff0ce17e4dce66` — t4g.small (ARM, 2 GB), Ubuntu 24.04 ARM64, 20 GB gp3 |
| Elastic IP | `34.235.36.96` (alloc `eipalloc-07d3aa7937d768eba`) |
| DNS público | `ec2-34-235-36-96.compute-1.amazonaws.com` |
| VPC / Subnet | `vpc-03423e52dc165f922` / `subnet-0625e4a9773b81502` (us-east-1a) |
| IAM | role + instance profile `lerida-comercio-ec2-ecr` (pull desde ECR) |

## Acceso SSH

```bash
ssh -i ~/.ssh/lerida-comercio.pem ubuntu@34.235.36.96
```

## Bootstrap del EC2 (user-data)

Al arrancar instala: Docker CE + plugins (buildx, compose), AWS CLI v2.
Crea `/home/ubuntu/lerida-comercio/`. Marca fin en `/home/ubuntu/bootstrap.done`.

## Deploy — completado 2026-05-18

App corriendo en el EC2 con `docker compose`. URL pública:
**http://ec2-34-235-36-96.compute-1.amazonaws.com**

- Imágenes ARM64 en ECR `lerida-comercio` con tags `migration`, `backend`,
  `frontend`, `nginx`. Build local con `docker buildx --platform linux/arm64`.
- Compose y `.env` (no commiteado) en `infra/compose-deploy/`, desplegados en
  el EC2 en `/home/ubuntu/lerida-comercio/`.
- Postgres 15 contenedor + volumen `lerida-postgres-data-prod`. Seed aplicado
  (admin@lerida.local / admin123).
- Bucket S3 `lerida-comercio-storage-334689162817` consumido por el backend
  vía usuario IAM `lerida-comercio-app` (claves gestionadas en Terraform).

### Redeploy (tras nuevas imágenes)

```bash
# 1. build + push (en la máquina dev)
docker buildx build --platform linux/arm64 --builder leridabuilder \
  -t 334689162817.dkr.ecr.us-east-1.amazonaws.com/lerida-comercio:<tag> --push <ctx>
# 2. en el EC2
ssh -i ~/.ssh/lerida-comercio.pem ubuntu@34.235.36.96 \
  'cd lerida-comercio && docker compose pull && docker compose up -d'
```

### Notas

- El backend Go (heredado de probability) exige variables RabbitMQ/Redis/
  WhatsApp; se arranca con `RELAX_ENV=1` porque este proyecto no las usa.
- Dockerfiles actualizados: Go 1.24, Node 22, `pnpm@10.33.0` pin, copia del
  módulo `back/models` y de `pnpm-workspace.yaml`.
- El healthcheck del contenedor backend apunta a `/health` (HEAD) que el router
  responde 404 — la app funciona; el healthcheck queda como cosmético.
