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

mkdir -p tmp
cd tmp || exit
echo "Working directory: ${PWD}"

if [[ "${FETCH_OVERLAY}" == "true" ]]; then
java -jar ../app/build/libs/app.jar &
  pid=$!
  sleep 30
  curl http://localhost:8080/starter.tgz --connect-timeout 60 \
      -d casVersion=${CAS_VERSION} -d bootVersion=${BOOT_VERSION} \
      -d type=cas-bootadmin-server-overlay | tar -xzvf -
  kill -9 $pid
  kill -9 $pid
  ls
  printgreen "Downloaded CAS Spring Boot Admin Server overlay ${CAS_VERSION} successfully"
  exit 0
fi

echo "Building CAS Spring Boot Admin Server Overlay in ${PWD}"
./gradlew clean build --no-daemon

java -jar build/libs/casbootadminserver.war --server.ssl.enabled=false \
  --spring.security.user.password=password --spring.security.user.name=casuser &
pid=$!
sleep 5

echo "Launched CAS with pid ${pid}. Waiting for server to come online..."
until curl -u casuser:password -k -L --output /dev/null --silent --fail http://localhost:8444/; do
    echo -n '.'
    sleep 5
done
echo -e "\n\nReady!"
kill -9 $pid

echo "Building Docker image with Jib"
publishDockerImage

downloadTomcat $TOMCAT_VERSION
mv build/libs/casbootadminserver.war ${CATALINA_HOME}/webapps/app.war

export SPRING_SECURITY_USER_PASSWORD=password
export SPRING_SECURITY_USER_NAME=casuser

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
