<script setup lang="ts">
// Search results (Figma search-desktop, 1440x2761).
//
// Under the header: an 851x47 field centred on the frame at y162, the 189px
// "Most Recent" sort on the left gutter at y277, then the results — a 12/15
// date, a 24/29 title with every hit on the query picked out in brand blue, and
// an 18/29 excerpt — 71px apart, and the pager centred 40px below.
//
// This is a sibling of `search_results`, not a replacement: that block stays as
// the plain list a page can drop anywhere. Everything here lives in the URL —
// the term, the sort and the page — so a result set can be linked to, shared and
// reloaded, and the back button walks it. The term is read from `q`, which is
// what the header's search box navigates with.
const props = defineProps<{ blok: any }>()

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const language = useStoryblokLanguage()

const term = computed(() => String(route.query.q || '').trim())
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const newest = computed(() => route.query.sort !== 'oldest')
const perPage = computed(() => Math.max(1, Number(props.blok.per_page) || 10))

// What the visitor is typing, which is only committed to the URL on submit —
// so a half-typed word never refetches and never enters the history.
const draft = ref(term.value)
watch(term, t => { draft.value = t })

const { data, status } = await useAsyncData(
  () => `search-${language.value}-${term.value}-${newest.value}-${page.value}-${perPage.value}`,
  async () => {
    if (!term.value) return { stories: [] as any[], total: 0 }
    const api = useStoryblokApi()
    const { data, total } = await api.get('cdn/stories', {
      version: useStoryblokVersion(),
      language: language.value,
      search_term: term.value,
      per_page: perPage.value,
      page: page.value,
      // First publication is the date the design prints and the order it sorts
      // by. Nothing is published in a draft space, so a review build sorts by
      // creation instead of leaving the control doing nothing. Stories an
      // editor has flagged never appear at all.
      sort_by: `${useStoryblokVersion() === 'draft' ? 'created_at' : 'first_published_at'}:${newest.value ? 'desc' : 'asc'}`,
      filter_query: { hide_from_search: { is: false } },
      excluding_fields: 'body',
    })
    return { stories: data.stories as any[], total: total ?? data.stories.length }
  },
  { watch: [term, newest, page, language] },
)

const pages = computed(() => Math.max(1, Math.ceil((data.value?.total || 0) / perPage.value)))
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
function submit() {
  const q = draft.value.trim()
  // Re-submitting the same term should not stack history entries.
  if (q === term.value) return
  router.push({ path: localePath('/search'), query: q ? { q } : {} })
}

const { locale, locales } = useI18n()
const bcp47 = computed(() => {
  const active = (locales.value as any[]).find(l => (typeof l === 'string' ? l : l.code) === locale.value)
  return (active && typeof active !== 'string' && active.language) || locale.value
})

const sbHref = useSbUrl()
const results = computed(() => (data.value?.stories || []).map((story: any) => {
  const c = story.content || {}
  // "Published on" has to be true: a story that has never been published shows
  // no date rather than its creation date. Only a draft build ever sees those.
  const raw = story.first_published_at || story.published_at || ''
  const d = raw ? new Date(raw) : null
  return {
    uuid: story.uuid,
    to: localePath(`/${story.full_slug.replace(/\/$/, '')}`),
    title: c.title || story.name || story.full_slug,
    excerpt: c.excerpt || c.intro || c.seo?.[0]?.description || '',
    date: d && !Number.isNaN(d.valueOf())
      ? d.toLocaleDateString(bcp47.value, { day: 'numeric', month: 'long', year: 'numeric' })
      : '',
  }
}))

// The design picks the query out of each title in brand blue. Split rather than
// interpolate markup, so a title can never inject HTML.
function parts(title: string) {
  const t = term.value
  if (!t) return [{ text: title, hit: false }]
  const out: { text: string, hit: boolean }[] = []
  const hay = title.toLowerCase()
  const needle = t.toLowerCase()
  let i = 0
  for (;;) {
    const at = hay.indexOf(needle, i)
    if (at < 0) break
    if (at > i) out.push({ text: title.slice(i, at), hit: false })
    out.push({ text: title.slice(at, at + needle.length), hit: true })
    i = at + needle.length
  }
  if (i < title.length) out.push({ text: title.slice(i), hit: false })
  return out.length ? out : [{ text: title, hit: false }]
}

// undefined, not null: Vue's style binding accepts string | number | undefined.
const px = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : `${Number(v)}px`)
const style = computed(() => ({
  '--srch-top': px(props.blok.space_top),
  '--srch-bottom': px(props.blok.space_bottom),
  '--srch-top-m': px(props.blok.space_top_mobile),
  '--srch-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section srch"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="srch__inner">
      <h1 v-if="blok.headline" class="srch__h">{{ blok.headline }}</h1>
      <h1 v-else class="srch__sr">{{ blok.title_fallback || 'Search' }}</h1>

      <form class="srch__form" role="search" @submit.prevent="submit">
        <label class="srch__sr" for="site-search">{{ blok.field_label || 'Search this site' }}</label>
        <input
          id="site-search"
          v-model="draft"
          class="srch__input"
          type="search"
          name="q"
          enterkeyhint="search"
          :placeholder="blok.placeholder || 'Search input'"
        >
        <button class="srch__submit" type="submit" :aria-label="blok.submit_label || 'Search'">
          <Icon name="search" :size="18" />
        </button>
      </form>

      <div v-if="term" class="srch__bar">
        <label class="ctrl ctrl--sort">
          <span class="ctrl__label" aria-hidden="true">
            {{ newest ? (blok.sort_recent_label || 'Most Recent') : (blok.sort_oldest_label || 'Oldest first') }}
          </span>
          <select
            class="ctrl__input"
            :aria-label="blok.sort_name || 'Sort by'"
            :value="newest ? 'recent' : 'oldest'"
            @change="setQuery('sort', ($event.target as HTMLSelectElement).value === 'oldest' ? 'oldest' : '')"
          >
            <option value="recent">{{ blok.sort_recent_label || 'Most Recent' }}</option>
            <option value="oldest">{{ blok.sort_oldest_label || 'Oldest first' }}</option>
          </select>
        </label>
      </div>

      <p v-if="!term" class="srch__note">{{ blok.prompt_message || 'Type a word or two above to search the site.' }}</p>
      <p v-else-if="status === 'pending'" class="srch__note" aria-live="polite">{{ blok.loading_message || 'Searching…' }}</p>
      <p v-else-if="!results.length" class="srch__note" aria-live="polite">
        {{ (blok.empty_message || 'Nothing on the site matches “{term}”.').replace('{term}', term) }}
      </p>

      <ol v-else class="srch__list">
        <li v-for="item in results" :key="item.uuid" class="result">
          <p v-if="item.date" class="result__date">{{ blok.date_prefix || 'Published on' }} {{ item.date }}</p>
          <h2 class="result__title">
            <NuxtLink :to="item.to" class="result__link">
              <span v-for="(part, i) in parts(item.title)" :key="i" :class="{ 'result__hit': part.hit }">{{ part.text }}</span>
            </NuxtLink>
          </h2>
          <p v-if="item.excerpt" class="result__body">{{ item.excerpt }}</p>
        </li>
      </ol>

      <nav v-if="pages > 1" class="pager" :aria-label="blok.pager_label || 'Search result pages'">
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
/* 82px from the header to the field, 154px from the pager to the footer band. */
.srch { padding-block: var(--srch-top, 82px) var(--srch-bottom, 154px); }
.srch__inner {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: clamp(16px, 5.21vw, 75px);   /* the design's 75px gutter */
}

.srch__h {
  margin: 0 0 40px;
  font-size: clamp(2rem, 3.33vw, 3rem);
  font-weight: 600;
  line-height: 1.2083;
  color: var(--ink);
}
.srch__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ---- the field -------------------------------------------------------- */
/* 851x47 centred on the frame: a #85b6fd hairline on #f9fafc inside a 4px
   #c3dbfe halo, with the 18px glyph 17px in from the right edge. Both blues are
   sampled from the design — they are not in the palette. */
.srch__form {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 851px;
  height: 47px;
  margin-inline: auto;
  border: 1px solid #85b6fd;
  border-radius: 6px;
  background: var(--c-neutral-200);
  box-shadow: 0 0 0 4px #c3dbfe;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.srch__form:focus-within { border-color: var(--c-blue); box-shadow: 0 0 0 4px var(--c-blue-200); }

.srch__input {
  width: 100%;
  height: 100%;
  padding: 0 44px 0 16px;
  border: 0;
  border-radius: inherit;
  background: none;
  font-size: 1.5rem;                  /* 24 */
  font-weight: 600;
  line-height: 1.2083;
  color: var(--c-blue);
}
.srch__input::placeholder { color: var(--c-black-200); font-weight: 400; }
.srch__input:focus-visible { outline: none; }         /* the halo above is the indicator */
.srch__input::-webkit-search-cancel-button { display: none; }

.srch__submit {
  position: absolute;
  inset-inline-end: 16px;
  display: inline-flex;
  padding: 0;
  border: 0;
  background: none;
  color: var(--c-blue);
  cursor: pointer;
}

/* ---- sort ------------------------------------------------------------- */
.srch__bar { display: flex; margin-top: 68px; }
.ctrl {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 42px;
  border: 1px solid var(--c-darkblue);
  border-radius: 4px;
  background-color: var(--surface);
  color: var(--c-darkblue);
  font-size: 0.9375rem;               /* 15 */
  font-weight: 500;
  line-height: 26px;
  letter-spacing: 0.46px;             /* the MUI control tracking the design is built on */
  white-space: nowrap;
  cursor: pointer;
}
/* 189px wide with the chevron pinned 13px in over a 24px glyph — the design's
   own sort control, the same one the listing pages draw. */
.ctrl--sort {
  flex: none;
  width: 189px;
  padding: 0 37px 0 13px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2303045e'%3E%3Cpath d='M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 13px center;
  background-size: 24px 24px;
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
.ctrl:focus-within { outline: 2px solid var(--c-blue); outline-offset: 2px; }
.ctrl:hover { background-color: color-mix(in srgb, var(--c-darkblue) 5%, var(--surface)); }

/* ---- results ---------------------------------------------------------- */
/* The design's own gap between entries is not constant — it runs 60px after a
   short one to 74px after a four-line one — so this is the single value that
   best reproduces its rhythm, within ~13px at the worst entry. */
.srch__list {
  display: grid;
  gap: 68px;
  margin: 71px 0 0;
  padding: 0;
  list-style: none;
}
.result__date {
  margin: 0;
  font-size: 0.75rem;                 /* 12 */
  font-weight: 400;
  line-height: 1.25;                  /* 15/12 */
  color: var(--ink);
}
.result__title {
  margin: 11px 0 0;
  font-size: 1.5rem;                  /* 24 */
  font-weight: 600;
  line-height: 1.2083;                /* 29/24 */
  color: var(--ink);
}
.result__link { color: inherit; text-decoration: none; }
.result__link:hover { text-decoration: underline; text-underline-offset: 4px; }
.result__hit { color: var(--c-blue); }
.result__body {
  margin: 13px 0 0;
  font-size: 1.125rem;                /* 18 */
  font-weight: 300;
  line-height: 1.6111;                /* 29/18 */
  color: var(--ink);
}

.srch__note {
  margin: 71px 0 0;
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;
  color: var(--ink);
}

/* ---- pager ------------------------------------------------------------ */
.pager { display: flex; justify-content: center; gap: 6px; margin-top: 110px; }
.pager__page, .pager__step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  color: var(--c-darkblue);
  font-size: 0.875rem;                /* 14 */
  font-weight: 400;
  line-height: 1;
  text-decoration: none;
}
.pager__page:hover, .pager__step:hover { background: color-mix(in srgb, var(--c-darkblue) 8%, transparent); }
.pager__page.is-current, .pager__page.is-current:hover { background: var(--c-blue); color: var(--c-white); }
.pager__step.is-off { color: rgb(3 4 94 / 38%); pointer-events: none; }

/* ---- phone ------------------------------------------------------------ */
/* No drawn phone frame for this page: it follows the phone modules the built
   listings use — the 16px gutter, full-width controls, and the same pager. */
@media (max-width: 720px) {
  .srch { padding-block: var(--srch-top-m, 40px) var(--srch-bottom-m, 96px); }
  .srch__inner { padding-inline: 16px; }
  .srch__h { margin-bottom: 32px; font-size: clamp(2rem, 9.5vw, 2.5rem); }
  .srch__form { height: 44px; }
  .srch__input { padding: 0 40px 0 13px; font-size: 1.125rem; }
  .srch__submit { inset-inline-end: 13px; }
  .srch__bar { margin-top: 40px; }
  .ctrl--sort { width: 100%; }
  .srch__list, .srch__note { margin-top: 40px; }
  .srch__list { gap: 40px; }
  .result__title { margin-top: 8px; font-size: 1.25rem; line-height: 1.2; }
  .result__body { margin-top: 12px; font-size: 1rem; line-height: 1.625; }
  .pager { gap: 2px; margin-top: 32px; }
}
</style>
