# Bucket S3 de almacenamiento de la aplicación (uploads, assets)

resource "aws_s3_bucket" "storage" {
  bucket = "${var.project}-storage-334689162817"

  tags = {
    Name = "${var.project}-storage"
  }
}

resource "aws_s3_bucket_versioning" "storage" {
  bucket = aws_s3_bucket.storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "storage" {
  bucket                  = aws_s3_bucket.storage.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
