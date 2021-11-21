#!/bin/bash

source ./ci/functions.sh

CAS_VERSION=${1:-$DEFAULT_CAS_VERSION}
BOOT_VERSION=${2:-$DEFAULT_BOOT_VERSION}
BRANCH=${3:-master}
TYPE=${4:-cas-overlay}

java -jar app/build/libs/app.jar &
pid=$!
sleep 15
mkdir tmp
cd tmp

case "${TYPE}" in
   cas-overlay)
     repoName="cas-overlay-template"
     ;;
  cas-management-overlay)
     repoName="cas-management-overlay"
     ;;
esac

echo "Building Overlay ${TYPE}:${CAS_VERSION} with Spring Boot ${BOOT_VERSION} for branch ${BRANCH}"
curl http://localhost:8080/starter.tgz \
  -d baseDir=initializr \
  -d type="${TYPE}" \
  -d "casVersion=${CAS_VERSION}&bootVersion=${BOOT_VERSION}" | tar -xzvf -
kill -9 $pid

if [ -z "$GH_TOKEN" ] ; then
  echo -e "\nNo GitHub token is defined."
  exit 1
fi

echo "Configuring git for repository ${repoName}..."
cd ./initializr && pwd
git init
echo "Adding remote origin for repository ${repoName}..."
git remote add origin https://${GH_TOKEN}@github.com/apereo/"${repoName}"
git config user.email "cas@apereo.org"
git config user.name "CAS"

echo "Checking out branch ${BRANCH}"
git switch ${BRANCH} 2>/dev/null || git switch -c ${BRANCH};

echo "Checking repository status..."
git status

echo "Updating project README"
warning="# IMPORTANT NOTE<br/>"
warning="${warning}******************************************************<br/>"
warning="${warning}This repository is always automatically generated from the CAS Initializr. "
warning="${warning}Do NOT submit pull requests here as the change-set will be overwritten on the next sync."
warning="${warning}To learn more, please visit the [CAS documentation](https://apereo.github.io/cas)."
warning="${warning}<br/>******************************************************<br/>"
text=$(echo "${warning}"; cat README.md)
echo "Updating project README with warning..."
echo "${text}" > README.md

echo "Committing changes..."
git add --all
git commit -am "Synced repository from CAS Initializr"
git status

echo "Pushing changes to branch ${BRANCH}"
git push --set-upstream origin ${BRANCH} --force
if [ $? -ne 0 ] ; then
  echo "Could not successfully push changes to the repository branch"
  exit 1
fi
echo "Done"
exit 0
