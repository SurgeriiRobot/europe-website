import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
type StoryblokRegion = 'eu' | 'us' | 'ap' | 'ca' | 'cn'

const region = (process.env.NUXT_STORYBLOK_REGION || 'eu') as StoryblokRegion

const DEFAULT_LOCALE = 'en'
const LOCALES = [
  { code: 'en', language: 'en-GB', name: 'English', storyblok: 'default' },
  { code: 'de', language: 'de-DE', name: 'Deutsch', storyblok: 'de' },
  { code: 'fr', language: 'fr-FR', name: 'Francais', storyblok: 'fr' },
  { code: 'es', language: 'es-ES', name: 'Espanol', storyblok: 'es' },
  { code: 'it', language: 'it-IT', name: 'Italiano', storyblok: 'it' },
]

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@storyblok/nuxt', '@nuxt/fonts', '@nuxtjs/i18n'],

  css: ['~/assets/css/base.css'],

  // A draft build is a review copy (the test site) and must never be indexed.
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      meta: process.env.NUXT_PUBLIC_STORYBLOK_VERSION === 'draft'
        ? [{ name: 'robots', content: 'noindex, nofollow' }]
        : [],
      // Plausible sets no cookies and stores nothing that identifies a
      // visitor, so unlike the HubSpot and LinkedIn tags in ConsentScripts it
      // needs no consent and loads for everyone. Its own script attaches to
      // the History API, so Nuxt's client side navigation is counted without
      // anything further.
      //
      // The draft build is a review copy. It ships without the tag at all
      // rather than being filtered out afterwards, so our own testing never
      // reaches the client's figures.
      script: process.env.NUXT_PUBLIC_STORYBLOK_VERSION === 'draft'
        ? []
        : [{
            src: 'https://plausible.io/js/script.js',
            defer: true,
            'data-domain': process.env.NUXT_PUBLIC_PLAUSIBLE_DOMAIN || 'surgerii.com',
          }],
    },
  },

  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [300, 400, 600] },
      { name: 'Lora', provider: 'google', weights: [600] },
    ],
  },

  storyblok: {
    accessToken: process.env.NUXT_STORYBLOK_ACCESS_TOKEN,
    apiOptions: { region },
    // On now, including in production, which is what makes the Visual Editor
    // usable: without it an editor sees a page they cannot click into and
    // their edits never appear.
    //
    // This used to be off here, on the grounds that the bridge was a
    // third-party script loaded on every page. That stopped being true. The
    // SDK bundles the bridge and imports it lazily, and only when the URL
    // carries `_storyblok_tk`, which only Storyblok's editor adds:
    //
    //   const inEditor = window.location?.search?.includes('_storyblok_tk')
    //   if (bridge !== false && inEditor) loadBridge()
    //
    // So a visitor never downloads it, nothing third-party is requested, and
    // there is nothing here for the cookie banner to gate.
    bridge: true,
  },

  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    strategy: 'prefix_except_default',
    locales: LOCALES,
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'shurui_locale',
      redirectOn: 'root',
      alwaysRedirect: false,
    },
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://localhost:3010',
  },

  // A static build (the test site) prerenders every story in every language,
  // not just what the crawler reaches from the home page. Links to pages that do
  // not exist in Storyblok yet render the 404 page instead of failing the build.
  hooks: {
    async 'nitro:config'(config) {
      // Only a static build needs this. The Node server renders on request, so
      // prerendering there would freeze the content until the next deploy and
      // make every build walk the whole site in five languages. `nuxt generate`
      // sets nitro's `static` flag; the preset name is not resolved this early.
      if (!(config as { static?: boolean }).static) return
      if (!process.env.NUXT_STORYBLOK_ACCESS_TOKEN) return
      const version = process.env.NUXT_PUBLIC_STORYBLOK_VERSION === 'draft' ? 'draft' : 'published'
      const host = region === 'eu' ? 'api.storyblok.com' : `api-${region}.storyblok.com`
      // The sitemap is a Nitro server route, so a static build has to render it
      // to a file or the host answers /sitemap.xml with the 404 page, as the
      // test site did.
      const routes: string[] = ['/sitemap.xml']
      for (let page = 1; ; page++) {
        const res = await fetch(`https://${host}/v2/cdn/links?version=${version}&per_page=1000&page=${page}&token=${process.env.NUXT_STORYBLOK_ACCESS_TOKEN}`)
        if (!res.ok) break
        const links = Object.values((await res.json()).links) as { slug: string, is_folder: boolean }[]
        for (const link of links) {
          if (link.is_folder || link.slug.startsWith('global/')) continue
          // A clinical centre story holds a name, a city and a country code and
          // nothing else, so its page renders a heading over an empty column.
          // Waitak, 15 October: the list "should not be clickable, as client
          // told me it will only be names". Nothing links to them any more, so
          // they are not built either, rather than left as empty URLs a search
          // engine can still find.
          if (link.slug.startsWith('clinical-centers/')) continue
          const path = link.slug === 'home' ? '' : `/${link.slug}`
          // Every locale, not just the default. The crawler cannot find the
          // others on its own: the language switcher only renders its links
          // once the menu is open, so nothing in the static HTML points at
          // /de/ and the hreflang tags would advertise pages that 404.
          for (const locale of LOCALES) {
            const prefix = locale.code === DEFAULT_LOCALE ? '' : `/${locale.code}`
            routes.push(`${prefix}${path}` || '/')
          }
        }
        if (links.length < 1000) break
      }
      config.prerender ||= {}
      config.prerender.routes = [...(config.prerender.routes || []), ...routes]
      config.prerender.failOnError = false
    },
  },

  // `home` is the story behind `/`, so its own slug must not be a second copy of
  // the home page. The same applies under every locale prefix.
  // The pages moved under /shurui-sp-robot and /clinical to match the agreed
  // structure. Anything that was shared at the old address still resolves.
  routeRules: Object.fromEntries(
    LOCALES.flatMap((l) => {
      const p = l.code === DEFAULT_LOCALE ? '' : `/${l.code}`
      const moved: [string, string][] = [
        ['/sp-robot', '/shurui-sp-robot'],
        ['/system-principles', '/shurui-sp-robot/system-principles'],
        ['/instruments-ecosystem', '/shurui-sp-robot/instruments-ecosystem'],
        ['/clinical-application', '/clinical/clinical-applications'],
        ['/clinical-applications', '/clinical/clinical-applications'],
        ['/clinical-evidence', '/clinical/clinical-evidence'],
        ['/clinical-library', '/clinical/clinical-library'],
        ['/training-and-proctoring', '/clinical/training-and-proctoring'],
        ['/news-events', '/news-and-events'],
        ['/news-events/**', '/news-and-events/**'],
      ]
      return [
        [`${p}/home`, { redirect: { to: p || '/', statusCode: 301 } }],
        ...moved.map(([from, to]) => [`${p}${from}`, { redirect: { to: `${p}${to}`, statusCode: 301 } }] as const),
      ]
    }),
  ),

  devServer: {
    port: 3010,
    https: {
      key: fileURLToPath(new URL('./certs/localhost-key.pem', import.meta.url)),
      cert: fileURLToPath(new URL('./certs/localhost.pem', import.meta.url)),
    },
  },

  runtimeConfig: {
    storyblokAccessToken: process.env.NUXT_STORYBLOK_ACCESS_TOKEN || '',
    storyblokRegion: region,
    // Server side only, and it must stay that way. This token reads unpublished
    // content, so anything under `public` below would ship it to every visitor
    // and make draft work readable by anyone. It is used by
    // server/api/preview-story.get.ts and nowhere else.
    storyblokPreviewToken: process.env.NUXT_STORYBLOK_PREVIEW_TOKEN || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://localhost:3010',
      storyblokVersion: process.env.NUXT_PUBLIC_STORYBLOK_VERSION || 'published',
      // Both are only ever loaded once a visitor accepts, see ConsentScripts.
      // Blank either one and that script is never requested at all.
      hubspotPortalId: process.env.NUXT_PUBLIC_HUBSPOT_PORTAL_ID || '148560510',
      linkedinPartnerId: process.env.NUXT_PUBLIC_LINKEDIN_PARTNER_ID || '9786642',
      // The two HubSpot forms the client published on 19 October, both on the
      // EU instance. Empty either one and that form falls back to the site's
      // own endpoint instead.
      hubspotContactFormId: process.env.NUXT_PUBLIC_HUBSPOT_CONTACT_FORM_ID || '207e1886-de9e-479c-8940-11958ab6f472',
      hubspotGateFormId: process.env.NUXT_PUBLIC_HUBSPOT_GATE_FORM_ID || 'e53d45f5-4d9c-4130-ba38-476c9a481e2b',
      // From the HubSpot form settings, for the optional marketing opt-in.
      // Without it the processing consent is sent on its own.
      // "Marketing Information", read off the published form definition.
      hubspotMarketingSubscriptionId: process.env.NUXT_PUBLIC_HUBSPOT_MARKETING_SUBSCRIPTION_ID || '2783111645',
    },
  },
})
