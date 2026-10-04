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

# The test site answers on a public hostname, and the committed robots.txt
# allows everything and points at the production sitemap. Left alone, a crawler
# could index the staging copy and have it compete with surgerii.com. The real
# robots.txt is not touched; only the copy inside this build is replaced.
printf 'User-agent: *\nDisallow: /\n' > .output/public/robots.txt

rsync -rlz --delete --exclude '/.well-known' .output/public/ "$HOST:www/"
echo "Deployed to https://surgeriicom.webhosting.be"
