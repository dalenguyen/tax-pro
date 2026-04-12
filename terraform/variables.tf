variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "Primary GCP region"
  type        = string
  default     = "northamerica-northeast2"
}

variable "ar_region" {
  description = "Artifact Registry region"
  type        = string
  default     = "northamerica-northeast1"
}

variable "firebase_service_account_json" {
  description = "Firebase Admin SDK service account JSON (stored in Secret Manager)"
  type        = string
  sensitive   = true
  default     = ""
}
