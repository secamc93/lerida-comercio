# DNS del dominio leridacomercio.com (hosted zone creada al registrar el dominio).

data "aws_route53_zone" "main" {
  name = "leridacomercio.com."
}

# Apex → EC2
resource "aws_route53_record" "apex" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "leridacomercio.com"
  type    = "A"
  ttl     = 300
  records = [aws_eip.main.public_ip]
}

# www → EC2
resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "www.leridacomercio.com"
  type    = "A"
  ttl     = 300
  records = [aws_eip.main.public_ip]
}
