#!/bin/bash

source ./ci/functions.sh

CAS_VERSION=${1}

REGISTRY=docker.io
IMAGE_REPO=apereo

if [[ -z "$CAS_VERSION" ]]; then
  echo "Usage: $0 [CAS_VERSION]"
  exit 1
fi

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
  local image_name=${2:-cas}
  local version=${3:-$CAS_VERSION}

  cd tmp/$type
  echo
  echo "Building War and Jib Docker Image for ${type}"
  ./gradlew clean build jibBuildTar --refresh-dependencies --no-configuration-cache

  echo "Loading ${type} image into k3s"
  sudo k3s ctr image import build/jib-image.tar
  sudo k3s ctr image tag "${REGISTRY}/${IMAGE_REPO}/${image_name}:${version}" "${REGISTRY}/${IMAGE_REPO}/${image_name}:latest"
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
  # create project dir from Initializr with support metrics, and git service registry
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

updateOverlay cas-overlay $CAS_VERSION metrics,jsonsvc

stopInitializr

if [[ "$BUILD_IMAGES" == "yes" ]] ; then
  echo "Purging existing $IMAGE_REPO images"
  sudo k3s ctr image rm $(sudo k3s ctr image list -q | grep $IMAGE_REPO | xargs)
  updateImage cas-overlay cas ${CAS_VERSION}
fi

echo "Listing final images built"
sudo k3s ctr image list -q
