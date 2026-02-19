data "aws_route53_zone" "main" {
  name         = var.hosted_zone_name
  private_zone = false
}