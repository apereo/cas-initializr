#!/usr/bin/env sh

# #  -d casVersion=6.5.1 -d bootVersion=2.6.3 \
rm -Rf ./tmp
curl -k http://localhost:8080/starter.tgz -d dependencies="$1" \
  -d type=cas-management-overlay -d baseDir=tmp | tar -xzvf -
