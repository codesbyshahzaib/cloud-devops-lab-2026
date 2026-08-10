resource "aws_iam_role" "app_server_role" {
  name = "app-server-iam-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Attach S3 Access
resource "aws_iam_role_policy_attachment" "s3_access" {
  role       = aws_iam_role.app_server_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

# Attach CloudWatch Access
resource "aws_iam_role_policy_attachment" "cloudwatch_access" {
  role       = aws_iam_role.app_server_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# Create Instance Profile to wrap the role
resource "aws_iam_instance_profile" "app_server_profile" {
  name = "app-server-instance-profile"
  role = aws_iam_role.app_server_role.name
}
