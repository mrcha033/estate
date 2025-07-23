
# AWS Secrets Manager resources moved to secrets-manager.tf

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
