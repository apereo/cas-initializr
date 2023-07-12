#!/bin/bash

source ./ci/functions.sh

while (( "$#" )); do
    case "$1" in
    --cas)
        CAS_VERSION="$2"
        shift 2
        ;;
    --spring-boot)
        BOOT_VERSION="$2"
        shift 2
        ;;
    --apache-tomcat)
        TOMCAT_VERSION="$2"
        shift 2
        ;;
    esac
done

parameters="casVersion=${CAS_VERSION}&dependencyCoordinates=cas-server-support-rest"
if [ -z "${BOOT_VERSION}" ]; then
  parameters="${parameters}&bootVersion=${BOOT_VERSION}"
fi

CAS_MAJOR_VERSION=`echo $CAS_VERSION | cut -d. -f1`
CAS_MINOR_VERSION=`echo $CAS_VERSION | cut -d. -f2`

java -jar app/build/libs/app.jar &
pid=$!
sleep 30
mkdir tmp
cd tmp || exit
printgreen "Requesting CAS overlay for ${parameters}"
curl http://localhost:8080/starter.tgz --connect-timeout 30 -d "${parameters}" | tar -xzvf -
kill -9 $pid
echo -e "CAS overlay is downloaded into directory: " && echo "$PWD"
[ "$CI" = "true" ] && pkill java
exit 0
