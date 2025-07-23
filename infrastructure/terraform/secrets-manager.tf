# AWS Secrets Manager Resources

# Database password secret
resource "aws_secretsmanager_secret" "rds_password" {
  name                    = "estate/rds/password"
  description             = "RDS database password for estate application"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "rds_password_version" {
  secret_id     = aws_secretsmanager_secret.rds_password.id
  secret_string = var.db_password
}

# JWT secret
resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "estate/jwt/secret"
  description             = "JWT secret for token signing"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "jwt_secret_version" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = var.jwt_secret
}

# AWS SES credentials
resource "aws_secretsmanager_secret" "aws_ses_access_key_id" {
  name                    = "estate/ses/access_key_id"
  description             = "AWS SES Access Key ID"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "aws_ses_access_key_id_version" {
  secret_id     = aws_secretsmanager_secret.aws_ses_access_key_id.id
  secret_string = var.aws_ses_access_key_id
}

resource "aws_secretsmanager_secret" "aws_ses_secret_access_key" {
  name                    = "estate/ses/secret_access_key"
  description             = "AWS SES Secret Access Key"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "aws_ses_secret_access_key_version" {
  secret_id     = aws_secretsmanager_secret.aws_ses_secret_access_key.id
  secret_string = var.aws_ses_secret_access_key
}

# Segment write key
resource "aws_secretsmanager_secret" "segment_write_key" {
  name                    = "estate/segment/write_key"
  description             = "Segment Write Key"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "segment_write_key_version" {
  secret_id     = aws_secretsmanager_secret.segment_write_key.id
  secret_string = var.segment_write_key
}

# OPENAI API Key secret (for AI and ETL services)
resource "aws_secretsmanager_secret" "openai_api_key" {
  name                    = "estate/openai/api_key"
  description             = "OpenAI API Key for AI services"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "openai_api_key_version" {
  secret_id     = aws_secretsmanager_secret.openai_api_key.id
  secret_string = var.openai_api_key
}

# KREB API Key secret (for ETL services)
resource "aws_secretsmanager_secret" "kreb_api_key" {
  name                    = "estate/kreb/api_key"
  description             = "KREB API Key for real estate data"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "kreb_api_key_version" {
  secret_id     = aws_secretsmanager_secret.kreb_api_key.id
  secret_string = var.kreb_api_key
}

# Database URL (constructed from RDS instance details)
resource "aws_secretsmanager_secret" "database_url" {
  name                    = "estate/database/url"
  description             = "Complete database URL for application connections"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "database_url_version" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = "postgresql://${aws_db_instance.main.username}:${aws_secretsmanager_secret_version.rds_password_version.secret_string}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}"
}

# IAM policy for EKS services to access secrets
resource "aws_iam_policy" "secrets_manager_access" {
  name        = "estate-secrets-manager-access"
  description = "Policy to allow EKS services to access AWS Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.rds_password.arn,
          aws_secretsmanager_secret.jwt_secret.arn,
          aws_secretsmanager_secret.aws_ses_access_key_id.arn,
          aws_secretsmanager_secret.aws_ses_secret_access_key.arn,
          aws_secretsmanager_secret.segment_write_key.arn,
          aws_secretsmanager_secret.openai_api_key.arn,
          aws_secretsmanager_secret.kreb_api_key.arn,
          aws_secretsmanager_secret.database_url.arn
        ]
      }
    ]
  })
}

# Attach the policy to the EKS node group role
resource "aws_iam_role_policy_attachment" "secrets_manager_access" {
  role       = aws_iam_role.eks_node_group.name
  policy_arn = aws_iam_policy.secrets_manager_access.arn
}

# Output the secret ARNs for reference
output "secret_arns" {
  description = "ARNs of all secrets created"
  value = {
    rds_password              = aws_secretsmanager_secret.rds_password.arn
    jwt_secret                = aws_secretsmanager_secret.jwt_secret.arn
    aws_ses_access_key_id     = aws_secretsmanager_secret.aws_ses_access_key_id.arn
    aws_ses_secret_access_key = aws_secretsmanager_secret.aws_ses_secret_access_key.arn
    segment_write_key         = aws_secretsmanager_secret.segment_write_key.arn
    openai_api_key            = aws_secretsmanager_secret.openai_api_key.arn
    kreb_api_key              = aws_secretsmanager_secret.kreb_api_key.arn
    database_url              = aws_secretsmanager_secret.database_url.arn
  }
  sensitive = true
}