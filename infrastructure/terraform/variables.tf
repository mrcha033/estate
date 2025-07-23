variable "db_password" {
  description = "Database password for RDS instance"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret for token signing"
  type        = string
  sensitive   = true
}

variable "aws_ses_access_key_id" {
  description = "AWS SES Access Key ID"
  type        = string
  sensitive   = true
}

variable "aws_ses_secret_access_key" {
  description = "AWS SES Secret Access Key"
  type        = string
  sensitive   = true
}

variable "segment_write_key" {
  description = "Segment Write Key"
  type        = string
  sensitive   = true
}

variable "openai_api_key" {
  description = "OpenAI API Key for AI services"
  type        = string
  sensitive   = true
}

variable "kreb_api_key" {
  description = "KREB API Key for real estate data"
  type        = string
  sensitive   = true
}