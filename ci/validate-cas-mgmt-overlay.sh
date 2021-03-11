#!/bin/bash

source ./ci/functions.sh

java -jar app/build/libs/app.jar &
pid=$!
sleep 15
rm -Rf tmp &> /dev/null
mkdir tmp
cd tmp
curl http://localhost:8080/starter.tgz -d type=cas-management-overlay -d dependencies="jpasvc" | tar -xzvf -
kill -9 $pid

echo "Building CAS Mgmt Overlay"
./gradlew clean build --no-daemon

echo "Launching CAS Mgmt Overlay"
touch ./users.json
java -jar build/libs/app.war --spring.profiles.active=none --mgmt.user-properties-file=file:${PWD}/users.json --server.ssl.enabled=false &
pid=$!
sleep 5
echo "Launched CAS with pid ${pid}. Waiting for server to come online..."
echo "Waiting for server to come online..."
until curl -k -L --fail http://localhost:8443/cas-management; do
    echo -n '.'
    sleep 5
done
echo -e "\n\nReady!"
kill -9 $pid

echo "Build Container Image w/ Docker"
chmod +x "*.sh"  >/dev/null 2>&1
./docker-build.sh

echo "Building Docker image with Jib"
./gradlew jibDockerBuild

downloadTomcat
mv build/libs/app.war ${CATALINA_HOME}/webapps/app.war

export MGMT_USER-PROPERTIES-FILE=file:${PWD}/users.json
${CATALINA_HOME}/bin/startup.sh & >/dev/null 2>&1
pid=$!
sleep 30
rc=`curl -L -k -u casuser:password -o /dev/null --connect-timeout 60 -s  -I -w "%{http_code}" http://localhost:8080/app`
${CATALINA_HOME}/bin/shutdown.sh & >/dev/null 2>&1
kill -9 $pid
if [ "$rc" == 200 ]; then
    echo "Deployed the web application successfully."
else
    echo "Failed to deploy the web application with status $rc."
    exit 1
fi

publishDockerImage
