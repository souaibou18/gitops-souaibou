# Projet Fil Rouge - GitOps Todo API

## Objectif

Ce projet met en place une plateforme GitOps complète autour d’une application `todo-api`.

Le but est de démontrer un workflow DevOps moderne :

- Kubernetes local avec Minikube
- Déploiement GitOps avec Argo CD
- Environnements dev/prod avec Kustomize
- CI/CD avec GitHub Actions
- Déploiements progressifs avec Argo Rollouts
- Rollback GitOps
- Infrastructure as Code avec Terraform
- Monitoring avec Prometheus et Grafana

## Architecture

```text
GitHub
  ↓
GitHub Actions
  ↓
Repo GitOps
  ↓
Argo CD
  ↓
Argo Rollouts
  ↓
Kubernetes / Minikube
  ↓
todo-api dev / prod

Terraform → Namespace demo-iac
Prometheus → Collecte des métriques
Grafana → Visualisation

Structure du repository
gitops-souaibou/
├── apps/
│   └── todo-api/
│       ├── base/
│       │   ├── rollout.yaml
│       │   ├── service.yaml
│       │   └── kustomization.yaml
│       └── overlays/
│           ├── dev/
│           └── prod/
├── argocd/
│   └── applications/
├── infrastructure/
│   └── terraform/
├── .github/
│   └── workflows/
└── README.md


Déploiement Argo CD
kubectl get applications -n argocd
argocd app get todo-api-dev
argocd app get todo-api-prod
Environnements
Dev
Namespace : todo-api-dev
Nombre de replicas : 1
kubectl get all -n todo-api-dev
Prod
Namespace : todo-api-prod
Nombre de replicas : 3
Déploiement progressif via Argo Rollouts
kubectl get all -n todo-api-prod
Argo Rollouts - Canary

Le Deployment Kubernetes classique a été remplacé par un Rollout.

Stratégie Canary :

20% → pause → 50% → pause → 100%

Commande de vérification :

kubectl argo rollouts get rollout todo-api-prod -n todo-api-prod
Rollback GitOps

Le rollback a été testé avec succès :

nginx:latest → nginx:1.25 → nginx:latest

Dans une approche GitOps, Git reste la source de vérité.
Le rollback propre se fait donc avec :

git revert <commit>
git push origin main
argocd app sync todo-api-prod
GitHub Actions

Un workflow GitHub Actions permet de mettre à jour automatiquement le tag d’image dans le repo GitOps.

Workflow :

Manual trigger → modification du tag image → commit automatique → push → Argo CD sync
Infrastructure as Code

Terraform est utilisé pour créer une ressource Kubernetes.

Exemple :

cd infrastructure/terraform
terraform init
terraform plan
terraform apply

Ressource créée :

kubectl get namespace demo-iac
Monitoring

Prometheus et Grafana ont été installés dans le namespace monitoring.

Vérification :

kubectl get pods -n monitoring

Accès Grafana :

kubectl port-forward svc/grafana 3000:80 -n monitoring

URL :

http://localhost:3000

Accès Prometheus :

kubectl port-forward svc/prometheus-server 9090:80 -n monitoring

URL :

http://localhost:9090
Commandes de démonstration
argocd app get todo-api-dev
argocd app get todo-api-prod
kubectl get all -n todo-api-prod
kubectl argo rollouts get rollout todo-api-prod -n todo-api-prod
kubectl get namespace demo-iac
kubectl get pods -n monitoring
Résultat final

Le projet démontre :

un déploiement GitOps complet ;
une séparation dev/prod ;
une stratégie Canary ;
un rollback GitOps ;
une ressource gérée par Terraform ;
une stack de monitoring Prometheus/Grafana.

## Ingress NGINX

L'application `todo-api-prod` est exposée via un Ingress NGINX.

Vérification :

```bash
kubectl get ingress -n todo-api-prod

Test local :
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8081:80
curl -H "Host: todo.local" http://localhost:8081

Horizontal Pod Autoscaler

Un HPA est configuré sur le Rollout de production.
kubectl get hpa -n todo-api-prod
kubectl top pods -n todo-api-prod

Configuration :
minReplicas: 3
maxReplicas: 8
targetCPU: 60%

Secrets Kubernetes

Un Secret Kubernetes est utilisé pour injecter la variable DATABASE_URL dans le Rollout.
kubectl get secret -n todo-api-prod
kubectl describe rollout todo-api-prod -n todo-api-prod | grep -A5 DATABASE_URL
Le Secret est utilisé via secretKeyRef.

NetworkPolicy

Une NetworkPolicy sécurise le trafic entrant vers les pods todo-api.

kubectl get networkpolicy -n todo-api-prod
kubectl describe networkpolicy todo-api-network-policy-prod -n todo-api-prod
Test après application :

curl -H "Host: todo.local" http://localhost:8081

Commandes de démonstration finale
argocd app get todo-api-dev
argocd app get todo-api-prod

kubectl get all -n todo-api-prod
kubectl argo rollouts get rollout todo-api-prod -n todo-api-prod

kubectl get ingress -n todo-api-prod
curl -H "Host: todo.local" http://localhost:8081

kubectl get hpa -n todo-api-prod
kubectl top pods -n todo-api-prod

kubectl get secret -n todo-api-prod
kubectl get networkpolicy -n todo-api-prod

kubectl get namespace demo-iac
kubectl get pods -n monitoring

# gitops-souaibou
