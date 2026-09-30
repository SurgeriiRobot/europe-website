<script setup lang="ts">
// Figma "News & events" listing (news-and-events-desktop.png, 1440x4470).
//
// Desktop band 800-2909: a 42px toolbar at y878 — the 189px "Most recent" sort
// on the left gutter, the five filter controls flush to the right one — then a
// four-column card grid at y960 (300px cards, 30px gutters, 398px rows) and a
// centred pager at y2682 (40px slots, 6px apart). The fourth slot of the first
// row is a brand-blue promo card rather than an article.
//
// Phone (extra-modules-mobile.png): the same controls stack full width between
// the 16px gutters — "Most recent", then a "Show filters" disclosure holding the
// other five — over a single column of the same cards.
//
// Sorting, filtering and paging all live in the URL, so a filtered listing can
// be linked to, shared and crawled, and the back button walks it.
const props = defineProps<{ blok: any }>()

const route = useRoute()
const router = useRouter()
const language = useStoryblokLanguage()

const promo = computed(() => props.blok.promo?.[0] || null)
// The promo takes one of the page's slots, so a page of 16 tiles asks the API
// for 15 stories. Without a promo the page is all articles.
const perPage = computed(() => Math.max(1, Number(props.blok.per_page) || 16))
const pageSize = computed(() => Math.max(1, perPage.value - (promo.value ? 1 : 0)))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const newest = computed(() => route.query.sort !== 'oldest')

const enabled = computed<string[]>(() => props.blok.filters || [])
const activeFilters = computed(() => ({
  article_type: (route.query.type as string) || '',
  specialties: (route.query.specialty as string) || '',
  event_type: (route.query.event as string) || '',
  region: (route.query.region as string) || '',
}))

const { data, status } = await useAsyncData(
  () => `listing-${language.value}-${page.value}-${newest.value}-${JSON.stringify(activeFilters.value)}`,
  async () => {
    const api = useStoryblokApi()
    const filter: Record<string, any> = {}
    for (const [field, value] of Object.entries(activeFilters.value)) {
      if (!value) continue
      filter[field] = field === 'specialties' ? { in_array: value } : { in: value }
    }
    const { data, total } = await api.get('cdn/stories', {
      content_type: 'article',
      version: useStoryblokVersion(),
      language: language.value,
      per_page: pageSize.value,
      page: page.value,
      sort_by: newest.value ? 'content.date:desc' : 'content.date:asc',
      excluding_fields: 'body',
      ...(Object.keys(filter).length ? { filter_query: filter } : {}),
    })
    return { stories: data.stories as any[], total: total ?? data.stories.length }
  },
  { watch: [page, newest, activeFilters] },
)

// The filter vocabularies are the datasources the article fields already use, so
// the dropdowns can never drift from what editors can actually tag.
const { data: vocab } = await useAsyncData(
  () => `listing-vocab-${language.value}`,
  async () => {
    const api = useStoryblokApi()
    const slugs = ['article-types', 'medical-specialties', 'event-types', 'regions']
    const sets = await Promise.all(slugs.map(async (datasource) => {
      const { data } = await api.get('cdn/datasource_entries', {
        datasource,
        per_page: 100,
        version: useStoryblokVersion(),
      })
      return (data.datasource_entries || []) as { name: string, value: string }[]
    }))
    return Object.fromEntries(slugs.map((slug, i) => [slug, sets[i]])) as Record<string, { name: string, value: string }[]>
  },
)

// One value -> name map for the card chips, across every vocabulary.
const labels = computed(() => {
  const out: Record<string, string> = {}
  for (const entries of Object.values(vocab.value || {})) for (const e of entries) out[e.value] = e.name
  return out
})

const pages = computed(() => Math.max(1, Math.ceil((data.value?.total || 0) / pageSize.value)))
// The design draws five page numbers; longer runs window around the current one.
const numbers = computed(() => {
  const span = Math.min(5, pages.value)
  const start = Math.min(Math.max(1, page.value - Math.floor(span / 2)), pages.value - span + 1)
  return Array.from({ length: span }, (_, i) => start + i)
})
const to = (n: number) => ({ query: { ...route.query, page: n === 1 ? undefined : n } })

function setQuery(key: string, value: string) {
  router.push({ query: { ...route.query, [key]: value || undefined, page: undefined } })
}
// "News" and "Events" are toggles, not a pair of one-way links: clicking the
// active one clears the type again.
const toggleType = (value: string) =>
  setQuery('type', activeFilters.value.article_type === value ? '' : value)

const tiles = computed(() => {
  const list = (data.value?.stories || []).map(story => ({ kind: 'card' as const, story }))
  if (!promo.value) return list
  // Storyblok hands number fields back as strings, and an emptied one as "".
  const slot = Number(props.blok.promo_position)
  const at = Math.min(Math.max(0, Number.isFinite(slot) && props.blok.promo_position !== '' ? slot : 3), list.length)
  return [...list.slice(0, at), { kind: 'promo' as const, story: null }, ...list.slice(at)]
})

const promoButton = computed(() => promo.value?.buttons?.[0] || null)
const sbHref = useSbUrl()

// Phones collapse the five filters behind "Show filters"; the desktop media
// query shows them regardless, so this never hides anything on a wide screen.
const filtersOpen = ref(false)

// A native <select> is as wide as its widest option, which would blow the
// design's 126px "Region" chip out to fit "Middle East". The chip is therefore
// sized by a visible label and the real select lies over it, transparent but
// still focusable and still opening the platform's own list.
const entryName = (slug: string, value: string) =>
  (vocab.value?.[slug] || []).find(e => e.value === value)?.name || ''
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section listing"
    :data-theme="blok.theme || 'light'"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="listing__inner">
      <SectionTitle
        v-if="blok.headline || blok.intro"
        :headline="blok.headline"
        :body="blok.intro"
        :lines="blok.title_lines"
        class="listing__title"
      />

      <div class="listing__bar">
        <label class="ctrl ctrl--select ctrl--sort">
          <span class="ctrl__label" aria-hidden="true">{{ newest ? 'Most recent' : 'Oldest first' }}</span>
          <select
            class="ctrl__input"
            aria-label="Sort by"
            :value="newest ? 'recent' : 'oldest'"
            @change="setQuery('sort', ($event.target as HTMLSelectElement).value === 'oldest' ? 'oldest' : '')"
          >
            <option value="recent">Most recent</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>

        <button
          type="button"
          class="ctrl ctrl--select ctrl--disclosure"
          :aria-expanded="filtersOpen"
          aria-controls="listing-filters"
          @click="filtersOpen = !filtersOpen"
        >
          {{ filtersOpen ? 'Hide filters' : 'Show filters' }}
        </button>

        <div id="listing-filters" class="listing__filters" :class="{ 'is-open': filtersOpen }">
          <button
            v-if="enabled.includes('article_type')"
            type="button"
            class="ctrl ctrl--toggle"
            :class="{ 'is-on': activeFilters.article_type === 'news' }"
            :aria-pressed="activeFilters.article_type === 'news'"
            @click="toggleType('news')"
          >
            News
          </button>
          <button
            v-if="enabled.includes('article_type')"
            type="button"
            class="ctrl ctrl--toggle"
            :class="{ 'is-on': activeFilters.article_type === 'event' }"
            :aria-pressed="activeFilters.article_type === 'event'"
            @click="toggleType('event')"
          >
            Events
          </button>

          <label v-if="enabled.includes('specialties')" class="ctrl ctrl--select">
            <span class="ctrl__label" aria-hidden="true">{{ entryName('medical-specialties', activeFilters.specialties) || 'Medical specialties' }}</span>
            <select
              class="ctrl__input"
              aria-label="Medical specialties"
              :value="activeFilters.specialties"
              @change="setQuery('specialty', ($event.target as HTMLSelectElement).value)"
            >
              <option value="">Medical specialties</option>
              <option v-for="entry in vocab?.['medical-specialties'] || []" :key="entry.value" :value="entry.value">{{ entry.name }}</option>
            </select>
          </label>

          <label v-if="enabled.includes('event_type')" class="ctrl ctrl--select">
            <span class="ctrl__label" aria-hidden="true">{{ entryName('event-types', activeFilters.event_type) || 'Event type' }}</span>
            <select
              class="ctrl__input"
              aria-label="Event type"
              :value="activeFilters.event_type"
              @change="setQuery('event', ($event.target as HTMLSelectElement).value)"
            >
              <option value="">Event type</option>
              <option v-for="entry in vocab?.['event-types'] || []" :key="entry.value" :value="entry.value">{{ entry.name }}</option>
            </select>
          </label>

          <label v-if="enabled.includes('region')" class="ctrl ctrl--select">
            <span class="ctrl__label" aria-hidden="true">{{ entryName('regions', activeFilters.region) || 'Region' }}</span>
            <select
              class="ctrl__input"
              aria-label="Region"
              :value="activeFilters.region"
              @change="setQuery('region', ($event.target as HTMLSelectElement).value)"
            >
              <option value="">Region</option>
              <option v-for="entry in vocab?.['regions'] || []" :key="entry.value" :value="entry.value">{{ entry.name }}</option>
            </select>
          </label>
        </div>
      </div>

      <p v-if="status === 'pending'" class="listing__status">Loading…</p>
      <p v-else-if="!data?.stories.length" class="listing__status">No results for these filters.</p>

      <div v-else class="listing__grid">
        <template v-for="(tile, i) in tiles" :key="tile.story?.uuid || `promo-${i}`">
          <article v-if="tile.kind === 'promo'" class="promo-tile">
            <h3 class="promo-tile__title">{{ promo.headline }}</h3>
            <p v-if="promo.body" class="promo-tile__body">{{ promo.body }}</p>
            <NuxtLink v-if="promoButton" :to="sbHref(promoButton.link)" class="promo-tile__btn">
              {{ promoButton.label }}
            </NuxtLink>
          </article>
          <ListingCard v-else :story="tile.story" :labels="labels" />
        </template>
      </div>

      <nav v-if="pages > 1" class="pager" aria-label="Pagination">
        <NuxtLink v-if="page > 1" :to="to(1)" class="pager__step" aria-label="First page">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M18.41 16.59 13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" /></svg>
        </NuxtLink>
        <span v-else class="pager__step is-off" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M18.41 16.59 13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" /></svg>
        </span>

        <NuxtLink v-if="page > 1" :to="to(page - 1)" class="pager__step" aria-label="Previous page" rel="prev">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6z" /></svg>
        </NuxtLink>
        <span v-else class="pager__step is-off" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6z" /></svg>
        </span>

        <NuxtLink
          v-for="n in numbers"
          :key="n"
          :to="to(n)"
          class="pager__page"
          :class="{ 'is-current': n === page }"
          :aria-current="n === page ? 'page' : undefined"
          :aria-label="`Page ${n}`"
        >
          {{ n }}
        </NuxtLink>

        <NuxtLink v-if="page < pages" :to="to(page + 1)" class="pager__step" aria-label="Next page" rel="next">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" /></svg>
        </NuxtLink>
        <span v-else class="pager__step is-off" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" /></svg>
        </span>

        <NuxtLink v-if="page < pages" :to="to(pages)" class="pager__step" aria-label="Last page">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M5.59 7.41 10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" /></svg>
        </NuxtLink>
        <span v-else class="pager__step is-off" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M5.59 7.41 10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" /></svg>
        </span>
      </nav>
    </div>
  </section>
</template>

<style scoped>
/* Design band 800-2909: 78px above the toolbar, 187px below the pager. */
.listing { padding-block: 78px 187px; }
.listing__inner {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: clamp(16px, 5.21vw, 75px);   /* the design's 75px gutter */
}
.listing__title { margin-bottom: 64px; }
.listing__status { margin: 40px 0 0; font-size: 1.125rem; font-weight: 300; }

/* ---- toolbar ---------------------------------------------------------- */
.listing__bar { display: flex; align-items: flex-start; justify-content: space-between; gap: 19px; }
.listing__filters { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 19px; }

/* Every control is the same 42px outlined pill: 1px #03045e, 4px radius,
   Inter 500 15/26 with MUI's 0.46px tracking, 22px to the label. */
.ctrl {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 42px;
  border: 1px solid var(--c-darkblue);
  border-radius: 4px;
  background-color: var(--surface);
  color: var(--c-darkblue);
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 26px;
  letter-spacing: 0.46px;
  white-space: nowrap;
  cursor: pointer;
}
/* A dropdown is the label plus a 20px chevron, 21px from each edge and 10px
   apart — the chip is sized by the label, and the transparent select on top of
   it keeps the platform's own list. */
.ctrl--select {
  padding: 0 51px 0 21px;               /* 21 gutter + 20 chevron + 10 gap */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2303045e'%3E%3Cpath d='M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 21px center;
  background-size: 20px 20px;
}
.ctrl__label { overflow: hidden; text-overflow: ellipsis; }
.ctrl__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  background: none;
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
  opacity: 0;
  appearance: none;
  cursor: inherit;
}

.ctrl--toggle { padding-inline: 21px; }
.ctrl--toggle.is-on { background-color: var(--c-blue); border-color: var(--c-blue); color: var(--c-white); }

/* The sort control is drawn at a fixed 189px with the chevron pinned to its
   right edge, 13px in, over a 24px glyph. */
.ctrl--sort {
  flex: none;
  width: 189px;
  padding: 0 37px 0 13px;
  background-position: right 13px center;
  background-size: 24px 24px;
}

.ctrl--disclosure { display: none; }

.ctrl:focus-within, .ctrl:focus-visible { outline: 2px solid var(--c-blue); outline-offset: 2px; }
/* Colour only: the `background` shorthand here would drop a dropdown's chevron. */
.ctrl:hover { background-color: color-mix(in srgb, var(--c-darkblue) 5%, var(--surface)); }
.ctrl--toggle.is-on:hover { background-color: var(--c-blue-500); }

/* ---- grid ------------------------------------------------------------- */
.listing__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  margin-top: 40px;
}

/* ---- promo tile ------------------------------------------------------- */
/* The blue slot in the first row: centred 24/29 title, 16/26 body on a 260px
   measure, and a pale button — all vertically centred in the 398px card. */
.promo-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 398px;
  /* The design's block is not quite centred: 61px of air above it, 53 below. */
  padding: 28px 20px 20px;
  background: var(--c-blue);
  color: var(--c-white);
  text-align: center;
}
/* Figma breaks the title after "Interested in" — the balanced break, which also
   holds for a translation of another length. */
.promo-tile__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 29px;
  text-wrap: balance;
}
.promo-tile__body { margin: 22px 0 0; font-size: 1rem; font-weight: 300; line-height: 26px; }
.promo-tile__btn {
  margin-top: 32px;
  padding: 7px 21px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: #ebebeb;
  color: var(--c-darkblue);
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 26px;
  letter-spacing: 0.46px;
  text-decoration: none;
  white-space: nowrap;
  box-shadow:
    0 3px 1px -2px rgb(0 0 0 / 20%),
    0 2px 2px 0 rgb(0 0 0 / 14%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
}
.promo-tile__btn:hover { background: var(--c-white); }

/* ---- pager ------------------------------------------------------------ */
.pager { display: flex; justify-content: center; gap: 6px; margin-top: 40px; }
.pager__page, .pager__step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  color: var(--c-darkblue);
  font-size: 0.875rem;                 /* 14px */
  font-weight: 400;
  line-height: 1;
  text-decoration: none;
}
.pager__page:hover, .pager__step:hover { background: color-mix(in srgb, var(--c-darkblue) 8%, transparent); }
.pager__page.is-current, .pager__page.is-current:hover { background: var(--c-blue); color: var(--c-white); }
.pager__step.is-off { color: rgb(3 4 94 / 38%); pointer-events: none; }

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Two columns once four no longer fit the design's 300px cards. */
@media (max-width: 1180px) {
  .listing__grid { grid-template-columns: repeat(2, 1fr); }
}

/* Phone modules: both controls run the full width between the 16px gutters,
   32px apart, and the five filters drop out of the bar into the disclosure. */
@media (max-width: 720px) {
  .listing { padding-block: 48px 96px; }
  .listing__inner { padding-inline: 16px; }      /* the phone designs' gutter */
  .listing__bar { flex-direction: column; align-items: stretch; gap: 32px; }
  .listing__title { margin-bottom: 40px; }
  /* Both visible controls run the design's full 358px width; the chevrons sit
     13px in over a 24px glyph, as the phone modules draw them. */
  .ctrl--sort, .ctrl--disclosure { width: 100%; }
  .ctrl--disclosure {
    display: inline-flex;
    justify-content: flex-start;
    padding: 0 37px 0 13px;
    background-position: right 13px center;
    background-size: 24px 24px;
  }
  .ctrl--disclosure[aria-expanded='true'] {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2303045e'%3E%3Cpath d='M12 8.59 6 14.59 7.41 16 12 11.42 16.59 16 18 14.59z'/%3E%3C/svg%3E");
  }
  .listing__filters { display: none; }
  .listing__filters.is-open {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: -16px;                   /* 16px under the disclosure, not 32 */
  }
  .listing__filters .ctrl { width: 100%; }
  /* Stacked full width, every control takes the phone modules' 13px inset and
     24px chevron rather than the desktop chips' 21px and 20px. */
  .listing__filters .ctrl--select {
    padding: 0 37px 0 13px;
    background-position: right 13px center;
    background-size: 24px 24px;
  }
  .ctrl--toggle { justify-content: flex-start; padding-inline: 13px; }
  .listing__grid { grid-template-columns: 1fr; gap: 30px; }
  .pager { gap: 2px; }
}
</style>
