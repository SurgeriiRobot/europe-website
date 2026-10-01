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
      const routes: string[] = []
      for (let page = 1; ; page++) {
        const res = await fetch(`https://${host}/v2/cdn/links?version=${version}&per_page=1000&page=${page}&token=${process.env.NUXT_STORYBLOK_ACCESS_TOKEN}`)
        if (!res.ok) break
        const links = Object.values((await res.json()).links) as { slug: string, is_folder: boolean }[]
        for (const link of links) {
          if (link.is_folder || link.slug.startsWith('global/')) continue
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

  routeRules: {
    '/home': { redirect: { to: '/', statusCode: 301 } },
  },

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
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://localhost:3010',
      storyblokVersion: process.env.NUXT_PUBLIC_STORYBLOK_VERSION || 'published',
    },
  },
})
