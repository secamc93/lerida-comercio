# Repositorio ECR privado único. Las imágenes de cada servicio se distinguen
# por tag (backend, frontend, nginx).

resource "aws_ecr_repository" "main" {
  name                 = var.project
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name = var.project
  }
}

# Conserva las últimas N imágenes, elimina las más viejas.
resource "aws_ecr_lifecycle_policy" "main" {
  repository = aws_ecr_repository.main.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Conservar las últimas ${var.ecr_image_retention_count} imágenes"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = var.ecr_image_retention_count
      }
      action = { type = "expire" }
    }]
  })
}
