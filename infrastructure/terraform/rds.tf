
resource "aws_db_instance" "main" {
  allocated_storage    = 20
  db_name              = "estate_db"
  engine               = "postgres"
  engine_version       = "14.9"
  instance_class       = "db.t3.micro"
  username             = "postgres"
  password             = "password" # Replace with a secure password or use secrets manager
  parameter_group_name = "default.postgres14"
  skip_final_snapshot  = true
}
