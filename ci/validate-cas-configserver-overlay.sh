#!/bin/bash

source ./ci/functions.sh

java -jar app/build/libs/app.jar &
pid=$!
sleep 15
rm -Rf tmp &> /dev/null
mkdir tmp
cd tmp
curl http://localhost:8080/starter.tgz -d type=cas-config-server-overlay | tar -xzvf -
kill -9 $pid

echo "Building CAS Config Server Overlay"
./gradlew clean build --no-daemon

sudo mkdir /etc/cas
dname="${dname:-CN=cas.example.org,OU=Example,OU=Org,C=US}"
subjectAltName="${subjectAltName:-dns:example.org,dns:localhost,ip:127.0.0.1}"
keystore=/etc/cas/casconfigserver.jks
echo -e "\nGenerating keystore ${keystore} for CAS with DN=${dname}, SAN=${subjectAltName} ..."
[ -f "${keystore}" ] && sudo rm "${keystore}"
sudo keytool -genkey -noprompt -alias cas -keyalg RSA -keypass changeit -storepass changeit \
                  -keystore "${keystore}" -dname "${dname}" -ext SAN="${subjectAltName}"
[ -f "${keystore}" ] && echo "Created ${keystore}"


java -jar build/libs/app.war --server.ssl.enabled=false --spring.security.user.password=password --spring.security.user.name=casuser &
pid=$!
sleep 5

echo "Launched CAS with pid ${pid}. Waiting for server to come online..."
until curl -u casuser:password -k -L --output /dev/null --silent --fail http://localhost:8888/casconfigserver/env/default; do
    echo -n '.'
    sleep 5
done
echo -e "\n\nReady!"
kill -9 $pid

echo "Building Docker image with Jib"
chmod -R 777 ./*.sh >/dev/null 2>&1
./gradlew jibDockerBuild

downloadTomcat
mv build/libs/app.war ${CATALINA_HOME}/webapps/app.war

export SPRING_SECURITY_USER_PASSWORD=password
export SPRING_SECURITY_USER_NAME=casuser

${CATALINA_HOME}/bin/startup.sh & >/dev/null 2>&1
pid=$!
sleep 30
rc=`curl -L -k -u casuser:password -o /dev/null --connect-timeout 60 -s  -I -w "%{http_code}" http://localhost:8080/app/env/default`
${CATALINA_HOME}/bin/shutdown.sh & >/dev/null 2>&1
kill -9 $pid
if [ "$rc" == 200 ]; then
    echo "Deployed the web application successfully."
else
    echo "Failed to deploy the web application with status $rc."
    exit 1
fi

publishDockerImage
