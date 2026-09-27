<script setup lang="ts">
import type { ReactiveHead } from '@unhead/vue'
const route = useRoute()
const language = useStoryblokLanguage()

const slug = computed(() => {
  const raw = Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug
  return raw || 'home'
})

// v11 nests the CDN params under `api`; the bridge is registered automatically
// so Visual Editor edits stream in live. The cache key carries the locale so
// switching language refetches instead of serving the previous translation.
const { story, error } = await useAsyncStoryblok(slug.value, {
  api: {
    version: useStoryblokVersion(),
    language: language.value,
    resolve_links: 'url',
  },
})

if (error.value || !story.value?.content) {
  throw createError({ statusCode: 404, statusMessage: `Story "${slug.value}" not found` })
}

// useLocaleHead returns a ref. Handing it to useHead directly applies nothing,
// so the html lang/dir attributes and the hreflang alternates were both absent;
// it has to be read inside the getter.
const localeHead = useLocaleHead({ seo: true })
useHead(() => localeHead.value)

const site = useRuntimeConfig().public.siteUrl
const switchLocalePath = useSwitchLocalePath()
const { locale: currentLocale, defaultLocale } = useI18n()

// useLocaleHead emits one alternate per locale but no x-default, which is what
// tells search engines where to send a visitor whose language matches none of
// them. unhead types `rel: 'alternate'` as the feed variant, where `type` is
// required, so the link is typed as a head link rather than inferred.
useHead(() => ({
  link: [{ rel: 'alternate', hreflang: 'x-default', href: site + switchLocalePath(defaultLocale) }] as ReactiveHead['link'],
}))

const seo = computed(() => story.value?.content?.seo?.[0] || {})

useHead(() => ({
  title: seo.value.title || story.value?.name,
  link: [{ rel: 'canonical', href: seo.value.canonical
      || site + switchLocalePath(currentLocale.value) }],
  meta: [
    ...(seo.value.description ? [{ name: 'description', content: seo.value.description }] : []),
    ...(seo.value.og_image?.filename ? [{ property: 'og:image', content: seo.value.og_image.filename }] : []),
    ...(seo.value.no_index ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
  ],
}))
</script>

<template>
  <StoryblokComponent v-if="story?.content" :blok="story.content" />
</template>
