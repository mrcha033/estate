
resource "aws_eks_cluster" "main" {
  name     = "estate-eks-cluster"
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids = [
      "subnet-xxxxxxxxxxxxxxxxx", # Replace with actual subnet IDs
      "subnet-yyyyyyyyyyyyyyyyy"
    ]
  }
}

resource "aws_iam_role" "eks_cluster" {
  name = "estate-eks-cluster-role"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })
}
