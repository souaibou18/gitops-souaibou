# Projet Fil Rouge - GitOps Todo API

# GitOps Souaibou — Fil Rouge DevOps / GitOps / Kubernetes

Ce dépôt contient la mise en œuvre d’un **fil rouge DevOps / GitOps** basé sur **Kubernetes**, **Argo CD**, **Argo Rollouts**, **Prometheus/Grafana**, **Terraform**, **FluxCD + Tofu Controller**, **Ingress NGINX**, **HPA**, **NetworkPolicies** et **Sealed Secrets**.

L’objectif est de déployer et exploiter une application `todo-api` selon des pratiques modernes :
- **GitOps** pour les déploiements applicatifs
- **Canary deployment** avec Argo Rollouts
- **Observabilité** avec Prometheus / Grafana
- **Autoscaling** avec HPA
- **Sécurisation** avec NetworkPolicy et Sealed Secrets
- **Infrastructure as Code** avec Terraform et Flux + Tofu Controller

---

# 1. Objectifs du projet

Ce projet vise à démontrer une plateforme Kubernetes industrialisée permettant de :

- déployer une application avec **Argo CD**
- gérer les mises à jour progressives avec **Argo Rollouts**
- exposer l’application via **Ingress NGINX**
- superviser la plateforme avec **Prometheus + Grafana**
- mettre en place un **Horizontal Pod Autoscaler**
- protéger les communications avec une **NetworkPolicy**
- gérer les secrets de façon GitOps via **Sealed Secrets**
- provisionner des ressources Kubernetes via **Terraform**
- démontrer du **GitOps IaC** avec **FluxCD + Tofu Controller**

---

# 2. Architecture globale

Le dépôt s’articule autour de deux grands volets :

## 2.1 GitOps applicatif
Le déploiement de l’application `todo-api` en environnement `prod` repose sur :
- **Argo CD** pour synchroniser l’état du cluster avec Git
- **Kustomize** pour gérer les overlays
- **Argo Rollouts** pour le déploiement canary
- **Ingress NGINX** pour l’exposition HTTP
- **HPA** pour l’autoscaling
- **NetworkPolicy** pour le cloisonnement réseau
- **Sealed Secrets** pour la gestion sécurisée du secret applicatif

## 2.2 GitOps Infrastructure / IaC
Le volet infrastructure repose sur :
- **Terraform** pour décrire les ressources
- **FluxCD** pour synchroniser le dépôt Git
- **Tofu Controller** pour exécuter Terraform/OpenTofu depuis le cluster
- création d’un namespace `gitops-iac` via GitOps

---

# 3. Stack technique

## Conteneurisation / orchestration
- Docker
- Kubernetes
- Minikube

## GitOps / CD
- Argo CD
- Argo Rollouts
- Kustomize
- FluxCD
- Tofu Controller

## Observabilité
- Prometheus
- Grafana
- metrics-server

## Sécurité / exposition
- Ingress NGINX
- NetworkPolicy
- Sealed Secrets

## Infrastructure as Code
- Terraform
- Provider Kubernetes

---

# 4. Arborescence du dépôt

```text
.
├── apps
│   └── todo-api
│       ├── base
│       │   ├── deployment-rollout.yaml
│       │   ├── hpa.yaml
│       │   ├── ingress.yaml
│       │   ├── kustomization.yaml
│       │   ├── networkpolicy.yaml
│       │   └── service.yaml
│       └── overlays
│           └── prod
│               ├── kustomization.yaml
│               └── patch-replicas.yaml
│
├── argocd
│   └── applications
│       ├── todo-api-prod.yaml
│       └── sealed-secrets-prod.yaml
│
├── infrastructure
│   ├── terraform
│   │   ├── .gitignore
│   │   ├── .terraform.lock.hcl
│   │   ├── main.tf
│   │   ├── providers.tf
│   │   └── versions.tf
│   │
│   └── tf-controller
│       └── demo-namespace
│           ├── gitrepository.yaml
│           ├── kustomization.yaml
│           ├── rbac.yaml
│           ├── terraform.yaml
│           └── terraform
│               ├── main.tf
│               ├── providers.tf
│               └── versions.tf
│
├── monitoring
│   └── (manifests ou Helm values éventuels)
│
├── security
│   └── sealed-secrets
│       └── prod
│           ├── kustomization.yaml
│           └── sealed-secret.yaml
│
└── README.md

5. Prérequis

Avant de démarrer, il faut disposer de :

Git
Docker
kubectl
minikube
argocd CLI
kustomize
terraform
helm
kubeseal
flux CLI (optionnel mais utile)

Versions recommandées :

Kubernetes >= 1.29
Argo CD récent
Argo Rollouts récent
Terraform >= 1.5
kubeseal compatible avec le contrôleur installé

6. Démarrage du cluster
6.1 Lancer Minikube
minikube start
6.2 Vérifier le cluster
kubectl get nodes
kubectl get ns

7. Installation des composants de plateforme
7.1 Argo CD

Créer le namespace et installer Argo CD :

kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

Vérifier :

kubectl get pods -n argocd

Récupérer le mot de passe admin :

kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

Port-forward de l’UI :

kubectl port-forward svc/argocd-server -n argocd 8080:443

Connexion CLI :

argocd login localhost:8080 --username admin --password <mot_de_passe> --insecure
7.2 Argo Rollouts
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

Vérifier :

kubectl get pods -n argo-rollouts

Installer le plugin kubectl argo rollouts si nécessaire.

7.3 Ingress NGINX

Activation de l’ingress sur Minikube :

minikube addons enable ingress

Vérifier :

kubectl get pods -n ingress-nginx
7.4 Metrics Server

Pour le HPA et les métriques :

minikube addons enable metrics-server

Vérifier :

kubectl get pods -n kube-system | grep metrics
kubectl top nodes
7.5 Monitoring Prometheus / Grafana

Le namespace utilisé est monitoring.

Exemple d’installation avec Helm :

kubectl create namespace monitoring
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/prometheus -n monitoring
helm install grafana grafana/grafana -n monitoring

Vérifier :

kubectl get pods -n monitoring

Récupérer le mot de passe Grafana :

kubectl get secret grafana -n monitoring -o jsonpath="{.data.admin-password}" | base64 -d

Port-forward Grafana :

kubectl port-forward svc/grafana 3000:80 -n monitoring

Accès :

URL : http://localhost:3000
user : admin
password : valeur du secret Grafana
7.6 Sealed Secrets

Installation du contrôleur Sealed Secrets :

kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/latest/download/controller.yaml

Vérifier :

kubectl get pods -n kube-system | grep sealed
7.7 FluxCD

Namespace Flux :

kubectl create namespace flux-system

Installation Flux :

flux install

Vérifier :

kubectl get pods -n flux-system
7.8 Tofu Controller

Installation du Tofu Controller :

kubectl apply -f https://raw.githubusercontent.com/flux-iac/tofu-controller/main/docs/release.yaml

Vérifier :

kubectl get pods -n flux-system
kubectl get crds | grep infra.contrib
8. Déploiement GitOps de l’application todo-api
8.1 Principe

L’application todo-api est déployée via :

un base Kustomize
un overlay prod
une Application Argo CD pointant vers apps/todo-api/overlays/prod
9. Déploiement de l’Application Argo CD

Créer l’application Argo CD pour todo-api-prod :

kubectl apply -f argocd/applications/todo-api-prod.yaml

Synchroniser :

argocd app sync todo-api-prod

Vérifier :

argocd app get todo-api-prod
10. Déploiement Canary avec Argo Rollouts

Le déploiement de todo-api utilise un Rollout Argo Rollouts en stratégie Canary.

10.1 Vérifier le rollout
kubectl argo rollouts get rollout todo-api-prod -n todo-api-prod
10.2 Promouvoir un canary
kubectl argo rollouts promote todo-api-prod -n todo-api-prod
10.3 Suivre le rollout
kubectl argo rollouts get rollout todo-api-prod -n todo-api-prod --watch
11. Service et exposition via Ingress

L’application est exposée via un Service ClusterIP et un Ingress NGINX.

11.1 Vérifier le Service
kubectl get svc -n todo-api-prod
kubectl describe svc todo-api-prod -n todo-api-prod
11.2 Vérifier l’Ingress
kubectl get ingress -n todo-api-prod
11.3 Ajouter l’entrée dans /etc/hosts

Récupérer l’IP Minikube :

minikube ip

Ajouter dans /etc/hosts :

<MINIKUBE_IP> todo.local
11.4 Tester l’accès

Selon la configuration locale, il peut être nécessaire de passer par un port-forward du contrôleur ingress ou d’utiliser directement le host todo.local.

Exemple :

curl -H "Host: todo.local" http://localhost:8081

ou

curl http://todo.local
12. Autoscaling avec HPA

Le projet intègre un HorizontalPodAutoscaler pour todo-api-prod.

12.1 Vérifier le HPA
kubectl get hpa -n todo-api-prod
kubectl describe hpa todo-api-prod -n todo-api-prod
12.2 Vérifier les métriques
kubectl top pods -n todo-api-prod
kubectl top nodes

Exemple de cible :

minReplicas: 3
maxReplicas: 8
target CPU: 60%
13. NetworkPolicy

Une NetworkPolicy protège les pods todo-api.

13.1 Vérifier la policy
kubectl get networkpolicy -n todo-api-prod
kubectl describe networkpolicy todo-api-network-policy-prod -n todo-api-prod

Objectif :

limiter les flux réseau
n’autoriser que les flux nécessaires vers les pods de l’application
14. Gestion des secrets avec Sealed Secrets
14.1 Objectif

Le secret applicatif DATABASE_URL ne doit pas être stocké en clair dans Git.

Le projet utilise donc :

un SealedSecret versionné dans Git
le contrôleur Sealed Secrets qui génère le Secret Kubernetes à l’exécution
14.2 Emplacement Git

Le SealedSecret de prod est stocké ici :

security/sealed-secrets/prod/sealed-secret.yaml

Il est déployé par une Application Argo CD dédiée :

sealed-secrets-prod
14.3 Vérification
kubectl get sealedsecret -n todo-api-prod
kubectl get secret -n todo-api-prod
argocd app get sealed-secrets-prod

Résultat attendu :

SealedSecret présent et Healthy
Secret Kubernetes todo-api-secret-prod présent
le Rollout consomme DATABASE_URL depuis ce secret
14.4 Vérifier l’injection du secret dans le Rollout
kubectl describe rollout todo-api-prod -n todo-api-prod | grep -A5 DATABASE_URL

Résultat attendu :

DATABASE_URL doit référencer todo-api-secret-prod
15. Terraform local

Un premier exemple de Terraform local est présent dans :

infrastructure/terraform

Il sert à illustrer la création d’un namespace Kubernetes via Terraform.

15.1 Fichiers
versions.tf
providers.tf
main.tf
15.2 Exemple d’exécution
cd infrastructure/terraform
terraform init
terraform apply
16. GitOps IaC avec Flux + Tofu Controller

Le projet démontre également une approche GitOps pour Terraform grâce à FluxCD + Tofu Controller.

16.1 Objectif

Créer automatiquement le namespace :

gitops-iac

à partir d’un code Terraform stocké dans Git.

16.2 Ressources utilisées

Dans infrastructure/tf-controller/demo-namespace :

gitrepository.yaml
terraform.yaml
rbac.yaml
kustomization.yaml
dossier Terraform associé
16.3 Déploiement

Appliquer les manifests :

kubectl apply -k infrastructure/tf-controller/demo-namespace
16.4 Vérification
kubectl get gitrepository -n flux-system
kubectl get terraform -n flux-system
kubectl describe terraform demo-namespace -n flux-system
kubectl get namespace gitops-iac

Résultat attendu :

GitRepository prêt
Terraform Ready=True
namespace gitops-iac créé
17. Sécurité / bonnes pratiques mises en place
17.1 GitOps
toutes les ressources applicatives sont versionnées dans Git
Argo CD et Flux réconcilient automatiquement le cluster
17.2 Déploiement progressif
mise à jour canary avec Argo Rollouts
possibilité de promotion manuelle
17.3 Gestion des secrets
secret en clair supprimé du dépôt
utilisation de Sealed Secrets
17.4 Cloisonnement réseau
NetworkPolicy sur les pods de l’application
17.5 Autoscaling
HPA basé sur les métriques CPU
18. Commandes utiles
18.1 Argo CD
argocd app list
argocd app get todo-api-prod
argocd app get sealed-secrets-prod
argocd app sync todo-api-prod
argocd app sync sealed-secrets-prod
18.2 Rollouts
kubectl argo rollouts get rollout todo-api-prod -n todo-api-prod
kubectl argo rollouts get rollout todo-api-prod -n todo-api-prod --watch
kubectl argo rollouts promote todo-api-prod -n todo-api-prod
18.3 Pods / services / ingress
kubectl get pods -n todo-api-prod
kubectl get svc -n todo-api-prod
kubectl get ingress -n todo-api-prod
kubectl get endpoints -n todo-api-prod
18.4 Monitoring
kubectl get pods -n monitoring
kubectl get secret grafana -n monitoring -o jsonpath="{.data.admin-password}" | base64 -d
kubectl port-forward svc/grafana 3000:80 -n monitoring
18.5 HPA / metrics
kubectl get hpa -n todo-api-prod
kubectl describe hpa todo-api-prod -n todo-api-prod
kubectl top nodes
kubectl top pods -n todo-api-prod
18.6 Flux / Tofu
kubectl get pods -n flux-system
kubectl get gitrepository -n flux-system
kubectl get terraform -n flux-system
kubectl describe terraform demo-namespace -n flux-system
19. État d’avancement du fil rouge
Validé
 Cluster Kubernetes opérationnel
 Argo CD installé
 Argo Rollouts installé
 Déploiement todo-api-prod via Argo CD
 Canary deployment avec promotion
 Ingress NGINX en place
 Monitoring Prometheus / Grafana installé
 HPA configuré
 NetworkPolicy configurée
 Sealed Secrets opérationnel
 Terraform local opérationnel
 FluxCD + Tofu Controller opérationnels
 Namespace gitops-iac créé via Terraform GitOps
À compléter / amélioration possible
 RBAC Argo CD plus fin par rôle / projet
 dashboards Grafana personnalisés pour l’application
 vraie image applicative todo-api à la place de nginx
 tests de charge pour observer le HPA en action
 External Secrets en alternative à Sealed Secrets
 pipeline CI complète autour du dépôt
20. Limites actuelles

Le projet est réalisé dans un environnement Minikube local.
Cela implique plusieurs limites :

exposition réseau simplifiée
persistance limitée
haute disponibilité non traitée
sécurité simplifiée par rapport à un cluster de production réel
supervision encore générique si les dashboards ne sont pas personnalisés
21. Perspectives

Les évolutions possibles sont :

déployer une vraie API Node/Express + base PostgreSQL
brancher un pipeline CI pour construire et publier l’image
ajouter des tests automatiques avant promotion canary
intégrer des dashboards Grafana dédiés à l’application
renforcer le RBAC Argo CD
passer d’un secret de démonstration à un backend de secrets centralisé
22. Auteur

Projet réalisé par Souaibou N’Diaye dans le cadre d’un fil rouge DevOps / GitOps autour de Kubernetes, Argo CD, FluxCD et Terraform.
