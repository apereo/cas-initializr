#!/bin/bash

source ./ci/functions.sh

CAS_VERSION=${1}
BOOT_VERSION=${2}
BRANCH=${3:-master}
TYPE=${4:-cas-overlay}

if [ -z "$GH_TOKEN" ] ; then
  echo -e "\nNo GitHub token is defined."
  exit 1
fi
if [[ -z "$CAS_VERSION" || -z "$BOOT_VERSION" ]]; then
  echo "Usage: $0 [CAS_VERSION] [BOOT_VERSION] [BRANCH] [TYPE]"
  exit 1
fi
case "${TYPE}" in
  cas-overlay)
    repoName="cas-overlay-template"
    ;;
  cas-config-server-overlay)
    repoName="cas-configserver-overlay"
    ;;
  cas-management-overlay)
    repoName="cas-management-overlay"
    ;;
esac

mkdir tmp
cd tmp || exit
ls
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
warning="${warning}This repository is always automatically generated from the [CAS Initializr](https://github.com/apereo/cas-initializr). "
warning="${warning}Do NOT submit pull requests here as the change-set will be overwritten on the next sync. "
warning="${warning}To learn more, please visit the [CAS documentation](https://apereo.github.io/cas)."
warning="${warning}<br/>******************************************************<br/>"
text=$(echo "${warning}"; cat README.md)
echo "Updating project README with warning..."
echo "${text}" > README.md

echo "Committing changes..."
ls
git status
git add -A .
git commit -am "Synced repository from CAS Initializr"
git status

echo "Pushing changes to branch ${BRANCH}"
git push --set-upstream origin ${BRANCH} --force
if [ $? -ne 0 ] ; then
  echo "Could not successfully push changes to the repository branch"
  exit 1
fi

echo "Authenticating with GitHub..."
gh auth login --with-token <<< "$GH_TOKEN"
timestamp=$(date +%Y%m%d%H%M%S)
echo "Creating GitHub Release ${timestamp} for repository ${repoName}"
gh release create ${timestamp} --repo apereo/"${repoName}" --title "Release ${timestamp}" --notes "CAS: ${CAS_VERSION}"
#echo "Uploading release assets for repository ${repoName}"
#gh release upload ${timestamp} ./path/to/asset.zip

echo "Done"
exit 0
