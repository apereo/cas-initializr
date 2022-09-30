#!/bin/bash

source ./ci/functions.sh

set -e

cd tmp/cas-overlay

imageTag=$(./gradlew casVersion --q)
echo "Image tag is ${imageTag}"

cd helm
chmod +x *.sh

export NAMESPACE=${1:-default}
if [[ $NAMESPACE != "default" ]]; then
  kubectl create namespace $NAMESPACE || true
fi

echo "Creating Keystore and secret for keystore"
./create-cas-server-keystore-secret.sh $NAMESPACE > tmp.out 2>&1
if [[ $? -ne 0 ]]; then
  cat tmp.out
fi
rm tmp.out

echo "Creating tls secret for ingress to use"
./create-ingress-tls.sh $NAMESPACE > tmp.out 2>&1
if [[ $? -ne 0 ]]; then
  cat tmp.out
fi
rm tmp.out

echo "Creating truststore with server/ingress certs and put in configmap"
./create-truststore.sh $NAMESPACE > tmp.out 2>&1
if [[ $? -ne 0 ]]; then
  cat tmp.out
fi
rm tmp.out

# Set KUBECONFIG for helm
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

# Lint chart
echo Lint check on cas-server helm chart
helm lint cas-server

set +e
helm list -n ingress-nginx | grep ingress
if [[ $? -ne 0 ]]; then
  set -e
  # k3s comes with Traefik so we could try using that instead at some point
  echo "Installing ingress controller and waiting for it to start"
  helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx

  kubectl create namespace ingress-nginx || true
  # install with some options that we don't necessarily need here but may be important in some deployments
  # proxy-buffer-size is needed for nginx to handle large OIDC related headers and avoids 502 error from nginx
  # use-forwarded-headers is needed if your ingress controller is behind another proxy, should be false if not behind another proxy
  # enable-underscores-in-headers is important if you are trying to use a header with an underscore from another proxy
  helm upgrade --install --namespace ingress-nginx ingress-nginx ingress-nginx/ingress-nginx \
    --set controller.config.enable-underscores-in-headers= \
    --set controller.config.use-forwarded-headers= \
    --set controller.config.proxy-buffer-size=16k \
    --set "controller.extraArgs.enable-ssl-passthrough="


  kubectl wait --namespace ingress-nginx \
    --for condition=ready pod \
    --selector=app.kubernetes.io/component=controller \
    --timeout=120s
fi
set -e

echo "Deleting cas-server helm chart if it already exists"
helm delete cas-server --namespace $NAMESPACE || true
# make sure everything is gone
sleep 5


echo "Install cas-server helm chart"
docker images

echo "Using local jib image imported into k3s"
helm upgrade --install cas-server --namespace $NAMESPACE --set image.pullPolicy=Never --set bootadminimage.pullPolicy=Never --set mgmtimage.pullPolicy=Never --set image.tag="${imageTag}" ./cas-server

# make sure resources are created before waiting on their status
sleep 35

set +e
echo "Waiting for startup $(date)"
kubectl wait --for condition=ready --timeout=180s --namespace $NAMESPACE pod cas-server-0
kubectl wait --for condition=ready --timeout=180s --namespace $NAMESPACE pod -l cas.server-type=bootadmin
kubectl wait --for condition=ready --timeout=180s --namespace $NAMESPACE pod -l cas.server-type=mgmt
echo "Done waiting for startup $(date)"

echo "Checking rollout status"
kubectl rollout --namespace $NAMESPACE status deploy cas-server-boot-admin --timeout=5s
kubectl rollout --namespace $NAMESPACE status deploy cas-server-mgmt --timeout=5s
kubectl rollout --namespace $NAMESPACE status sts cas-server --timeout=5s
echo "Done checking rollout status"
set -e

kubectl describe pod --namespace $NAMESPACE cas-server-0
echo "Describing cas bootadmin pod"
kubectl describe pod --namespace $NAMESPACE -l cas.server-type=bootadmin
echo "Describing cas mgmt pod"
kubectl describe pod --namespace $NAMESPACE -l cas.server-type=mgmt

echo "Pod Status:"
kubectl get pods --namespace $NAMESPACE

sleep 10

echo "CAS Management Server Logs..."
kubectl logs -l cas.server-type=mgmt --tail=-1 --namespace $NAMESPACE | tee cas-mgmt.out
echo "CAS Server Logs..."
kubectl logs cas-server-0 --namespace $NAMESPACE | tee cas.out
echo "CAS Boot Admin Server Logs..."
kubectl logs -l cas.server-type=bootadmin --tail=-1 --namespace $NAMESPACE | tee cas-bootadmin.out

echo "Checking mgmt server log for startup message"
grep "Initializing Spring DispatcherServlet" cas-mgmt.out
echo "Checking cas server log for startup message"
grep "Started CasWebApplication" cas.out
echo "Checking bootadmin server log for startup message"
grep "Started CasSpringBootAdminServerWebApplication" cas-bootadmin.out

echo "Running chart built-in test"
helm test --namespace $NAMESPACE cas-server

echo "Checking login page"
curl -k -H "Host: cas.example.org" https://127.0.0.1/cas/login > login.txt
grep "password" login.txt


