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

read -r -p 'GitHub App ID (the numeric one, not the Client ID): ' app_id
if ! [[ $app_id =~ ^[0-9]+$ ]]; then
  echo "The App ID is numeric; got '$app_id'. The Client ID (Iv23...) is a different value." >&2
  exit 65
fi

# The installation id is the value most easily read off the wrong page, so ask
# GitHub for it rather than the operator.
echo "Asking GitHub which installations this app has."
if ! installations=$(node scripts/github-installations.mjs "$app_id" "$pkcs8"); then
  echo "Could not list installations. Install the app on the repository first." >&2
  exit 65
fi
printf '%s\n' "$installations" | while IFS=$'\t' read -r id account selection; do
  echo "  $id  $account  ($selection)"
done

installation_count=$(printf '%s\n' "$installations" | grep -c .)
if [ "$installation_count" -eq 1 ]; then
  installation_id=$(printf '%s' "$installations" | cut -f1)
  echo "Using installation $installation_id."
else
  read -r -p 'Installation ID (from the list above): ' installation_id
fi

if ! [[ $installation_id =~ ^[0-9]+$ ]]; then
  echo "The Installation ID is numeric; got '$installation_id'." >&2
  exit 65
fi

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
