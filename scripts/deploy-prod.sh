#!/usr/bin/env bash
# Builds the production site from PUBLISHED Storyblok content and uploads it to
# the Combell hosting that serves surgerii.com.
#
# This replaces whatever is in /www, which today is the staging draft export:
# that build carries `noindex, nofollow`, a `Disallow: /` robots.txt and
# canonicals pointing at surgeriicom.webhosting.be, none of which belong on the
# production domain.
#
# The site is fully prerendered and both forms post to HubSpot from the browser,
# so it needs no Node.js backend. The server/ routes are fallbacks that do not
# run when HubSpot is configured, which it is.
set -euo pipefail
cd "$(dirname "$0")/.."

HOST=surgeriicom@ssh084.webhosting.be

NUXT_PUBLIC_SITE_URL=https://surgerii.com \
NUXT_PUBLIC_STORYBLOK_VERSION=published \
  npx nuxt generate

# The committed robots.txt is the production one: it allows crawling and points
# at the production sitemap. Assert rather than assume, because the staging
# deploy overwrites this file inside its own build.
grep -q 'Disallow: *$' .output/public/robots.txt \
  || { echo "robots.txt is not the production one, stopping"; exit 1; }
grep -q 'surgerii.com/sitemap.xml' .output/public/robots.txt \
  || { echo "robots.txt does not point at the production sitemap, stopping"; exit 1; }

# A published build must not carry the staging noindex.
if grep -rqs 'noindex, nofollow' .output/public/index.html; then
  echo "index.html still carries noindex, stopping"; exit 1
fi

# Canonicals must name the production domain.
grep -q 'rel="canonical" href="https://surgerii.com' .output/public/index.html \
  || { echo "canonical is not surgerii.com, stopping"; exit 1; }

echo "Checks passed. Uploading to $HOST:www/"
rsync -rlz --delete --exclude '/.well-known' .output/public/ "$HOST:www/"
echo "Deployed to https://surgerii.com (once the domain is switched Active in Combell)"
