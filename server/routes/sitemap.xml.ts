/**
 * The sitemap, built from Storyblok's own link list so it cannot drift from the
 * site. Every story appears once per locale, each entry carrying the alternates
 * search engines use to tie the five language versions together.
 *
 * It matters more than usual here: six pages are reachable only through a menu
 * that renders its links in the browser, and the clinical centre pages are deep
 * in the tree, so without this a crawler would never reach them.
 */
const LOCALES = [
  { code: 'en', hreflang: 'en-GB', prefix: '' },
  { code: 'de', hreflang: 'de-DE', prefix: '/de' },
  { code: 'fr', hreflang: 'fr-FR', prefix: '/fr' },
  { code: 'es', hreflang: 'es-ES', prefix: '/es' },
  { code: 'it', hreflang: 'it-IT', prefix: '/it' },
]

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = config.storyblokAccessToken
  const base = (config.public.siteUrl || '').replace(/\/+$/, '')
  if (!token) throw createError({ statusCode: 503, statusMessage: 'Sitemap unavailable' })

  const region = config.storyblokRegion === 'eu' ? '' : `-${config.storyblokRegion}`
  const version = config.public.storyblokVersion === 'draft' ? 'draft' : 'published'

  type Link = { slug: string, is_folder: boolean, published_at?: string }
  const links: Link[] = []
  for (let page = 1; page < 20; page++) {
    const res = await $fetch<{ links: Record<string, Link> }>(
      `https://api${region}.storyblok.com/v2/cdn/links`,
      { query: { version, per_page: 1000, page, token } },
    ).catch(() => null)
    if (!res) break
    const batch = Object.values(res.links)
    links.push(...batch)
    if (batch.length < 1000) break
  }

  const paths = links
    .filter(l => !l.is_folder && !/(^|\/)global(\/|$)/.test(l.slug))
    .map(l => ({ path: l.slug === 'home' ? '' : `/${l.slug.replace(/\/+$/, '')}`, lastmod: l.published_at }))
    .sort((a, b) => a.path.localeCompare(b.path))

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
      .replace('www.sitemap.org', 'www.sitemaps.org'),
    // Only the English root carries a trailing slash; everything else is the
    // bare path, matching what the canonical tags and the redirects say.
    ...paths.flatMap(({ path, lastmod }) => {
      const url = (prefix: string) => `${base}${prefix}${path}` === base ? `${base}/` : `${base}${prefix}${path}`
      return LOCALES.map(l => [
        '  <url>',
        `    <loc>${url(l.prefix)}</loc>`,
        ...LOCALES.map(alt =>
          `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${url(alt.prefix)}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${base}${path || '/'}"/>`,
        ...(lastmod ? [`    <lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>`] : []),
        '  </url>',
      ].join('\n'))
    }),
    '</urlset>',
  ].join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return xml
})
