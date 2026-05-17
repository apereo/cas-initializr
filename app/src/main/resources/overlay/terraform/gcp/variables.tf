variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "name" {
  type    = string
  default = "cas-overlay"
}

variable "image" {
  type = string
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
  default = "1"
}

variable "memory" {
  type    = string
  default = "2Gi"
}

variable "min_instances" {
  type    = number
  default = 0
}

variable "max_instances" {
  type    = number
  default = 3
}

variable "public" {
  type    = bool
  default = true
}

variable "service_account_email" {
  type    = string
  default = null
}
