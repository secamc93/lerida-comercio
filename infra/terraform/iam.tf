# IAM Role + Instance Profile para que el EC2 haga pull de imágenes desde
# ECR privado sin necesidad de claves de acceso.

resource "aws_iam_role" "ec2_ecr" {
  name = "${var.project}-ec2-ecr"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

# Permite leer (pull) de cualquier repositorio ECR de la cuenta.
resource "aws_iam_role_policy_attachment" "ecr_readonly" {
  role       = aws_iam_role.ec2_ecr.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ec2_ecr" {
  name = "${var.project}-ec2-ecr"
  role = aws_iam_role.ec2_ecr.name
}

# Usuario de aplicación: credenciales S3 que consume el backend Go.
resource "aws_iam_user" "app" {
  name = "${var.project}-app"
}

resource "aws_iam_user_policy" "app_s3" {
  name = "${var.project}-s3-access"
  user = aws_iam_user.app.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ]
      Resource = [
        aws_s3_bucket.storage.arn,
        "${aws_s3_bucket.storage.arn}/*"
      ]
    }]
  })
}

resource "aws_iam_access_key" "app" {
  user = aws_iam_user.app.name
}
