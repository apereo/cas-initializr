#!/bin/bash

source ./ci/functions.sh

FETCH_OVERLAY="false"
APP_SERVER="tomcat"
JVM_VENDOR=""

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
    --jvm-vendor)
        JVM_VENDOR="$2"
        shift 2
        ;;
    --app-server)
        APP_SERVER="$2"
        shift 2
        ;;
    --apache-tomcat)
        TOMCAT_VERSION="$2"
        shift 2
        ;;
    esac
done

CAS_MAJOR_VERSION=`echo $CAS_VERSION | cut -d. -f1`
CAS_MINOR_VERSION=`echo $CAS_VERSION | cut -d. -f2`
CAS_PATCH_VERSION=`echo $CAS_VERSION | cut -d. -f3`

mkdir -p tmp
cd tmp || exit
echo "Working directory: ${PWD}"
if [[ "${FETCH_OVERLAY}" == "true" ]]; then
  parameters="casVersion=${CAS_VERSION}&dependencyCoordinates=cas-server-support-rest"
  if [ ! -z "${APP_SERVER}" ]; then
    printgreen "Requesting application server ${APP_SERVER}"
    parameters="${parameters}&dependencies=webapp-${APP_SERVER}"
  fi
  java -jar ../app/build/libs/app.jar &
  pid=$!
  sleep 30
  printgreen "Requesting CAS overlay for ${parameters}"
  curl http://localhost:8080/starter.tgz --connect-timeout 30 -d "${parameters}" | tar -xzvf -
  kill -9 $pid
  echo -e "CAS overlay is downloaded into directory: " && echo "$PWD"
  [ "$CI" = "true" ] && pkill java
  ls
  printgreen "Downloaded CAS overlay ${CAS_VERSION} successfully."

  if [[ -n "${JVM_VENDOR}" ]]; then
    printgreen "Chosen JVM vendor: ${JVM_VENDOR}"
    cd $PWD
    printgreen "Building CAS overlay in $PWD"
    ./gradlew clean build -PjvmVendor="${JVM_VENDOR}" --warning-mode all --no-daemon
    if [[ $? -ne 0 ]]; then 
      printred "Failed to build CAS overlay ${CAS_VERSION} with JVM vendor ${JVM_VENDOR}"
      exit 1
    fi
  fi
  exit 0
fi

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

printgreen "Building CAS overlay in $PWD"
./gradlew clean build --warning-mode all --no-daemon

printgreen "Running CAS overlay with Gradle"
ls -al
./gradlew run -Dspring.profiles.active=none -Dserver.ssl.enabled=false -Dserver.port=8080 &
pid=$!
sleep 80
rc=$(curl -L -k -u casuser:password -o /dev/null --connect-timeout 60 -s  -I -w "%{http_code}" http://localhost:8080/cas/login)
kill -9 $pid
if [ "$rc" == 200 ]; then
    printgreen "Deployed the CAS web application successfully."
else
    printred "Failed to deploy the CAS web application with status $rc."
    exit 1
fi
[ "$CI" = "true" ] && pkill java

if [ "${APP_SERVER}" == "tomcat" ]; then
  printgreen "Downloading Apache Tomcat $TOMCAT_VERSION"
  downloadTomcat "$TOMCAT_VERSION"
  mv build/libs/cas.war ${CATALINA_HOME}/webapps/cas.war

  printgreen "Starting Apache Tomcat $TOMCAT_VERSION to deploy ${CATALINA_HOME}/webapps/cas.war"
  "${CATALINA_HOME}"/bin/startup.sh & >/dev/null 2>&1
  pid=$!
  sleep 30
  rc=$(curl -L -k -u casuser:password -o /dev/null --connect-timeout 60 -s  -I -w "%{http_code}" http://localhost:8080/cas/login)
  "${CATALINA_HOME}"/bin/shutdown.sh & >/dev/null 2>&1
  kill -9 $pid
  if [ "$rc" == 200 ]; then
      printgreen "Deployed the web application successfully."
  else
      printred "Failed to deploy the web application with status $rc."
      exit 1
  fi
  [ "$CI" = "true" ] && pkill java
fi
#ps -ef

printgreen "Running CAS Overlay as an executable WAR file"
./gradlew clean build -Pexecutable=true --no-daemon
./build/libs/cas.war --spring.profiles.active=none --cas.service-registry.core.init-from-json=true \
  --server.ssl.enabled=false --server.port=8090 &
pid=$!
sleep 15
echo "Launched executable CAS with pid ${pid}. Waiting for CAS server to come online..."
until curl -k -L --output /dev/null --silent --fail http://localhost:8090/cas/login; do
   echo -n '.'
   sleep 5
done
echo -e "\n\nReady!"

if [ "$CAS_MAJOR_VERSION" -ge 7 ]; then
    echo "Running duct against CAS Overlay $CAS_VERSION"
    ./gradlew --no-daemon duct -Pduct.service=https://apereo.github.io \
      -Pduct.cas.1=http://localhost:8090/cas -Pduct.debug=true -Pduct.count=1
    [ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1
fi

echo "Killing process $pid"
kill -9 $pid
[ "$CI" = "true" ] && pkill java
#ps -ef
printgreen "Running Puppeteer test scenarios"
chmod +x ./puppeteer/run.sh
export PUPPETEER_CAS_HOST="http://localhost:8090"
export CAS_ARGS="--spring.profiles.active=none --cas.service-registry.core.init-from-json=true --server.ssl.enabled=false --server.port=8090"

./puppeteer/run.sh
[ $? -eq 0 ] && printgreen "Puppeteer ran successfully." || exit 1
[ "$CI" = "true" ] && pkill java

printgreen "Running CAS Overlay with bootRun"
./gradlew --no-daemon clean build bootRun -Dserver.ssl.enabled=false -Dserver.port=8091 &
pid=$!
sleep 15
printgreen "Launched CAS with pid ${pid} using bootRun. Waiting for CAS server to come online..."
until curl -k -L --output /dev/null --silent --fail http://localhost:8091/cas/login; do
   echo -n '.'
   sleep 5
done
echo -e "\n\nReady!"
echo "Killing process $pid"
kill -9 $pid
[ "$CI" = "true" ] && pkill java
# ps -ef
chmod -R 777 ./*.sh >/dev/null 2>&1

if [[ "$CAS_MAJOR_VERSION" -ge 7 ]]; then
    printgreen "Building Docker image with Spring Boot"
    ./gradlew --no-daemon bootBuildImage
fi

printgreen "Building Docker image with Jib"
publishDockerImage

printgreen "Verify Java Version"
./gradlew --no-daemon verifyRequiredJavaVersion
[ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1

printgreen "Downloading Shell"
./gradlew --no-daemon downloadShell runShell
[ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1

printgreen "Listing Views"
./gradlew --no-daemon listTemplateViews
[ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1

printgreen "Fetching HTML resource"
./gradlew --no-daemon getResource -PresourceName=casGenericSuccessView
[ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1

printgreen "Fetching message bundle"
./gradlew --no-daemon getResource -PresourceName=messages.properties
[ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1

printgreen "Creating ZIP archive"
./gradlew --no-daemon zip
[ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1

printgreen "Configuration Metadata Export"
./gradlew --no-daemon exportConfigMetadata
[ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1

printgreen "Unzip WAR"
./gradlew --no-daemon unzip
[ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1

printgreen "Build Container Image w/ Docker"
./gradlew casBuildDockerImage

printgreen "Build Container Image w/ Docker Compose"
docker compose build

if [[ "$CAS_MAJOR_VERSION" -ge 7 ]]; then
  # targetVersion=${CAS_VERSION%-SNAPSHOT}
  targetVersion="${CAS_VERSION}"
  
  printgreen "OpenRewrite to discover recipes for target version ${targetVersion}..."
  recipes=$(./gradlew --init-script openrewrite.gradle rewriteDiscover -PtargetVersion="${targetVersion}" | grep "org.apereo.cas")
  if [ -z "$recipes" ] ; then
    printred "\nNo OpenRewrite recipes could be found."
    exit 1
  fi
  printgreen "Discovered OpenRewrite recipes: ${recipes}"

  recipeName="org.apereo.cas.cas${CAS_MAJOR_VERSION}${CAS_MINOR_VERSION}${CAS_PATCH_VERSION%-SNAPSHOT}"
  printgreen "OpenRewrite to dry-run recipe ${recipeName}..."
  ./gradlew --init-script openrewrite.gradle rewriteDryRun \
    -PtargetVersion="${targetVersion}" -DactiveRecipe="$recipeName"
  [ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1

  if [[ "$CAS_MINOR_VERSION" -ge 1 ]]; then
    printgreen "Build CAS web application without executable mode..."
    ./gradlew clean build -Pexecutable=false --no-daemon
    
    printgreen "Extracting Uber WAR from CAS to prepare CDS launch..."
    java -Djarmode=tools -jar build/libs/cas.war extract
    java -jar ./cas/cas.war --spring.profiles.active=none --server.ssl.enabled=false --server.port=8091 &
    pid=$!
    sleep 15
    echo "Launched executable CAS with pid ${pid}. Waiting for CAS server to come online..."
    until curl -k -L --output /dev/null --silent --fail http://localhost:8091/cas/login; do
       echo -n '.'
       sleep 5
    done
    echo -e "\n\nReady!"
    echo "Killing process $pid"
    kill -9 $pid
    [ "$CI" = "true" ] && pkill java
  fi
fi

[ "$CI" = "true" ] && pkill java
exit 0
