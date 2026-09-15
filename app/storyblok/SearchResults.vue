<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const route = useRoute()
const localePath = useLocalePath()
const language = useStoryblokLanguage()
const term = computed(() => String(route.query.q || '').trim())

const { data: results, status } = await useAsyncData(
  () => `search-${language.value}-${term.value}`,
  async () => {
    if (!term.value) return []
    const api = useStoryblokApi()
    const { data } = await api.get('cdn/stories', {
      version: import.meta.dev ? 'draft' : 'published',
      language: language.value,
      search_term: term.value,
      per_page: 25,
      excluding_fields: 'body',
    })
    return data.stories
  },
  { watch: [term] },
)
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section search" :data-theme="blok.theme || 'light'">
    <div class="container container--narrow">
      <h1 v-if="blok.headline" class="search__headline">{{ blok.headline }}</h1>
      <p v-if="term" class="search__term caption">Results for “{{ term }}”</p>

      <p v-if="status === 'pending'" class="caption">Searching…</p>

      <ul v-else-if="results?.length" class="search__list">
        <li v-for="story in results" :key="story.uuid">
          <NuxtLink :to="localePath(`/${story.full_slug}`)">{{ story.name }}</NuxtLink>
          <span class="caption">/{{ story.full_slug }}</span>
        </li>
      </ul>

      <p v-else class="search__empty">{{ blok.empty_message || 'Nothing matched that search.' }}</p>
    </div>
  </section>
</template>

<style scoped>
.search__headline { font-size: var(--t-h2); }
.search__term { color: var(--ink-muted); margin-bottom: var(--space-6); }
.search__list { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-4); }
.search__list li { display: grid; gap: var(--space-1); border-bottom: 1px solid var(--border); padding-bottom: var(--space-3); }
.search__list .caption { color: var(--ink-muted); }
</style>
