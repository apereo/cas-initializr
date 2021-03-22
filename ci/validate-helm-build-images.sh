#!/bin/bash

source ./ci/functions.sh

# pass clean as first arg if you want to build new intializr
if [[ $1 == "clean" ]] ; then
  CLEAN=clean
  shift
fi

# pass in something other than all to skip image building
MODE=${1:-all}

set -e

function updateImage() {
  local type=${1:-cas-overlay}
  cd tmp/$type
  echo
  echo "Building War and Jib Docker Image for ${type}"
  ./gradlew clean build jibBuildTar --refresh-dependencies

  echo "Loading ${type} image into k3s"
  sudo k3s ctr images import build/jib-image.tar
  cd ../..
}

function updateOverlay() {
  local type=${1:-cas-overlay}
  local dependencies=${2:-""}
  if [[ -d tmp/$type ]] ; then
    rm -rf tmp/$type
  fi
  mkdir -p tmp/$type
  cd tmp/$type

  local postdata=type=$type
  if [[ ! -z $dependencies ]]; then
    postdata="${postdata}&dependencies=${dependencies}"
  fi
  # create project dir from Initializr with support boot admin, metrics, and git service registry
  echo "Creating overlay of type: ${type} with dependencies: ${dependencies} in folder $(pwd)"
  echo "Running: curl http://localhost:8080/starter.tgz -d $postdata"
  curl http://localhost:8080/starter.tgz -d $postdata | tar -xzf -
  cd ../..
}

stopInitializr

if [[ ! -f app/build/libs/app.jar || "$CLEAN" == "clean" ]]; then
  echo "Building casinit"
  ./gradlew clean build
fi
echo "Running casinit"
java -jar app/build/libs/app.jar &

waitForInitializr

updateOverlay cas-overlay core,bootadmin,metrics,gitsvc,jsonsvc,redis
updateOverlay cas-bootadmin-server-overlay
updateOverlay cas-config-server-overlay
updateOverlay cas-discovery-server-overlay
updateOverlay cas-management-overlay

if [[ "$MODE" == "all" ]] ; then
  updateImage cas-overlay
  updateImage cas-bootadmin-server-overlay
  updateImage cas-config-server-overlay
  updateImage cas-discovery-server-overlay
  updateImage cas-management-overlay
fi

stopInitializr
