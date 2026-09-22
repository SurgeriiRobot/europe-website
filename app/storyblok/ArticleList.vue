<script setup lang="ts">
const props = defineProps<{ blok: any }>()

const route = useRoute()
const language = useStoryblokLanguage()
const router = useRouter()
const perPage = computed(() => Number(props.blok.per_page) || 16)
const slider = computed(() => props.blok.layout === 'slider')
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
      sort_by: slider.value ? 'content.date:asc' : 'content.date:desc',
      excluding_fields: 'body',
      ...(Object.keys(filter).length ? { filter_query: filter } : {}),
    })

    return { stories: data.stories as any[], total: total ?? data.stories.length }
  },
  { watch: [page, activeFilters] },
)

const pages = computed(() => Math.max(1, Math.ceil((data.value?.total || 0) / perPage.value)))

function setFilter(key: string, value: string) {
  router.push({ query: { ...route.query, [key]: value || undefined, page: undefined } })
}

// Slider (Figma 991:18685): a scroll-snap track, cards centred, neighbours
// peeking; dots follow whichever card is nearest the centre.
const track = ref<HTMLElement>()
const active = ref(0)
function onTrackScroll() {
  const el = track.value
  if (!el) return
  const mid = el.scrollLeft + el.clientWidth / 2
  const slides = Array.from(el.children) as HTMLElement[]
  let best = 0
  let bestDist = Infinity
  slides.forEach((slide, i) => {
    const d = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - mid)
    if (d < bestDist) { bestDist = d; best = i }
  })
  active.value = best
}
function goTo(i: number, smooth = true) {
  const el = track.value
  const slide = el?.children[i] as HTMLElement | undefined
  if (!el || !slide) return
  el.scrollTo({ left: slide.offsetLeft + slide.offsetWidth / 2 - el.clientWidth / 2, behavior: smooth ? 'smooth' : 'auto' })
}
// The design opens on the second card with both neighbours in view.
onMounted(() => { if (slider.value && (data.value?.stories.length || 0) > 1) nextTick(() => goTo(1, false)) })

// The promo card replaces a grid slot rather than appending after the cards.
const promoAt = computed(() => Number(props.blok.promo_position ?? -1))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section list"
    :class="{ 'list--slider': slider }"
    :data-theme="blok.theme || 'light'"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="container">
      <SectionTitle :headline="blok.headline" :body="blok.intro" :lines="blok.title_lines" />

      <div v-if="!slider && blok.filters?.length" class="list__filters">
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
    </div>

    <p v-if="status === 'pending'" class="list__status caption container">Loading…</p>

    <div v-else-if="slider && data?.stories.length" class="slider">
      <div class="slider__dots" role="tablist" aria-label="Choose a story">
        <button
          v-for="(story, i) in data.stories"
          :key="story.uuid"
          type="button"
          role="tab"
          class="slider__dot"
          :class="{ 'is-active': active === i }"
          :aria-selected="active === i"
          :aria-label="story.content?.title || story.name"
          @click="goTo(i)"
        />
      </div>
      <ul ref="track" class="slider__track" @scroll.passive="onTrackScroll">
        <li v-for="story in data.stories" :key="story.uuid" class="slider__slide">
          <ArticleCard :story="story" variant="slide" />
        </li>
      </ul>
    </div>

    <div v-else class="container">
      <div class="list__grid">
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
.list__filters { display: flex; flex-wrap: wrap; gap: var(--space-4); margin-block: var(--space-6); }
.list__filter { display: grid; gap: var(--space-1); }
.list__filter select { padding: var(--space-2) var(--space-3); border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); }
.list__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: var(--space-4); margin-top: var(--space-6); }
.list__empty, .list__status { color: var(--ink-muted); }
.list__pagination { display: flex; justify-content: center; gap: var(--space-2); margin-top: var(--space-7); }
.list__page { padding: var(--space-2) var(--space-3); border-radius: var(--radius); text-decoration: none; }
.list__page.is-current { background: var(--accent); color: var(--c-white); }

/* Figma 991:18684-85: 232px lead-in, title, 80px, then the slider and 200px. */
.list--slider { padding: clamp(96px, 16.1vw, 232px) 0 clamp(120px, 20.8vw, 300px); }
/* The title frame is a fixed 400px in Figma, leaving 57px above the dots. */
.slider { margin-top: clamp(32px, 3.96vw, 57px); }
.slider__dots { display: flex; justify-content: center; gap: 6px; margin-bottom: 32px; }
.slider__dot {
  width: 30px;
  height: 5px;
  padding: 0;
  border: 0;
  border-radius: 1px;
  background: rgb(3 4 94 / 30%);
  cursor: pointer;
  transition: width 200ms ease, background-color 200ms ease;
}
.slider__dot.is-active { width: 44px; background: var(--c-blue); }

.slider__track {
  display: flex;
  gap: 30px;
  margin: 0;
  padding: 0 calc(50% - min(315px, 43vw));
  list-style: none;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.slider__track::-webkit-scrollbar { display: none; }
.slider__slide { flex: 0 0 min(630px, 86vw); scroll-snap-align: center; }
</style>
