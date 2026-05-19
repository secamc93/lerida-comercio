# Infraestructura como Código — Terraform (Lérida Comercio)

Gestiona la infraestructura AWS del proyecto. Cuenta `334689162817`,
región `us-east-1`, perfil de AWS CLI `default`.

## Estructura

```
terraform/
├── main.tf         # Provider AWS + default_tags
├── variables.tf    # Variables de entrada
├── data.tf         # VPC/subnet por defecto + AMI Ubuntu 24.04 ARM64
├── backend.tf      # Estado local (S3 remoto opcional, comentado)
├── s3.tf           # Bucket de almacenamiento de la app
├── ecr.tf          # Repositorio ECR privado + lifecycle policy
├── iam.tf          # IAM Role + Instance Profile (pull desde ECR)
├── ec2.tf          # Security Group + EC2 t4g.small + Elastic IP
├── outputs.tf      # Outputs (IP, DNS, URLs, comando SSH)
└── user-data.sh    # Bootstrap del EC2 (Docker + Compose + AWS CLI)
```

## Uso

```bash
cd infra/terraform
export AWS_PROFILE=default
terraform init
terraform plan
terraform apply
```

## Recursos gestionados

| Recurso | Detalle |
|---|---|
| `aws_s3_bucket.storage` | `lerida-comercio-storage-334689162817`, versioning, sin acceso público |
| `aws_ecr_repository.main` | `lerida-comercio` — repo privado único, imágenes por tag |
| `aws_security_group.main` | `lerida-comercio-sg` — inbound 22/80/443 |
| `aws_instance.main` | `t4g.small` ARM (2 GB), Ubuntu 24.04 ARM64, 20 GB gp3 |
| `aws_eip.main` | IP elástica asociada al EC2 |
| `aws_iam_role.ec2_ecr` | Rol + instance profile para pull desde ECR sin claves |

> El **key pair** (`lerida-comercio` → `~/.ssh/lerida-comercio.pem`) se creó
> fuera de Terraform y se referencia por nombre (`var.key_name`). No se gestiona
> aquí para no exponer material de clave en el state.

## Notas

- **Estado**: local (`terraform.tfstate`, gitignored). Para backend remoto en S3
  ver `backend.tf`.
- **Importación**: los recursos se crearon inicialmente con AWS CLI y luego se
  importaron al state (`terraform import`). `terraform plan` no muestra drift.
- `lifecycle.ignore_changes = [ami, user_data]` en el EC2 evita recrear la
  instancia si cambia la AMI más reciente o el script de bootstrap.
