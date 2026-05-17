variable "region" {
  type    = string
  default = "us-east-1"
}

variable "name" {
  type    = string
  default = "cas-overlay"
}

variable "image" {
  type = string
}

variable "image_repository_type" {
  type        = string
  default     = "ECR_PUBLIC"
  description = "Use ECR, ECR_PUBLIC, or another value supported by App Runner for your image source."
}

variable "container_port" {
  type    = number
  default = 8080
}

variable "cas_server_name" {
  type = string
}

variable "cas_context_path" {
  type    = string
  default = "/cas"
}

variable "spring_profiles_active" {
  type    = string
  default = "default"
}

variable "cpu" {
  type    = string
  default = "1024"
}

variable "memory" {
  type    = string
  default = "2048"
}

variable "auto_deployments_enabled" {
  type    = bool
  default = false
}

variable "health_check_path" {
  type    = string
  default = "/cas/actuator/health"
}
