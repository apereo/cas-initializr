#!/usr/bin/env sh

rm -Rf ./tmp

CAS_VERSION="6.6.0-SNAPSHOT"
BOOT_VERSION="2.7.1"

#CAS_VERSION="6.3.7.2"
#BOOT_VERSION="2.3.7.RELEASE"

curl -k http://localhost:8080/starter.tgz -d dependencies="$1" \
  -d "casVersion=${CAS_VERSION}&bootVersion=${BOOT_VERSION}" \
  -d type=cas-overlay -d baseDir=tmp | tar -xzvf -
