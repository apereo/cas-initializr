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
ls -al build/native/nativeCompile

dname="${dname:-CN=cas.example.org,OU=Example,OU=Org,C=US}"
subjectAltName="${subjectAltName:-dns:example.org,dns:localhost,ip:127.0.0.1}"
keystore="/etc/cas/thekeystore"
sudo mkdir -p /etc/cas
printgreen "Generating keystore ${keystore} for CAS with DN=${dname}, SAN=${subjectAltName}"
[ -f "${keystore}" ] && sudo rm "${keystore}"
sudo keytool -genkey -noprompt -alias cas -keyalg RSA -keypass changeit -storepass changeit \
  -keystore "${keystore}" -dname "${dname}" -ext SAN="${subjectAltName}"
printgreen "Launching CAS native image..."  
./build/native/nativeCompile/cas --spring.profiles.active=native &
pid=$!
sleep 15
kill -9 $pid
[ "$CI" = "true" ] && pkill java
exit 0
