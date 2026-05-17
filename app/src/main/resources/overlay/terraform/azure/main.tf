terraform {
  required_version = ">= 1.7.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

resource "azurerm_resource_group" "cas" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_log_analytics_workspace" "cas" {
  name                = "${var.name}-logs"
  location            = azurerm_resource_group.cas.location
  resource_group_name = azurerm_resource_group.cas.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_container_app_environment" "cas" {
  name                       = "${var.name}-env"
  location                   = azurerm_resource_group.cas.location
  resource_group_name        = azurerm_resource_group.cas.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.cas.id
}

resource "azurerm_container_app" "cas" {
  name                         = var.name
  container_app_environment_id = azurerm_container_app_environment.cas.id
  resource_group_name          = azurerm_resource_group.cas.name
  revision_mode                = "Single"

  ingress {
    external_enabled = var.public
    target_port      = var.container_port

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    container {
      name   = "cas"
      image  = var.image
      cpu    = var.cpu
      memory = var.memory

      env {
        name  = "CAS_SERVER_NAME"
        value = var.cas_server_name
      }

      env {
        name  = "CAS_SERVER_SERVLET_CONTEXT_PATH"
        value = var.cas_context_path
      }

      env {
        name  = "SPRING_PROFILES_ACTIVE"
        value = var.spring_profiles_active
      }
    }
  }
}
