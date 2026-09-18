#!/usr/bin/env bash
#
# Install the GitHub App credentials as Worker secrets.
#
# GitHub hands out a PKCS#1 private key, which WebCrypto cannot import, and it
# lands in a downloads folder where it does not belong. This converts it in a
# temporary directory, installs it, and shreds the converted copy on exit, so
# the usable key exists on disk only while this script runs. The original is
# left alone: deleting someone's downloaded key is their call, not this
# script's, so it prints the command instead.
#
#   ./scripts/install-github-secrets.sh ~/Downloads/your-app.private-key.pem
#
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: ${0##*/} <path-to-github-app-private-key.pem>" >&2
  exit 64
fi

source_key=$1
if [ ! -r "$source_key" ]; then
  echo "cannot read $source_key" >&2
  exit 66
fi

cd "$(dirname "$0")/.."

workdir=$(mktemp -d)
trap 'rm -rf "$workdir"' EXIT
chmod 700 "$workdir"
pkcs8="$workdir/pkcs8.pem"

openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in "$source_key" -out "$pkcs8"
if ! grep -q 'BEGIN PRIVATE KEY' "$pkcs8"; then
  echo "conversion did not produce a PKCS#8 key; is $source_key really a GitHub App key?" >&2
  exit 65
fi
echo "Converted to PKCS#8."

read -r -p 'GitHub App ID: ' app_id
read -r -p 'Installation ID: ' installation_id
for value in "$app_id" "$installation_id"; do
  if ! [[ $value =~ ^[0-9]+$ ]]; then
    echo "App ID and Installation ID are numeric; got '$value'." >&2
    echo "The Installation ID is the number at the end of the URL when you open" >&2
    echo "the installation: github.com/settings/installations/<THIS>" >&2
    exit 65
  fi
done

printf '%s' "$app_id" | npx wrangler secret put GITHUB_APP_ID
printf '%s' "$installation_id" | npx wrangler secret put GITHUB_INSTALLATION_ID
npx wrangler secret put GITHUB_PRIVATE_KEY < "$pkcs8"

cat <<EOF

Installed. The Worker picks these up on its next request; no deploy needed.

The downloaded key is still at:
  $source_key
It is no longer needed — GitHub cannot show it again either, so if you want a
copy keep it in a password manager, not a downloads folder. To remove it:
  rm -P "$source_key"
EOF
