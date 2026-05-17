terraform {
  required_version = ">= 1.7.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_project_service" "run" {
  project = var.project_id
  service = "run.googleapis.com"
}

resource "google_cloud_run_v2_service" "cas" {
  name     = var.name
  location = var.region

  deletion_protection = false

  template {
    service_account = var.service_account_email

    containers {
      image = var.image

      ports {
        container_port = var.container_port
      }

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

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
      }
    }

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }
  }

  depends_on = [google_project_service.run]
}

resource "google_cloud_run_v2_service_iam_member" "public" {
  count    = var.public ? 1 : 0
  project  = var.project_id
  location = google_cloud_run_v2_service.cas.location
  name     = google_cloud_run_v2_service.cas.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
