
resource "aws_eks_cluster" "main" {
  name     = "estate-eks-cluster"
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids = [
      "subnet-0f650ce1d67e32eb3"
      "subnet-0be07a7fe9a774a89"
      "subnet-0a756f2a76bd8bbf0"
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
