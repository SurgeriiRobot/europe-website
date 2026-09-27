#!/usr/bin/env bash
# Builds the test site from Storyblok draft content and uploads it to the
# Combell hosting at https://surgeriicom.webhosting.be. Needs your SSH key to be
# registered in the Combell panel (Web hosting -> FTP & SSH -> SSH keys).
set -euo pipefail
cd "$(dirname "$0")/.."

HOST=surgeriicom@ssh084.webhosting.be

NUXT_PUBLIC_SITE_URL=https://surgeriicom.webhosting.be \
NUXT_PUBLIC_STORYBLOK_VERSION=draft \
  npx nuxt generate

rsync -rlz --delete --exclude '/.well-known' .output/public/ "$HOST:www/"
echo "Deployed to https://surgeriicom.webhosting.be"
