#!/usr/bin/env sh

rm -Rf ./tmp

# CAS_VERSION="7.0.0-SNAPSHOT"
# BOOT_VERSION="3.0.1"

CAS_VERSION="6.6.6"
BOOT_VERSION="2.7.3"

curl -k http://localhost:8080/starter.tgz -d dependencies="$1" \
  -d "casVersion=${CAS_VERSION}&bootVersion=${BOOT_VERSION}" \
  -d dockerSupported=false -d helmSupported=false \
  -d herokuSupported=false \
  -d type=cas-overlay -d baseDir=tmp | tar -xzvf -
