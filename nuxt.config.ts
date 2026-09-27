import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
type StoryblokRegion = 'eu' | 'us' | 'ap' | 'ca' | 'cn'

const region = (process.env.NUXT_STORYBLOK_REGION || 'eu') as StoryblokRegion

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
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', language: 'en-GB', name: 'English', storyblok: 'default' },
      { code: 'de', language: 'de-DE', name: 'Deutsch', storyblok: 'de' },
      { code: 'fr', language: 'fr-FR', name: 'Francais', storyblok: 'fr' },
      { code: 'es', language: 'es-ES', name: 'Espanol', storyblok: 'es' },
      { code: 'it', language: 'it-IT', name: 'Italiano', storyblok: 'it' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'shurui_locale',
      redirectOn: 'root',
      alwaysRedirect: false,
    },
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://localhost:3010',
  },

  // Static builds (the test site) prerender every story, not just what the
  // crawler reaches from the home page. Links to pages that do not exist in
  // Storyblok yet render the 404 page instead of failing the build.
  hooks: {
    async 'nitro:config'(config) {
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
          routes.push(link.slug === 'home' ? '/' : `/${link.slug}`)
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
