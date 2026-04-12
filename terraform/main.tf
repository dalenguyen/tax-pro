terraform {
  required_version = ">= 1.7"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ── Enable APIs ──────────────────────────────────────────────────────────────
locals {
  required_apis = [
    "firestore.googleapis.com",
    "storage.googleapis.com",
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "secretmanager.googleapis.com",
    "aiplatform.googleapis.com",
  ]
}

resource "google_project_service" "apis" {
  for_each           = toset(local.required_apis)
  service            = each.value
  disable_on_destroy = false
}

# ── Firestore ─────────────────────────────────────────────────────────────────
resource "google_firestore_database" "default" {
  project                     = var.project_id
  name                        = "(default)"
  location_id                 = var.region
  type                        = "FIRESTORE_NATIVE"
  delete_protection_state     = "DELETE_PROTECTION_ENABLED"
  deletion_policy             = "DELETE"
  depends_on                  = [google_project_service.apis]
}

# ── Cloud Storage (receipts) ──────────────────────────────────────────────────
resource "google_storage_bucket" "receipts" {
  name          = "${var.project_id}-receipts"
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  lifecycle_rule {
    condition { age = 2555 } # 7 years ≈ 2555 days (CRA requirement)
    action    { type = "Delete" }
  }

  depends_on = [google_project_service.apis]
}

# ── Service Account ───────────────────────────────────────────────────────────
resource "google_service_account" "app" {
  account_id   = "can-tax-pro-app"
  display_name = "can-tax-pro Cloud Run service account"
}

resource "google_project_iam_member" "app_datastore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.app.email}"
}

resource "google_project_iam_member" "app_storage" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.app.email}"
}

resource "google_project_iam_member" "app_aiplatform" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.app.email}"
}

resource "google_project_iam_member" "app_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.app.email}"
}

# ── Secret Manager (Firebase service account) ─────────────────────────────────
resource "google_secret_manager_secret" "firebase_sa" {
  secret_id = "firebase-service-account"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

# ── Artifact Registry ─────────────────────────────────────────────────────────
resource "google_artifact_registry_repository" "app" {
  location      = var.ar_region
  repository_id = "can-tax-pro"
  format        = "DOCKER"
  depends_on    = [google_project_service.apis]
}

# ── Cloud Run ─────────────────────────────────────────────────────────────────
resource "google_cloud_run_v2_service" "web" {
  name     = "can-tax-pro-web"
  location = var.region

  deletion_protection = false

  template {
    service_account = google_service_account.app.email

    containers {
      image = "${var.ar_region}-docker.pkg.dev/${var.project_id}/can-tax-pro/web:latest"

      ports {
        container_port = 8080
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "GCS_BUCKET"
        value = google_storage_bucket.receipts.name
      }

      env {
        name = "FIREBASE_SERVICE_ACCOUNT"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.firebase_sa.secret_id
            version = "latest"
          }
        }
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }
  }

  depends_on = [
    google_project_service.apis,
    google_service_account.app,
    google_artifact_registry_repository.app,
  ]
}

# Allow unauthenticated access (auth handled in-app via Firebase Auth)
resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.web.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ── Cloud Build trigger (push to main) ────────────────────────────────────────
resource "google_cloudbuild_trigger" "main" {
  name     = "can-tax-pro-push-main"
  location = var.region

  github {
    owner = "dalenguyen"
    name  = "tax-pro"
    push {
      branch = "^main$"
    }
  }

  filename = "cloudbuild.yaml"

  service_account = "projects/${var.project_id}/serviceAccounts/${google_service_account.app.email}"

  depends_on = [google_project_service.apis]
}
