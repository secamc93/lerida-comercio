# Estado de Terraform: backend remoto en S3 (versionado + cifrado).
terraform {
  backend "s3" {
    bucket  = "lerida-comercio-tfstate-334689162817"
    key     = "lerida-comercio/terraform.tfstate"
    region  = "us-east-1"
    profile = "default"
    encrypt = true
  }
}
