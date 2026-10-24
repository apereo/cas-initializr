#!/bin/bash

RED="\e[31m"
GREEN="\e[32m"
YELLOW="\e[33m"
ENDCOLOR="\e[0m"

function printgreen() {
  printf "✅ ${GREEN}$1${ENDCOLOR}\n"
}
function printyellow() {
  printf "⚠️ ${YELLOW}$1${ENDCOLOR}\n"
}
function printred() {
  printf "🔥 ${RED}$1${ENDCOLOR}\n"
}

function getJavaMajorVersion() {
  majorVersion=$(java -version 2>&1 | sed -En 's/.*version "([^"]+)".*/\1/p' | sed -E 's/^1\.([0-9]+).*/\1/; s/^([0-9]+).*/\1/')
  echo "$majorVersion"
}

function downloadTomcat() {
  tomcatVersion=$1
  echo "Apache Tomcat version: ${tomcatVersion}"

  tomcatVersionTag="v${tomcatVersion}"

  tomcatMajorVersion=$(echo "$tomcatVersion" | cut -d. -f1)
  tomcatDir="tomcat-${tomcatMajorVersion}"
  
  tomcatUrl="https://archive.apache.org/dist/tomcat/${tomcatDir}/${tomcatVersionTag}/bin/apache-tomcat-${tomcatVersion}.zip"

  export CATALINA_HOME=./apache-tomcat-${tomcatVersion}
  echo "Removing ${CATALINA_HOME}"
  rm -Rf "${CATALINA_HOME}" > /dev/null 2>&1

  success=false
  if [[ ! -f "apache-tomcat-${tomcatVersion}.zip" ]]; then
    for i in $(seq 1 5); do
        echo "Attempt $i - Downloading Apache Tomcat from ${tomcatUrl}"
        wget --no-check-certificate --retry-connrefused "${tomcatUrl}" > /dev/null 2>&1 && success=true && break
        echo "Download failed. Retrying..."
        sleep 3
    done
  fi
  if [ "$success" = false ]; then
    echo "Failed to download Apache Tomcat ${tomcatVersion}"
    exit 1
  fi
  unzip apache-tomcat-"${tomcatVersion}".zip > /dev/null 2>&1
  chmod +x "${CATALINA_HOME}"/bin/*.sh > /dev/null 2>&1
  rm -Rf "${CATALINA_HOME}"/webapps/examples ${CATALINA_HOME}/webapps/docs ${CATALINA_HOME}/webapps/host-manager ${CATALINA_HOME}/webapps/manager
  touch "${CATALINA_HOME}"/logs/catalina.out ; tail -F ${CATALINA_HOME}/logs/catalina.out &
}

function publishDockerImage() {
  if [ -n "$DOCKER_USER" ] && [ -n "$DOCKER_REGISTRY_TOKEN" ]; then
    echo "Logging into Docker..."
    echo "${DOCKER_REGISTRY_TOKEN}" | docker login --username "$DOCKER_USER" --password-stdin

    echo -e "\nPublishing Docker image...\n"
    ./gradlew jib --no-configuration-cache -PdockerImagePlatform="amd64:linux,arm64:linux" \
        -DdockerUsername="$DOCKER_USER" -DdockerPassword="$DOCKER_REGISTRY_TOKEN"
    [ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1
  else
    echo -e "\nNo credentials are defined to publish Docker image\n"
  fi
}

function stopInitializr() {
  curl -X POST http://localhost:8080/actuator/shutdown 2> /dev/null || true
}

function waitForInitializr() {
  local initializrPid="${1:-}"
  local deadline=$((SECONDS + 120))
  echo "Waiting for CAS Initializr to become healthy..."
  while true; do
    if [[ -n "$initializrPid" ]] && ! kill -0 "$initializrPid" 2>/dev/null; then
      printred "CAS Initializr process ${initializrPid} exited before becoming ready."
      return 1
    fi
    if curl --output /dev/null --silent --fail --connect-timeout 5 --max-time 5 \
      http://localhost:8080/actuator/health; then
      return 0
    fi
    if (( SECONDS >= deadline )); then
      printred "CAS Initializr did not become healthy within 120 seconds."
      return 1
    fi
    sleep 3
  done
}

