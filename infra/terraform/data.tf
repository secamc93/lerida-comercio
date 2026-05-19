# Data sources: red por defecto y AMI de Ubuntu

data "aws_vpc" "default" {
  default = true
}

# Subnet pública usada por el EC2 (us-east-1a)
data "aws_subnet" "public" {
  id = "subnet-0625e4a9773b81502"
}

# Última AMI oficial de Ubuntu 24.04 LTS ARM64
data "aws_ssm_parameter" "ubuntu_2404_arm64" {
  name = "/aws/service/canonical/ubuntu/server/24.04/stable/current/arm64/hvm/ebs-gp3/ami-id"
}
