# Variables de Terraform - Lérida Comercio

variable "aws_region" {
  description = "Región de AWS donde se despliegan los recursos"
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "Perfil de AWS CLI a usar (cuenta 334689162817)"
  type        = string
  default     = "default"
}

variable "project" {
  description = "Nombre del proyecto, prefijo de los recursos"
  type        = string
  default     = "lerida-comercio"
}

variable "instance_type" {
  description = "Tipo de instancia EC2 (ARM Graviton, 2 GB RAM)"
  type        = string
  default     = "t4g.small"
}

variable "root_volume_size" {
  description = "Tamaño del disco raíz EBS en GB"
  type        = number
  default     = 20
}

variable "key_name" {
  description = "Nombre del key pair de EC2 (creado fuera de Terraform)"
  type        = string
  default     = "lerida-comercio"
}

variable "ssh_cidr" {
  description = "CIDR permitido para SSH (22). 0.0.0.0/0 = abierto"
  type        = string
  default     = "0.0.0.0/0"
}

variable "ecr_image_retention_count" {
  description = "Número de imágenes a mantener en ECR (lifecycle policy)"
  type        = number
  default     = 10
}

variable "tags" {
  description = "Tags comunes para todos los recursos"
  type        = map(string)
  default = {
    Project     = "lerida-comercio"
    ManagedBy   = "terraform"
    Environment = "production"
  }
}
