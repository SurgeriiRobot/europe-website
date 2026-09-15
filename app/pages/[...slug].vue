<script setup lang="ts">
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
    version: import.meta.dev ? 'draft' : 'published',
    language: language.value,
    resolve_links: 'url',
  },
})

if (error.value || !story.value?.content) {
  throw createError({ statusCode: 404, statusMessage: `Story "${slug.value}" not found` })
}

// Locale head (html lang/dir + hreflang alternates) and story SEO are applied
// as separate calls; useHead merges them, and mixing the arrays by hand widens
// their types past what it accepts.
useHead(useLocaleHead({ seo: true }))

const seo = computed(() => story.value?.content?.seo?.[0] || {})

useHead(() => ({
  title: seo.value.title || story.value?.name,
  link: seo.value.canonical ? [{ rel: 'canonical', href: seo.value.canonical }] : [],
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
