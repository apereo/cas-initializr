#!/bin/bash

source ./ci/functions.sh

CAS_VERSION=${1:-$DEFAULT_CAS_VERSION}
BOOT_VERSION=${2:-$DEFAULT_BOOT_VERSION}
BRANCH=${3:-master}

java -jar app/build/libs/app.jar &
pid=$!
sleep 15
mkdir tmp
cd tmp

echo "Building CAS overlay ${CAS_VERSION} with Spring Boot ${BOOT_VERSION} for branch ${BRANCH}"
curl http://localhost:8080/starter.tgz \
  -d baseDir=initializr \
  -d "casVersion=${CAS_VERSION}&bootVersion=${BOOT_VERSION}" | tar -xzvf -
kill -9 $pid

echo "Cloning CAS overlay repository..."
git clone --depth 1 https://${GH_TOKEN}@github.com/apereo/cas-overlay-template $PWD/overlay-repo
mv $PWD/overlay-repo/.git ./initializr
rm -Rf $PWD/overlay-repo
cd $PWD/overlay-repo
git config user.email "cas@apereo.org"
git config user.name "CAS"
git status
git add --all
git commit -S -am "Sync"

exit 1
