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
sleep 15
mkdir tmp
cd tmp || exit
printgreen "Requesting CAS overlay for ${parameters}"
curl http://localhost:8080/starter.tgz --connect-timeout 30 -d "${parameters}" | tar -xzvf -
kill -9 $pid
[ "$CI" = "true" ] && pkill java

if [[ -d /tmp ]] ; then
  sudo mkdir /tmp
fi

printgreen "Building CAS Native Image. This may take several minutes..."
./gradlew clean build nativeCompile -PnativeImage=true --warning-mode all --no-daemon

if [[ $? -ne 0 ]]; then
  printred "CAS native image build failed"
  exit 1
fi

printgreen "CAS native image build is successfully built"
ls build/native/nativeCompile

./build/native/nativeCompile/cas --spring.profiles.active=native &
sleep 15

[ "$CI" = "true" ] && pkill java
exit 0
