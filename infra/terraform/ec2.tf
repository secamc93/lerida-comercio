# Security Group, instancia EC2 y Elastic IP

resource "aws_security_group" "main" {
  name        = "${var.project}-sg"
  description = "Lerida Comercio - SSH/HTTP/HTTPS"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_cidr]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Salida abierta"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project}-sg"
  }
}

# Bootstrap: instala Docker + Compose + AWS CLI v2 al primer arranque.
locals {
  user_data = file("${path.module}/user-data.sh")
}

resource "aws_instance" "main" {
  ami                    = data.aws_ssm_parameter.ubuntu_2404_arm64.value
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = data.aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.main.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_ecr.name
  user_data              = local.user_data

  root_block_device {
    volume_size = var.root_volume_size
    volume_type = "gp3"
  }

  tags = {
    Name = var.project
  }

  # La AMI y el user_data se ignoran para no recrear la instancia ya existente.
  lifecycle {
    ignore_changes = [ami, user_data]
  }
}

resource "aws_eip" "main" {
  instance = aws_instance.main.id
  domain   = "vpc"

  tags = {
    Name = var.project
  }
}
