param(
  [string]$SubscriptionId = "113f91f0-83f2-4b50-8e5a-111f1d89e1e1",
  [string]$ResourceGroup = "aro",
  [string]$Location = "swedencentral",
  [string]$AksName = "stefandr-aks",
  [string]$AcrName = "stefandracr",
  [string]$LoadTestName = "stefandrtest"
)

az account set --subscription $SubscriptionId
az group create -n $ResourceGroup -l $Location
az acr create -n $AcrName -g $ResourceGroup --sku Basic
az aks create -g $ResourceGroup -n $AksName --node-count 2 --enable-managed-identity --enable-addons monitoring --attach-acr $AcrName
az load create -g $ResourceGroup -n $LoadTestName
