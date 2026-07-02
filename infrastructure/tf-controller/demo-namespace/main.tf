terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
  }
}

provider "kubernetes" {
  config_path = "/tmp/kubeconfig"
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
