#!/bin/bash

source ./ci/functions.sh

CAS_VERSION=${1:-$DEFAULT_CAS_VERSION}
BOOT_VERSION=${2:-$DEFAULT_BOOT_VERSION}

java -jar app/build/libs/app.jar &
pid=$!
sleep 30
mkdir tmp
cd tmp
curl http://localhost:8080/starter.tgz --connect-timeout 30 \
   -d "casVersion=${CAS_VERSION}&bootVersion=${BOOT_VERSION}" | tar -xzvf -
kill -9 $pid

./gradlew clean build
downloadTomcat
mv build/libs/cas.war ${CATALINA_HOME}/webapps/cas.war

${CATALINA_HOME}/bin/startup.sh & >/dev/null 2>&1
pid=$!
sleep 30
rc=`curl -L -k -u casuser:password -o /dev/null --connect-timeout 60 -s  -I -w "%{http_code}" http://localhost:8080/cas/login`
${CATALINA_HOME}/bin/shutdown.sh & >/dev/null 2>&1
kill -9 $pid
if [ "$rc" == 200 ]; then
    echo "Deployed the web application successfully."
else
    echo "Failed to deploy the web application with status $rc."
    exit 1
fi

echo "Running CAS Overlay as an executable WAR file"
./gradlew clean build -Pexecutable=true
./build/libs/cas.war --spring.profiles.active=none --server.ssl.enabled=false --server.port=8090 &
pid=$!
sleep 15
echo "Launched executable CAS with pid ${pid}. Waiting for CAS server to come online..."
until curl -k -L --output /dev/null --silent --fail http://localhost:8090/cas/login; do
   echo -n '.'
   sleep 5
done
echo -e "\n\nReady!"
kill -9 $pid

echo "Running CAS Overlay with bootRun"
./gradlew clean build bootRun -Dserver.ssl.enabled=false -Dserver.port=8090 &
pid=$!
sleep 15
echo "Launched CAS with pid ${pid} using bootRun. Waiting for CAS server to come online..."
until curl -k -L --output /dev/null --silent --fail http://localhost:8090/cas/login; do
   echo -n '.'
   sleep 5
done
echo -e "\n\nReady!"
kill -9 $pid

chmod -R 777 ./*.sh >/dev/null 2>&1

#echo "Building Docker image with Spring Boot"
#./gradlew bootBuildImage

declare -a platforms=("amd64:linux" "arm64:linux")
for platform in "${platforms[@]}"
do
  echo "Building Docker image $platform with Jib"
  ./gradlew jibDockerBuild -PdockerImagePlatform="${platform}" \
    -DdockerUsername="$DOCKER_USER" -DdockerPassword="$DOCKER_PWD"
  [ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1
  publishDockerImage
done

echo "Verify Java Version"
./gradlew verifyRequiredJavaVersion
[ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1

echo "Downloading Shell"
./gradlew downloadShell
[ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1

echo "Listing Views"
./gradlew listTemplateViews
[ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1

echo "Fetching HTML resource"
./gradlew getResource -PresourceName=casGenericSuccessView
[ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1

echo "Fetching message bundle"
./gradlew getResource -PresourceName=messages.properties
[ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1

echo "Creating ZIP archive"
./gradlew zip
[ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1

echo "Configuration Metadata Export"
./gradlew exportConfigMetadata
[ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1

echo "Unzip WAR"
./gradlew unzip
[ $? -eq 0 ] && echo "Gradle command ran successfully." || exit 1

echo "Build Container Image w/ Docker"
./docker-build.sh

echo "Build Container Image w/ Docker Compose"
docker-compose build
