# k8s-scale-test

Small Express app for Kubernetes scaling tests on AKS. Includes endpoints to generate CPU and latency load and manifests for HPA.

## Endpoints
- `GET /healthz`
- `GET /readyz`
- `GET /cpu?ms=200`
- `GET /latency?ms=200`

## Local run
```bash
npm install
npm start
```

## Container build
```bash
docker build -t k8s-scale-test:local .
```

## Git repo setup
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/stefandr2/aks.git
```

## AKS deploy (example)
1. Create a resource group and AKS cluster (if needed):
```bash
az group create -n rg-k8s-scale-test -l eastus
az aks create -g rg-k8s-scale-test -n aks-k8s-scale-test --node-count 2 --enable-addons monitoring --generate-ssh-keys
az aks get-credentials -g rg-k8s-scale-test -n aks-k8s-scale-test
```

2. Build and push an image to ACR (or another registry), then update the image in [k8s/deployment.yaml](k8s/deployment.yaml).

3. Apply manifests:
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
```

4. Get the service IP:
```bash
kubectl get svc k8s-scale-test
```

## Azure resource provisioning (current names)
You can use the script in `scripts/provision-azure.ps1` or run the commands below:
```bash
az account set --subscription 113f91f0-83f2-4b50-8e5a-111f1d89e1e1
az group create -n aro -l swedencentral
az acr create -n stefandr-acr -g aro --sku Basic
az aks create -g aro -n stefandr-aks --node-count 2 --enable-managed-identity --enable-addons monitoring --attach-acr stefandr-acr
az load test create -g aro -n stefandr-test
```

## CI/CD (GitHub Actions + OIDC)
The workflow is in `.github/workflows/ci-cd.yml` and does build, push, deploy, and Azure Load Testing.

1. Create an app registration and federated credential:
```bash
az ad app create --display-name gh-aks-cicd
az ad sp create --id <APP_ID>
az role assignment create --assignee <APP_ID> --role Contributor --scope /subscriptions/113f91f0-83f2-4b50-8e5a-111f1d89e1e1
az ad app federated-credential create --id <APP_ID> --parameters scripts/federated-credential.json
```

2. Set GitHub repo secrets:
- `AZURE_CLIENT_ID` = <APP_ID>
- `AZURE_TENANT_ID` = <TENANT_ID>
- `AZURE_SUBSCRIPTION_ID` = 113f91f0-83f2-4b50-8e5a-111f1d89e1e1

3. Push to `main` to run build, deploy, and load test.

## Azure Load Testing (JMeter)
1. In the Azure Load Testing test configuration, upload [loadtest/jmeter/test-plan.jmx](loadtest/jmeter/test-plan.jmx).
2. Replace the `HOST` value with the service IP or DNS name and keep `PORT` as `80`.
3. Run the test with a user load that triggers CPU usage, and observe HPA scaling in AKS.

## Azure Load Testing (CI/CD)
The workflow uses [loadtest/azure-load-test.yaml](loadtest/azure-load-test.yaml) and injects the AKS service IP.

## Optional ingress
If you use an ingress controller, update [k8s/ingress.yaml](k8s/ingress.yaml) with your host and apply it.
