<script setup lang="ts">
const props = defineProps<{ blok: any }>()

const route = useRoute()
const language = useStoryblokLanguage()
const router = useRouter()
const perPage = computed(() => Number(props.blok.per_page) || 16)
const page = computed(() => Number(route.query.page) || 1)

const activeFilters = computed(() => ({
  article_type: (route.query.type as string) || '',
  specialties: (route.query.specialty as string) || '',
  event_type: (route.query.event as string) || '',
  region: (route.query.region as string) || '',
}))

const { data, status } = await useAsyncData(
  () => `articles-${language.value}-${page.value}-${JSON.stringify(activeFilters.value)}`,
  async () => {
    const api = useStoryblokApi()
    const filter: Record<string, any> = {}
    for (const [field, value] of Object.entries(activeFilters.value)) {
      if (!value) continue
      filter[field] = field === 'specialties' ? { in_array: value } : { in: value }
    }

    const { data, total } = await api.get('cdn/stories', {
      content_type: 'article',
      version: import.meta.dev ? 'draft' : 'published',
      language: language.value,
      per_page: perPage.value,
      page: page.value,
      sort_by: 'content.date:desc',
      excluding_fields: 'body',
      ...(Object.keys(filter).length ? { filter_query: filter } : {}),
    })

    return { stories: data.stories, total: total ?? data.stories.length }
  },
  { watch: [page, activeFilters] },
)

const pages = computed(() => Math.max(1, Math.ceil((data.value?.total || 0) / perPage.value)))

function setFilter(key: string, value: string) {
  router.push({ query: { ...route.query, [key]: value || undefined, page: undefined } })
}

// The promo card replaces a grid slot rather than appending after the cards.
const promoAt = computed(() => Number(props.blok.promo_position ?? -1))
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section list" :data-theme="blok.theme || 'light'">
    <div class="container">
      <h2 v-if="blok.headline" class="list__headline">{{ blok.headline }}</h2>

      <div v-if="blok.filters?.length" class="list__filters">
        <label v-if="blok.filters.includes('article_type')" class="list__filter">
          <span class="caption">Type</span>
          <select :value="activeFilters.article_type" @change="setFilter('type', ($event.target as HTMLSelectElement).value)">
            <option value="">All</option>
            <option value="news">News</option>
            <option value="event">Events</option>
            <option value="video">Video</option>
          </select>
        </label>
        <label v-if="blok.filters.includes('region')" class="list__filter">
          <span class="caption">Region</span>
          <select :value="activeFilters.region" @change="setFilter('region', ($event.target as HTMLSelectElement).value)">
            <option value="">All regions</option>
            <option value="europe">Europe</option>
            <option value="asia">Asia</option>
            <option value="americas">Americas</option>
          </select>
        </label>
      </div>

      <p v-if="status === 'pending'" class="list__status caption">Loading…</p>

      <div v-else class="list__grid">
        <template v-for="(story, i) in data?.stories || []" :key="story.uuid">
          <StoryblokComponent v-if="i === promoAt && blok.promo?.[0]" :blok="blok.promo[0]" />
          <ArticleCard :story="story" />
        </template>
      </div>

      <p v-if="data && !data.stories.length" class="list__empty">No results for these filters.</p>

      <nav v-if="pages > 1" class="list__pagination" aria-label="Pagination">
        <NuxtLink
          v-for="n in pages"
          :key="n"
          :to="{ query: { ...route.query, page: n === 1 ? undefined : n } }"
          class="list__page"
          :class="{ 'is-current': n === page }"
        >
          {{ n }}
        </NuxtLink>
      </nav>
    </div>
  </section>
</template>

<style scoped>
.list__headline { font-size: var(--t-h3); margin-bottom: var(--space-5); }
.list__filters { display: flex; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-6); }
.list__filter { display: grid; gap: var(--space-1); }
.list__filter select { padding: var(--space-2) var(--space-3); border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); }
.list__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: var(--space-4); }
.list__empty, .list__status { color: var(--ink-muted); }
.list__pagination { display: flex; justify-content: center; gap: var(--space-2); margin-top: var(--space-7); }
.list__page { padding: var(--space-2) var(--space-3); border-radius: var(--radius); text-decoration: none; }
.list__page.is-current { background: var(--accent); color: var(--c-white); }
</style>
