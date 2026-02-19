variable "domain_name" {
  description = "The domain name for the website"
  type        = string
  default     = "cognito-scopes.demos.jesusrugama.com"
}

variable "hosted_zone_name" {
  description = "The Route53 hosted zone name"
  type        = string
  default     = "jesusrugama.com"
}

variable "bucket_name" {
  description = "The S3 bucket name"
  type        = string
  default     = "jesusrugama.demos.cognito-scopes"
}