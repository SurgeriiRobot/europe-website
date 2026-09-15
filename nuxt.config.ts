import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
type StoryblokRegion = 'eu' | 'us' | 'ap' | 'ca' | 'cn'

const region = (process.env.NUXT_STORYBLOK_REGION || 'eu') as StoryblokRegion

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@storyblok/nuxt', '@nuxt/fonts', '@nuxtjs/i18n'],

  css: ['~/assets/css/base.css'],

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
      // { code: 'de', language: 'de-DE', name: 'Deutsch', storyblok: 'de' },
      // { code: 'fr', language: 'fr-FR', name: 'Francais', storyblok: 'fr' },
      // { code: 'es', language: 'es-ES', name: 'Espanol', storyblok: 'es' },
      // { code: 'it', language: 'it-IT', name: 'Italiano', storyblok: 'it' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'shurui_locale',
      redirectOn: 'root',
      alwaysRedirect: false,
    },
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://localhost:3010',
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
  },
})
