# The steps are followed as below to Deploy a Nodejs app using github actions.

# Installation & Configurations
## Step 1: Create EKS Cluster(Recoamended way is using Iac)

### Prerequisites
- Download and Install AWS Cli - Please Refer ("https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html").
- Setup and configure AWS CLI using the `aws configure` command.
- Install and configure eksctl using the steps mentioned ("https://eksctl.io/installation/").
- Install and configure kubectl as mentioned ("https://kubernetes.io/docs/tasks/tools/").
- Install AWS application ELB ("https://docs.aws.amazon.com/eks/latest/userguide/lbc-helm.html").


```bash
eksctl create cluster --name=demo-cluster \
                      --region=ap-southeast-2 \
                      --zones=ap-southeast-2a,ap-southeast-2b \
                      --without-nodegroup
```
```bash
eksctl utils associate-iam-oidc-provider \
    --region us-east-1 \
    --cluster demo-cluster \
    --approve
```
```bash
eksctl create nodegroup --cluster=demo-cluster \
                        --region=ap-southeast-2 \
                        --name=observability-ng-private \
                        --node-type=t3.medium \
                        --nodes-min=2 \
                        --nodes-max=3 \
                        --node-volume-size=20 \
                        --managed \
                        --asg-access \
                        --external-dns-access \
                        --full-ecr-access \
                        --appmesh-access \
                        --alb-ingress-access \
                        --node-private-networking

# Update ./kube/config file
aws eks update-kubeconfig --name demo-cluster
```

### Step 2: Install kube-prometheus-stack
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

### Step 3: Deploy the chart into a new namespace "monitoring"
```bash
kubectl create ns monitoring
```
```bash

helm install monitoring prometheus-community/kube-prometheus-stack \
-n monitoring \
-f ./custom_kube_prometheus_stack.yml
```

### Step 4: Verify the Installation
```bash
kubectl get all -n monitoring
```
- **Prometheus UI**:
```bash
kubectl port-forward service/<service-name> -n monitoring 9090:9090
```

- **Grafana UI**: password is `prom-operator`
```bash
kubectl port-forward service/<service-name> -n monitoring 3000:80
```

- **Apply K8S manifest files**:
```bash
kubectl apply -f <File path>
```

### Step 5: Deleting cluster
- **Uninstall helm chart**:
```bash
helm uninstall monitoring --namespace monitoring
```
- **Delete namespace**:
```bash
kubectl delete ns monitoring
```
- **Delete Cluster & everything else**:
```bash
eksctl delete cluster --name demo-cluster
```
