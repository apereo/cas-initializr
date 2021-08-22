#!/bin/bash

source ./ci/functions.sh

CAS_VERSION=${1:-$DEFAULT_CAS_VERSION}
BOOT_VERSION=${2:-$DEFAULT_BOOT_VERSION}

java -jar app/build/libs/app.jar &
pid=$!
sleep 15
rm -Rf tmp &> /dev/null
mkdir tmp
cd tmp
curl http://localhost:8080/starter.tgz -d casVersion=${CAS_VERSION} -d bootVersion=${BOOT_VERSION} -d type=cas-management-overlay -d dependencies="jpasvc" | tar -xzvf -
kill -9 $pid

echo "Building CAS Mgmt Overlay"
./gradlew clean build --no-daemon

dname="${dname:-CN=cas.example.org,OU=Example,OU=Org,C=US}"
subjectAltName="${subjectAltName:-dns:example.org,dns:localhost,ip:127.0.0.1}"
keystore=./keystore.jks
echo -e "\nGenerating keystore ${keystore} for CAS with DN=${dname}, SAN=${subjectAltName} ..."
[ -f "${keystore}" ] && sudo rm "${keystore}"
sudo keytool -genkey -noprompt -alias cas -keyalg RSA -keypass changeit -storepass changeit \
    -keystore "${keystore}" -dname "${dname}" -ext SAN="${subjectAltName}"
[ -f "${keystore}" ] && echo "Created ${keystore}"

echo "Launching CAS Mgmt Overlay"
touch ./users.json
java -jar build/libs/cas-management.war --mgmt.cas-sso=false --mgmt.authz-ip-regex=.+ \
    --server.port=8081 --spring.profiles.active=none --mgmt.user-properties-file=file:${PWD}/users.json \
    --server.ssl.key-store=${keystore} &
pid=$!
sleep 10
echo "Launched CAS with pid ${pid}. Waiting for server to come online..."
echo "Waiting for server to come online..."
until curl -k -L --fail https://localhost:8081/cas-management; do
    echo -n '.'
    sleep 10
done
echo -e "\n\nReady!"
kill -9 $pid

echo "Build Container Image w/ Docker"
chmod +x "*.sh"  >/dev/null 2>&1
./docker-build.sh

echo "Building Docker image with Jib"
./gradlew jibDockerBuild

downloadTomcat
mv build/libs/cas-management.war ${CATALINA_HOME}/webapps/app.war

${CATALINA_HOME}/bin/startup.sh & >/dev/null 2>&1
pid=$!
sleep 30
rc=`curl -L -k -u casuser:password -o /dev/null --connect-timeout 60 -s  -I -w "%{http_code}" http://localhost:8080/app`
${CATALINA_HOME}/bin/shutdown.sh & >/dev/null 2>&1
kill -9 $pid
if [ "$rc" == 302 ]; then
    echo "Deployed the web application successfully."
else
    echo "Failed to deploy the web application with status $rc."
    exit 1
fi

publishDockerImage
