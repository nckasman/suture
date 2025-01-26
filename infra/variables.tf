variable "google_project_id" {
    description = "Google Cloud Project ID"
    type        = string
}

variable "aws_region" {
    type        = string
    description = "AWS Region"
    default     = "us-east-1"
}

variable "environment" {
    description = "Environment (dev/staging/prod)"
    type        = string
    default     = "dev"
}
