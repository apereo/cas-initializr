#!/bin/bash

set -e

source ./ci/functions.sh

LAUNCH_INITIALIZR=true
while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --launch) LAUNCH_INITIALIZR=true ;;
    --no-launch) LAUNCH_INITIALIZR=false ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
  shift
done

echo "Building CAS Initializr"
./gradlew --configure-on-demand --no-daemon \
  clean build -x test -x javadoc -x check --parallel -q

if [ "$LAUNCH_INITIALIZR" = "true" ]; then
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

  echo "Checking CAS Initializr Home"
  curl http://localhost:8080

  echo "Checking CAS Initializr Home"
  curl http://localhost:8080/ui

  echo -e "\nAll CAS Initializr checks have passed"

  kill -9 $pid
fi
