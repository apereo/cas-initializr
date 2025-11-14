#!/bin/bash

source ./ci/functions.sh

FETCH_OVERLAY="false"
while (( "$#" )); do
    case "$1" in
    --fetch-only)
        FETCH_OVERLAY="true"
        shift 1
        ;;
    --cas)
        CAS_VERSION="$2"
        shift 2
        ;;
    esac
done

CAS_MAJOR_VERSION=`echo $CAS_VERSION | cut -d. -f1`
CAS_MINOR_VERSION=`echo $CAS_VERSION | cut -d. -f2`

if [[ "${FETCH_OVERLAY}" == "true" ]]; then
  parameters="casVersion=${CAS_VERSION}&nativeImageSupported=true"
  java -jar app/build/libs/app.jar &
  pid=$!
  sleep 25
  printgreen "Requesting CAS overlay for ${parameters}"
  mkdir tmp
  cd tmp || exit
  curl http://localhost:8080/starter.tgz --connect-timeout 30 -d "${parameters}" | tar -xzvf -
  if [ $? -ne 0 ]; then
      printred "Failed to download CAS overlay from CAS Initializr"
      exit 1
  fi
  kill -9 $pid
  [ "$CI" = "true" ] && pkill java
  printgreen "Working directory: ${PWD}"
  ls
  printgreen "Downloaded CAS overlay ${CAS_VERSION} successfully."
  exit 0
fi

cd tmp || exit
printgreen "Working directory: ${PWD}"

if [[ -d /tmp ]] ; then
  sudo mkdir /tmp
fi

JAVA_VERSION=$(getJavaMajorVersion)
printgreen "Building CAS Native Image using Java ${JAVA_VERSION}. This may take several minutes..."
./gradlew clean build nativeCompile \
  -PnativeImage=true \
  -PtargetCompatibility="${JAVA_VERSION}" \
  -PsourceCompatibility="${JAVA_VERSION}" \
  --warning-mode all \
  --no-daemon --no-configuration-cache

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
if [[ $? -ne 0 ]]; then
  printred "Unable to create CAS keystore ${keystore}"
  exit 1
fi

printgreen "Launching CAS native image..."  
./build/native/nativeCompile/cas -XX:StartFlightRecording=filename=recording.jfr --spring.profiles.active=native &
pid=$!
sleep 15
curl -k -L --connect-timeout 10 --output /dev/null --silent --fail https://localhost:8443/cas/login
if [[ $? -ne 0 ]]; then
  printred "CAS native image failed to launch"
  exit 1
fi
kill -9 $pid
[ "$CI" = "true" ] && pkill java
exit 0
