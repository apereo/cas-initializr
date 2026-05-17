variable "subscription_id" {
  type = string
}

variable "location" {
  type    = string
  default = "eastus"
}

variable "resource_group_name" {
  type    = string
  default = "rg-cas-overlay"
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
  type    = number
  default = 1.0
}

variable "memory" {
  type    = string
  default = "2Gi"
}

variable "min_replicas" {
  type    = number
  default = 0
}

variable "max_replicas" {
  type    = number
  default = 3
}

variable "public" {
  type    = bool
  default = true
}
