
resource "aws_s3_bucket" "main" {
  bucket = "estate-app-bucket"

  tags = {
    Environment = "development"
  }
}

resource "aws_s3_bucket_acl" "main_acl" {
  bucket = aws_s3_bucket.main.id
  acl    = "private"
}
