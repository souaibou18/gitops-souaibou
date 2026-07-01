resource "kubernetes_namespace" "demo_iac" {
  metadata {
    name = "demo-iac"
    labels = {
      managed-by = "terraform"
      project    = "gitops-fil-rouge"
    }
  }
}
