#!/usr/bin/env sh

rm -Rf ./tmp

CAS_VERSION="7.0.0-SNAPSHOT"
BOOT_VERSION="3.2.0"

#CAS_VERSION="6.6.14"
#BOOT_VERSION="2.7.3"

curl -k http://localhost:8080/starter.tgz -d dependencies="$1" \
  -d "casVersion=${CAS_VERSION}&bootVersion=${BOOT_VERSION}" \
  -d dockerSupported=true -d helmSupported=false \
  -d herokuSupported=false \
  -d nativeImageSupported=true \
  -d openRewriteSupported=true \
  -d dependencyCoordinates=cas-server-support-rest \
  -d type=cas-overlay -d baseDir=tmp | tar -xzvf -
#  -d deploymentType=web \
