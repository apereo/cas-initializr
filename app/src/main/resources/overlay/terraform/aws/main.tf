terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

resource "aws_apprunner_service" "cas" {
  service_name = var.name

  source_configuration {
    auto_deployments_enabled = var.auto_deployments_enabled

    image_repository {
      image_identifier      = var.image
      image_repository_type = var.image_repository_type

      image_configuration {
        port = tostring(var.container_port)

        runtime_environment_variables = {
          CAS_SERVER_NAME                 = var.cas_server_name
          CAS_SERVER_SERVLET_CONTEXT_PATH = var.cas_context_path
          SPRING_PROFILES_ACTIVE          = var.spring_profiles_active
        }
      }
    }
  }

  instance_configuration {
    cpu    = var.cpu
    memory = var.memory
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = var.health_check_path
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }
}
