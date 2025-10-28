#!/bin/bash

set -e

source ./ci/functions.sh

echo "Building CAS Initializr"
./gradlew --configure-on-demand --no-daemon \
  clean build -x test -x javadoc -x check --parallel -q

echo "Launching CAS Initializr"
java -jar app/build/libs/app.jar &
pid=$!
sleep 15

echo "Checking CAS Initializr metadata"
curl -H 'Accept: application/json' http://localhost:8080 | jq

echo "Checking CAS Initializr dependencies"
curl -H 'Accept: application/json' http://localhost:8080/dependencies | jq

echo "Checking CAS Initializr info"
curl -H 'Accept: application/json' http://localhost:8080/actuator/info | jq

echo "Checking CAS Initializr supported versions"
curl -H 'Accept: application/json' http://localhost:8080/actuator/supportedVersions | jq

echo "Checking CAS Initializr UI"
curl http://localhost:8080/ui

echo -e "\nAll CAS Initializr checks have passed"

kill -9 $pid
