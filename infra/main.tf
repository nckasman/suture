provider "aws" {
  region = "us-east-1"
}

provider "google" {
  project = var.google_project_id
  region  = "us-east1"
}

# Enable Speech-to-Text API
resource "google_project_service" "speech" {
  service = "speech.googleapis.com"
  disable_on_destroy = false
}

# AWS Resources
resource "aws_s3_bucket" "video_store" {
  bucket = "video-store-demo-2025"
  force_destroy = true
}

resource "aws_s3_bucket_cors_configuration" "video_store" {
  bucket = aws_s3_bucket.video_store.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

# Dynamo DB tables
resource "aws_dynamodb_table" "projects" {
  name           = "projects-demo"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  global_secondary_index {
    name               = "user_id-index"
    hash_key           = "user_id"
    projection_type    = "ALL"
  }
}

resource "aws_dynamodb_table" "versions" {
  name           = "versions-demo"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "project_id"  
    type = "S"
  }

  global_secondary_index {
    name               = "project_id-index"
    hash_key           = "project_id"
    projection_type    = "ALL"
  }
}

resource "aws_key_pair" "deployer" {
  key_name   = "video-app-key"
  public_key = file("~/.ssh/id_ed25519.pub")
}

resource "aws_instance" "app_server" {
  ami           = "ami-00d9a6d7d54864374"
  instance_type = "c6g.4xlarge"
  key_name      = aws_key_pair.deployer.key_name
  
  # Security group to allow SSH and HTTP
  vpc_security_group_ids = [aws_security_group.allow_web.id]

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y docker
              systemctl start docker
              systemctl enable docker
              EOF

  tags = {
    Name = "VideoProcessingServer"
  }
}

resource "aws_security_group" "allow_web" {
  name        = "allow_web"
  description = "Allow SSH and HTTP inbound traffic"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
# Outputs
output "ec2_public_ip" {
  value = aws_instance.app_server.public_ip
}

output "s3_bucket_name" {
  value = aws_s3_bucket.video_store.id
}
