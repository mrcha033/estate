
resource "aws_secretsmanager_secret" "rds_password" {
  name        = "estate/rds/password"
  description = "RDS database password for estate application"
}

resource "aws_secretsmanager_secret_version" "rds_password_version" {
  secret_id     = aws_secretsmanager_secret.rds_password.id
  secret_string = var.db_password
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name        = "estate/jwt/secret"
  description = "JWT secret for token signing"
}

resource "aws_secretsmanager_secret_version" "jwt_secret_version" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = var.jwt_secret
}

resource "aws_secretsmanager_secret" "aws_ses_access_key_id" {
  name        = "estate/ses/access_key_id"
  description = "AWS SES Access Key ID"
}

resource "aws_secretsmanager_secret_version" "aws_ses_access_key_id_version" {
  secret_id     = aws_secretsmanager_secret.aws_ses_access_key_id.id
  secret_string = var.aws_ses_access_key_id
}

resource "aws_secretsmanager_secret" "aws_ses_secret_access_key" {
  name        = "estate/ses/secret_access_key"
  description = "AWS SES Secret Access Key"
}

resource "aws_secretsmanager_secret_version" "aws_ses_secret_access_key_version" {
  secret_id     = aws_secretsmanager_secret.aws_ses_secret_access_key.id
  secret_string = var.aws_ses_secret_access_key
}

resource "aws_secretsmanager_secret" "segment_write_key" {
  name        = "estate/segment/write_key"
  description = "Segment Write Key"
}

resource "aws_secretsmanager_secret_version" "segment_write_key_version" {
  secret_id     = aws_secretsmanager_secret.segment_write_key.id
  secret_string = var.segment_write_key
}

resource "aws_db_instance" "main" {
  allocated_storage    = 20
  db_name              = "estate_db"
  engine               = "postgres"
  engine_version       = "14.18"
  instance_class       = "db.t3.micro"
  username             = "postgres"
  password             = aws_secretsmanager_secret_version.rds_password_version.secret_string
  parameter_group_name = "default.postgres14"
  skip_final_snapshot  = true
  publicly_accessible  = true
  identifier           = "estate-db"
}
