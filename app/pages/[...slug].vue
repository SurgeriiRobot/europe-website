<script setup lang="ts">
import type { ReactiveHead } from '@unhead/vue'
const route = useRoute()
const language = useStoryblokLanguage()

const slug = computed(() => {
  const parts = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
  // Static hosting serves /about out of /about/index.html and redirects the
  // bare path to the trailing slash, which the router then hands over as a
  // final empty segment. Joined as it comes that asks Storyblok for "about/",
  // which does not exist, so every inner page threw a 404 and rendered blank
  // once it hydrated, while the prerendered HTML underneath was correct.
  const raw = parts.filter(Boolean).join('/')
  return raw || 'home'
})

// Storyblok signs the URL it loads into the editor's iframe, so the presence
// of that signature is what tells us an editor is looking rather than a
// visitor. It is derived from the route, so server and client agree on which
// branch runs for a given URL.
const editorSignature = computed(() => String(route.query['_storyblok_tk[token]'] || ''))
const inEditor = computed(() => !!editorSignature.value)

// Two ways in, and the ordinary one is left exactly as it was: a bug in the
// preview path can only reach someone who arrived from the editor.
//
// v11 nests the CDN params under `api`; the bridge is registered automatically
// so Visual Editor edits stream in live. The cache key carries the locale so
// switching language refetches instead of serving the previous translation.
let story: ComputedRef<any>
let error: Ref<any>

if (inEditor.value) {
  // Published content is what the public token can read, and it is the wrong
  // thing to show an editor: their saved but unpublished work would be
  // missing, which looks exactly like the save having failed. The draft comes
  // from our own endpoint, which holds the preview token server side.
  const sbApi = useStoryblokApi()
  // Read before the fetcher runs. Anything that reaches for the Nuxt instance
  // after an await is past the point where one exists, which is NUXT_E1001 and
  // was quietly turning the fallback below into a 404.
  const publishedVersion = useStoryblokVersion()
  const preview = await useAsyncData(
    () => `preview-${slug.value}-${language.value}`,
    async () => {
      try {
        return await $fetch<any>('/api/preview-story', {
          query: {
            slug: slug.value,
            language: language.value,
            '_storyblok_tk[space_id]': route.query['_storyblok_tk[space_id]'],
            '_storyblok_tk[timestamp]': route.query['_storyblok_tk[timestamp]'],
            '_storyblok_tk[token]': editorSignature.value,
          },
        })
      }
      catch {
        // A signature is good for an hour. Someone who left the editor open
        // over lunch and reloaded should get the published page, not a 404.
        const { data } = await sbApi.get(`cdn/stories/${slug.value}`, {
          version: publishedVersion,
          language: language.value,
          resolve_links: 'url',
        })
        return data
      }
    },
  )
  story = computed(() => preview.data.value?.story)
  error = preview.error
  // useAsyncStoryblok would have done this for us. Taking the draft from our
  // own endpoint means wiring the live updates by hand instead.
  if (import.meta.client) {
    watch(() => story.value?.id, (id) => {
      if (!id) return
      useStoryblokBridge(id, (evStory: any) => {
        if (preview.data.value) preview.data.value = { ...preview.data.value, story: evStory }
      }, { resolveLinks: 'url' })
    }, { immediate: true })
  }
}
else {
  const published = await useAsyncStoryblok(slug.value, {
    api: {
      version: useStoryblokVersion(),
      language: language.value,
      resolve_links: 'url',
    },
  })
  story = published.story
  error = published.error
}

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
