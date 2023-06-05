#!/bin/bash

source ./ci/functions.sh

while (( "$#" )); do
    case "$1" in
    --cas)
        CAS_VERSION="$2"
        shift 2
        ;;
    esac
done

parameters="casVersion=${CAS_VERSION}&nativeImageSupported=true"

CAS_MAJOR_VERSION=`echo $CAS_VERSION | cut -d. -f1`
CAS_MINOR_VERSION=`echo $CAS_VERSION | cut -d. -f2`

java -jar app/build/libs/app.jar &
pid=$!
sleep 10
mkdir tmp
cd tmp || exit
echo "Requesting CAS overlay for ${parameters}"
curl http://localhost:8080/starter.tgz --connect-timeout 30 -d "${parameters}" | tar -xzvf -
kill -9 $pid
[ "$CI" = "true" ] && pkill java

echo "Building CAS Native Image. This may take several minutes..."
./gradlew clean build nativeCompile -PnativeImage=true --warning-mode all --no-daemon

[ "$CI" = "true" ] && pkill java
exit 0
