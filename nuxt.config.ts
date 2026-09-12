import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
type StoryblokRegion = 'eu' | 'us' | 'ap' | 'ca' | 'cn'

const region = (process.env.NUXT_STORYBLOK_REGION || 'eu') as StoryblokRegion

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@storyblok/nuxt'],

  storyblok: {
    accessToken: process.env.NUXT_STORYBLOK_ACCESS_TOKEN,
    apiOptions: { region },
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
