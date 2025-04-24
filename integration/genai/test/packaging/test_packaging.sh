#!/usr/bin/env bash

set -ex

npm pack

PACKAGE_VERSION=$(jq -r .version package.json)
TARBALL="google-genai-${PACKAGE_VERSION}.tgz"

# Verify that the tarball exists
if [ ! -f "${TARBALL}" ]; then
  echo "Error: Tarball ${TARBALL} was not created."
  exit 1
fi

cd sdk-samples
npm install "../${TARBALL}"
npm run build
