# Deploy y CI/CD

## Cuenta AWS

Todo el proyecto vive en la cuenta **334689162817** (perfil AWS CLI `default`,
región `us-east-1`). NO es la cuenta del perfil `probability` (476702565908).
Infra gestionada con Terraform en `infra/terraform/`.

## Workflows

Un workflow por servicio en `.github/workflows/`. Cada uno se dispara por push
a `main` (o `workflow_dispatch`) solo cuando cambian archivos de su carpeta.
Flujo: **test → build ARM64 → push a ECR → SSH al EC2 → docker compose up**.

| Workflow | Paths que lo disparan | Imagen ECR (tag) |
|----------|-----------------------|------------------|
| backend-ci  | `back/central/**`, `back/migration/**`, `back/models/**` | `:backend`, `:migration` |
| frontend-ci | `front/central/**` | `:frontend` |
| nginx-ci    | `infra/nginx/**` | `:nginx` |

Repo ECR único: `334689162817.dkr.ecr.us-east-1.amazonaws.com/lerida-comercio`.

## Autenticación

- **AWS**: OIDC, sin claves estáticas. Los workflows asumen el rol
  `lerida-comercio-github-actions` (definido en `infra/terraform/github-oidc.tf`).
- **SSH al EC2**: secret `EC2_SSH_KEY` (contenido de `~/.ssh/lerida-comercio.pem`).
  Configurar con: `gh secret set EC2_SSH_KEY < ~/.ssh/lerida-comercio.pem`.

## EC2

- Host: `34.235.36.96` (Elastic IP) · DNS `ec2-34-235-36-96.compute-1.amazonaws.com`
- Stack en `/home/ubuntu/lerida-comercio/` (`docker-compose.yml` + `.env`).
- El `.env` con secretos vive solo en el EC2, no en el repo.
- El EC2 hace pull de ECR vía su IAM instance profile.

## Deploy manual

```bash
# Reconstruir y subir una imagen (máquina dev, buildx ARM64)
docker buildx build --platform linux/arm64 --builder leridabuilder \
  -t 334689162817.dkr.ecr.us-east-1.amazonaws.com/lerida-comercio:<tag> --push <contexto>

# Aplicar en el EC2
ssh -i ~/.ssh/lerida-comercio.pem ubuntu@34.235.36.96 \
  'cd lerida-comercio && docker compose pull && docker compose up -d'
```

## Troubleshooting

- **Backend reinicia**: faltan env vars. Corre con `RELAX_ENV=1`; revisar
  `docker logs lerida-back`.
- **502 en nginx**: `docker restart lerida-nginx` (cachea IPs de upstreams).
- **Sitio caído**: ¿contenedores arriba? `docker compose ps`. ¿Security group
  con 80 abierto? ¿EIP asociada?
