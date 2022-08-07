#!/bin/bash

DEFAULT_CAS_VERSION=6.6.0-SNAPSHOT
DEFAULT_BOOT_VERSION=2.7.2
DEFAULT_MGMT_VERSION=6.5.5
DEFAULT_MGMT_BOOT_VERSION=2.6.3

function downloadTomcat() {
  tomcatVersion=$(./gradlew properties -q | grep tomcatVersion | cut -d':' -f2 | sed 's/ *//g')
  echo "Apache Tomcat version: ${tomcatVersion}"
  tomcatVersionTag="v${tomcatVersion}"

  tomcatDir="tomcat-${tomcatVersion:0:1}"
  tomcatUrl="https://downloads.apache.org/tomcat/${tomcatDir}/${tomcatVersionTag}/bin/apache-tomcat-${tomcatVersion}.zip"

  export CATALINA_HOME=./apache-tomcat-${tomcatVersion}
  rm -Rf ${CATALINA_HOME} > /dev/null 2>&1
  echo "Downloading Apache Tomcat from ${tomcatUrl}"
  wget --no-check-certificate ${tomcatUrl} > /dev/null 2>&1
  [ $? -eq 0 ] && echo "Apache Tomcat downloaded successfully." || exit 1
  unzip apache-tomcat-${tomcatVersion}.zip > /dev/null 2>&1
  chmod +x ${CATALINA_HOME}/bin/*.sh > /dev/null 2>&1
  rm -Rf ${CATALINA_HOME}/webapps/examples ${CATALINA_HOME}/webapps/docs ${CATALINA_HOME}/webapps/host-manager ${CATALINA_HOME}/webapps/manager
  touch ${CATALINA_HOME}/logs/catalina.out ; tail -F ${CATALINA_HOME}/logs/catalina.out &
}

function publishDockerImage() {
  echo -e "\nPublishing Docker image...\n"
  if [ -n "$DOCKER_USER" ] && [ -n "$DOCKER_PWD" ]; then
    echo "Logging into Docker..."
    echo "${DOCKER_PWD}" | docker login --username "$DOCKER_USER" --password-stdin
    containerImageCoords=(`./gradlew containerImageCoords --q`)
    echo "Pushing Docker image [${containerImageCoords}]"
    docker push "${containerImageCoords}"
  else
    echo -e "\nNo credentials are defined to publish Docker image\n"
  fi
}

function stopInitializr() {
  curl -X POST http://localhost:8080/actuator/shutdown 2> /dev/null || true
}

function waitForInitializr() {
  local ctr=0
  until $(curl --output /dev/null --silent --head --fail http://localhost:8080/actuator/health); do
    ((ctr=ctr + 1))
    sleep 3
    if [[ $ctr -gt 30 ]] ; then
      echo "Initializr didn't start up before timeout"
      break
    fi
  done
}

