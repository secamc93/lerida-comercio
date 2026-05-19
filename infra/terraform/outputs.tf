# Outputs - Lérida Comercio

output "s3_bucket" {
  description = "Bucket S3 de almacenamiento de la app"
  value       = aws_s3_bucket.storage.bucket
}

output "ecr_repository_url" {
  description = "URL del repositorio ECR privado"
  value       = aws_ecr_repository.main.repository_url
}

output "ec2_instance_id" {
  description = "ID de la instancia EC2"
  value       = aws_instance.main.id
}

output "elastic_ip" {
  description = "IP elástica pública del EC2"
  value       = aws_eip.main.public_ip
}

output "public_dns" {
  description = "Dominio genérico (DNS público) del EC2"
  value       = aws_eip.main.public_dns
}

output "ssh_command" {
  description = "Comando para conectarse por SSH"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${aws_eip.main.public_ip}"
}

output "app_s3_access_key_id" {
  description = "Access Key ID del usuario IAM de la app (S3)"
  value       = aws_iam_access_key.app.id
}

output "app_s3_secret_access_key" {
  description = "Secret Access Key del usuario IAM de la app (S3)"
  value       = aws_iam_access_key.app.secret
  sensitive   = true
}
