#!/bin/bash

source ./ci/functions.sh

CAS_VERSION=${1:-$DEFAULT_CAS_VERSION}
CAS_MGMT_VERSION=${2:-$DEFAULT_MGMT_VERSION}

# set BUILD_IMAGES to something other than yes to skip image buildings
BUILD_IMAGES=${BUILD_IMAGES:-yes}

echo "Validating HELM build images for CAS ${CAS_VERSION}"

# pass clean as first arg if you want to build new initializr
if [[ $1 == "clean" ]] ; then
  CLEAN=clean
  shift
fi

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
  local cas_version=${2:-$CAS_VERSION}
  local dependencies=${3:-""}

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
  echo "Creating overlay of type: ${type}:${cas_version} with dependencies: ${dependencies} in folder $(pwd)"
  echo "Running: curl http://localhost:8080/starter.tgz -d $postdata"
  curl http://localhost:8080/starter.tgz -d casVersion="${cas_version}" -d $postdata | tar -xzf -
  cd ../..
}

stopInitializr

if [[ ! -f app/build/libs/app.jar || "$CLEAN" == "clean" ]]; then
  echo "Building CAS Initializr"
  ./gradlew clean build
fi
echo "Running CAS Initializr"
java -jar app/build/libs/app.jar &

waitForInitializr

updateOverlay cas-overlay $CAS_VERSION core,bootadmin,metrics,jsonsvc
updateOverlay cas-bootadmin-server-overlay $CAS_VERSION
updateOverlay cas-config-server-overlay $CAS_VERSION
updateOverlay cas-discovery-server-overlay $CAS_VERSION
updateOverlay cas-management-overlay $CAS_MGMT_VERSION

stopInitializr

if [[ "$BUILD_IMAGES" == "yes" ]] ; then
  updateImage cas-overlay
  updateImage cas-bootadmin-server-overlay
  updateImage cas-config-server-overlay
  updateImage cas-discovery-server-overlay
  updateImage cas-management-overlay
fi
