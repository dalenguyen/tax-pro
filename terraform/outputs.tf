output "cloud_run_url" {
  description = "Public URL of the Cloud Run service"
  value       = google_cloud_run_v2_service.web.uri
}

output "receipts_bucket" {
  description = "Name of the GCS receipts bucket"
  value       = google_storage_bucket.receipts.name
}

output "artifact_registry_repo" {
  description = "Artifact Registry repository for Docker images"
  value       = "${var.ar_region}-docker.pkg.dev/${var.project_id}/can-tax-pro"
}

output "service_account_email" {
  description = "Cloud Run service account email"
  value       = google_service_account.app.email
}
