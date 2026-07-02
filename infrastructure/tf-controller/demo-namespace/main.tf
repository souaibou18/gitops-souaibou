terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
  }
}

provider "kubernetes" {
  host                   = "https://kubernetes.default.svc"
  token                  = file("/var/run/secrets/kubernetes.io/serviceaccount/token")
  cluster_ca_certificate = file("/var/run/secrets/kubernetes.io/serviceaccount/ca.crt")
}

resource "kubernetes_namespace" "gitops_iac" {
  metadata {
    name = "gitops-iac"
    labels = {
      managed-by = "tofu-controller"
      project    = "fil-rouge"
    }
  }
}