<script setup lang="ts">
// Clinical Library listing (Figma clinical-library-desktop, 800-2927): a 189px
// sort control on the left gutter with the specialty dropdown and the type
// chips ranged right to x1363, then a four-column grid of 300x398 cards 30px
// apart with the promo panel in the fourth slot of the first page, and the
// pager centred 40px below the last row.
// Phones follow the modules in extra-modules-mobile: one card per row at the
// 16px gutter, the sort control and a "Show filters" disclosure stacked above
// it, each running the full 358px.
//
// Sorting, filtering and paging all live in the URL — the same `sort`,
// `specialty`, `type` and `page` parameters News & events and the search page
// use — so a narrowed library can be linked to, shared, crawled and reloaded,
// and the back button walks it. Nothing is fetched as it changes: the whole
// library travels with the story, so the filtering itself is still free.
const props = defineProps<{ blok: any }>()

const route = useRoute()
const router = useRouter()
const sbHref = useSbUrl()
// The pop-up prints the date the way the card does, in the visitor's language.
const { locale, locales } = useI18n()
const bcp47 = computed(() => {
  const active = (locales.value as any[]).find(l => (typeof l === 'string' ? l : l.code) === locale.value)
  return (active && typeof active !== 'string' && active.language) || locale.value
})

const items = computed<any[]>(() => props.blok.items || [])
const perPage = computed(() => Math.max(1, Number(props.blok.per_page) || 15))
const promoAt = computed(() => {
  const n = Number(props.blok.promo_position)
  return Number.isFinite(n) && n >= 0 ? n : -1
})
const hasPromo = computed(() => Boolean(props.blok.promo_headline || props.blok.promo_body))

// The chips used to spell their own text out of the key, which left
// "Publication", "Booklet" and "Video" in English on all four translated sites.
// They come from a vocabulary now, so the words travel with the language.
// The chips and the specialty list used to spell their own text out of the key,
// which left them English on all four translated sites. Both read the
// vocabularies now, so the words travel with the language.
const label = useVocabulary(['library-kinds', 'medical-specialties'])


// The chips and the specialty list are whatever the library actually holds, so
// an editor never has to keep a second list of filters in step with the cards.
const KIND_ORDER = ['publication', 'booklet', 'video', 'case', 'event']
const kinds = computed(() => {
  const seen = [...new Set(items.value.map(i => i.kind).filter(Boolean))] as string[]
  return seen.sort((a, b) => KIND_ORDER.indexOf(a) - KIND_ORDER.indexOf(b))
})
const specialties = computed(() => {
  const seen = [...new Set(items.value.map(i => i.specialty).filter(Boolean))] as string[]
  return seen.sort((a, b) => label(a).localeCompare(label(b)))
})

// ---- the view, read from the URL ------------------------------------------
const newest = computed(() => route.query.sort !== 'oldest')
const specialty = computed(() => String(route.query.specialty || ''))
// Several types can be on at once, so they travel as one comma-separated value
// rather than as a repeated parameter.
const activeKinds = computed(() =>
  String(route.query.type || '').split(',').map(k => k.trim()).filter(Boolean))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))

// Changing a filter always returns to the first page: page 3 of the old result
// set means nothing in the new one.
function setQuery(key: string, value: string) {
  router.push({ query: { ...route.query, [key]: value || undefined, page: undefined } })
}
// Waitak: "we will need a [Clear Filters X] button". It stands between the sort
// control and the chips and only appears once something is on, and it leaves the
// sort order alone: the frame shows it beside a sort control that keeps its own
// value, and resetting the order is not what "clear filters" says.
const hasFilters = computed(() => Boolean(specialty.value) || activeKinds.value.length > 0)
function clearFilters() {
  router.push({ query: { ...route.query, specialty: undefined, type: undefined, page: undefined } })
}
function toggleKind(kind: string) {
  const next = activeKinds.value.includes(kind)
    ? activeKinds.value.filter(k => k !== kind)
    : [...activeKinds.value, kind]
  setQuery('type', next.join(','))
}

const time = (i: any) => {
  const t = new Date(String(i.date || '').replace(' ', 'T')).valueOf()
  return Number.isNaN(t) ? 0 : t
}
const filtered = computed(() => {
  const list = items.value.filter(i =>
    (!specialty.value || i.specialty === specialty.value)
    && (!activeKinds.value.length || activeKinds.value.includes(i.kind)))
  return [...list].sort((a, b) => (newest.value ? time(b) - time(a) : time(a) - time(b)))
})
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))
const shown = computed(() => filtered.value.slice((page.value - 1) * perPage.value, page.value * perPage.value))

// The promo panel, one per page. Waitak: "it would always appear in any tab you
// would be. So even if you're on tab 5, you would see this card somewhere
// between the cards (only one). But it should never appear as the first 3
// cards." It was drawn on the first page only, so every page past it lost it.
// Its slot is clamped past the first three, and back inside a short last page
// so it is not stranded in a gap at the end of the grid.
// Its slot is clamped past the first three; a short last page has no such slot,
// so there it goes at the end rather than being dropped.
type Cell = { promo: true } | { promo: false, item: any }
const cells = computed<Cell[]>(() => {
  const out: Cell[] = shown.value.map(item => ({ promo: false as const, item }))
  if (!hasPromo.value || !out.length) return out
  const at = Math.min(Math.max(promoAt.value, 3), out.length)
  out.splice(at, 0, { promo: true })
  return out
})

// Page numbers: the design shows five. A longer library keeps the current page
// in a window, with the first and last page always reachable and an ellipsis
// for what is skipped.
const numbers = computed(() => pageSequence(page.value, pages.value))
const to = (n: number) => ({ query: { ...route.query, page: n === 1 ? undefined : n } })

const filtersOpen = ref(false)

// ---- the card pop-up ------------------------------------------------------
// Every card opens this (Desktop Shurui Pop-up state & Active): a header strip
// carrying the title, the line of copy, the tags and the date, then the piece
// itself. A video is still a facade, so nothing reaches Google until the visitor
// presses play: the poster is our own asset and the nocookie iframe is only
// created on that click.
const playing = ref<any>(null)
const dialog = ref<HTMLDialogElement>()
const started = ref(false)
const embedSrc = computed(() =>
  started.value && playing.value?.video_id
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(playing.value.video_id)}?autoplay=1&rel=0&modestbranding=1`
    : '',
)
const openDoc = computed(() => playing.value?.document?.filename || '')
const openHref = computed(() => {
  const l = playing.value?.link
  return l && (l.cached_url || l.url || l.story?.full_slug) ? sbHref(l) : null
})
const openTags = computed(() => [playing.value?.kind, playing.value?.specialty]
  .filter(Boolean)
  .map((v: string) => label(v)))
const openDate = computed(() => {
  const raw = playing.value?.date
  if (!raw) return ''
  const d = new Date(String(raw).replace(' ', 'T'))
  return Number.isNaN(d.valueOf())
    ? String(raw)
    : d.toLocaleDateString(bcp47.value, { day: 'numeric', month: 'long', year: 'numeric' })
})
function openItem(item: any) {
  playing.value = item
  started.value = false
  begin()
  nextTick(() => dialog.value?.showModal())
}
function closePlayer() {
  dialog.value?.close()
  playing.value = null
  started.value = false
}

// ---- the gate -------------------------------------------------------------
// Shared with News & events, which puts the same form in front of its cards.
const { granted, state: gateState, error: gateError, lead, valid, begin, submit: requestAccess } = useContentGate()
const { data: countries } = useGateCountries()

const promoHref = computed(() => {
  const l = props.blok.promo_link
  return l && (l.cached_url || l.url || l.story?.full_slug) ? sbHref(l) : null
})
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section lib"
    :data-theme="blok.theme || 'light'"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="container lib__inner">
      <div class="lib__controls">
        <ListingControl
          class="lib__sort"
          wide
          :label="newest ? (blok.sort_label || 'Most recent') : (blok.sort_oldest_label || 'Oldest first')"
          :name="blok.sort_name || 'Sort by'"
          :value="newest ? 'recent' : 'oldest'"
          :options="[
            { value: 'recent', label: blok.sort_label || 'Most recent' },
            { value: 'oldest', label: blok.sort_oldest_label || 'Oldest first' },
          ]"
          @change="setQuery('sort', $event === 'oldest' ? 'oldest' : '')"
        />

        <button v-if="hasFilters" type="button" class="lib__clear" @click="clearFilters">
          {{ blok.clear_filters_label || 'Clear filters' }}
          <Icon name="close" :size="20" />
        </button>

        <ListingControl
          class="lib__disclosure"
          variant="disclosure"
          controls="library-filters"
          :open="filtersOpen"
          :label="filtersOpen ? (blok.hide_filters_label || 'Hide filters') : (blok.show_filters_label || 'Show filters')"
          @toggle="filtersOpen = !filtersOpen"
        />

        <div id="library-filters" class="lib__filters" :class="{ 'is-open': filtersOpen }">
          <ListingControl
            v-if="specialties.length"
            class="lib__specialty"
            :label="specialty ? label(specialty) : (blok.specialty_label || 'Medical specialties')"
            :name="blok.specialty_label || 'Medical specialties'"
            :value="specialty"
            :options="[
              { value: '', label: blok.specialty_label || 'Medical specialties' },
              ...specialties.map(s => ({ value: s, label: label(s) })),
            ]"
            @change="setQuery('specialty', $event)"
          />

          <ListingControl
            v-for="kind in kinds"
            :key="kind"
            variant="toggle"
            class="lib__type"
            :class="`lib__type--${kind}`"
            :label="label(kind)"
            :on="activeKinds.includes(kind)"
            @toggle="toggleKind(kind)"
          />
        </div>
      </div>

      <div class="lib__grid">
        <template v-for="(cell, i) in cells" :key="cell.promo ? 'promo' : cell.item._uid">
          <article v-if="cell.promo" class="lib__promo">
            <h3 class="lib__promo-title"><BrandText :text="blok.promo_headline" /></h3>
            <p v-if="blok.promo_body" class="lib__promo-body"><BrandText :text="blok.promo_body" :nowrap="false" /></p>
            <NuxtLink v-if="promoHref" :to="promoHref" class="lib__promo-btn">
              {{ blok.promo_link_label || 'Book a demo' }}
            </NuxtLink>
          </article>
          <LibraryItem v-else :blok="cell.item" @open="openItem" />
        </template>
      </div>

      <p v-if="!shown.length" class="lib__empty">Nothing matches these filters yet.</p>

      <!-- Every step is a link, so a page of the library can be opened, shared
           and crawled. They all point at this same path, which is what the
           router calls "exact active", so each one that is not the current page
           has to clear the aria-current the router would otherwise mark it
           with. -->
      <nav v-if="pages > 1" class="lib__pager" aria-label="Library pages">
        <NuxtLink v-if="page > 1" :to="to(1)" class="lib__pg lib__pg--icon" :aria-current="undefined" aria-label="First page">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18.41 16.59 13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" /></svg>
        </NuxtLink>
        <span v-else class="lib__pg lib__pg--icon is-off" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false"><path d="M18.41 16.59 13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" /></svg>
        </span>

        <NuxtLink v-if="page > 1" :to="to(page - 1)" class="lib__pg lib__pg--icon" :aria-current="undefined" aria-label="Previous page" rel="prev">
          <Icon name="chevron-left" :size="20" />
        </NuxtLink>
        <span v-else class="lib__pg lib__pg--icon is-off" aria-hidden="true">
          <Icon name="chevron-left" :size="20" />
        </span>

        <template v-for="(n, i) in numbers" :key="`${n}-${i}`">
          <span v-if="n === '…'" class="lib__pg lib__pg--gap" aria-hidden="true">…</span>
          <NuxtLink
            v-else
            :to="to(n as number)"
            class="lib__pg"
            :class="{ 'is-current': n === page }"
            :aria-current="n === page ? 'page' : undefined"
            :aria-label="`Page ${n}`"
          >
            {{ n }}
          </NuxtLink>
        </template>

        <NuxtLink v-if="page < pages" :to="to(page + 1)" class="lib__pg lib__pg--icon" :aria-current="undefined" aria-label="Next page" rel="next">
          <Icon name="chevron-right" :size="20" />
        </NuxtLink>
        <span v-else class="lib__pg lib__pg--icon is-off" aria-hidden="true">
          <Icon name="chevron-right" :size="20" />
        </span>

        <NuxtLink v-if="page < pages" :to="to(pages)" class="lib__pg lib__pg--icon" :aria-current="undefined" aria-label="Last page">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5.59 7.41 10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" /></svg>
        </NuxtLink>
        <span v-else class="lib__pg lib__pg--icon is-off" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false"><path d="M5.59 7.41 10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" /></svg>
        </span>
      </nav>
    </div>

    <!-- The pop-up the cards open. The close mark sits outside the panel, top
         right, as the frame draws it. -->
    <dialog
      ref="dialog"
      class="lib__dialog"
      :aria-label="playing?.title || undefined"
      @close="closePlayer"
      @click.self="closePlayer"
    >
      <div v-if="playing" class="lib__pop">
        <button type="button" class="lib__close" :aria-label="blok.close_label || 'Close'" @click="closePlayer">
          <Icon name="close" :size="28" />
        </button>

        <div class="lib__pop-head">
          <div class="lib__pop-headings">
            <h3 class="lib__pop-title">{{ playing.title }}</h3>
            <p v-if="playing.excerpt" class="lib__pop-body">{{ playing.excerpt }}</p>
          </div>
          <div class="lib__pop-meta">
            <span class="lib__pop-tags">
              <span v-for="tag in openTags" :key="tag" class="lcard__tag">{{ tag }}</span>
            </span>
            <span v-if="openDate" class="lib__pop-date">{{ openDate }}</span>
          </div>
        </div>

        <div class="lib__pop-media" :class="{ 'lib__pop-media--gated': gateState !== 'open' }">
          <div v-if="playing.video_id && started" class="lib__frame">
            <iframe
              :src="embedSrc"
              :title="playing.title"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              referrerpolicy="strict-origin-when-cross-origin"
            />
          </div>
          <button
            v-else-if="playing.video_id"
            type="button"
            class="lib__poster"
            :aria-label="`Play video: ${playing.title}`"
            @click="gateState === 'open' ? started = true : null"
          >
            <img
              v-if="playing.image?.filename"
              :src="sbCrop(playing.image, 1700, 956)"
              :alt="playing.image.alt || ''"
            >
            <span class="lib__poster-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false"><path d="M8 5.5v13l11-6.5z" /></svg>
            </span>
          </button>
          <div v-else class="lib__poster">
            <img
              v-if="playing.image?.filename"
              :src="sbCrop(playing.image, 1700, 956)"
              :alt="playing.image.alt || ''"
            >
          </div>

          <!-- The gate. It covers the piece rather than replacing it, which is
               how the frame draws it: the header above stays readable. -->
          <ContentGate
            v-if="gateState !== 'open'"
            v-model="lead"
            class="lib__gate"
            :state="gateState"
            :error="gateError"
            :valid="valid"
            :countries="countries || []"
            :labels="{
              name: blok.gate_name_label, email: blok.gate_email_label, country: blok.gate_country_label,
              headline: blok.gate_headline, note: blok.gate_note, submit: blok.gate_submit_label,
              thanksTitle: blok.gate_thanks_title, thanksBody: blok.gate_thanks_body,
            }"
            @submit="requestAccess(playing?.title)"
          />
        </div>

        <div v-if="gateState === 'open' && (openDoc || openHref)" class="lib__pop-actions">
          <a v-if="openDoc" :href="openDoc" class="lib__pop-cta" download target="_blank" rel="noopener">
            {{ blok.download_label || 'Download' }}
          </a>
          <NuxtLink v-else-if="openHref" :to="openHref" class="lib__pop-cta">
            {{ blok.read_label || 'Read more' }}
          </NuxtLink>
        </div>
      </div>
    </dialog>
  </section>
</template>

<style scoped>
/* 78px from the banner to the controls, 40px to the grid, 40px to the pager and
   205px out to the contact band. */
.lib { padding: calc(5.42 * var(--sx)) 0 calc(14.24 * var(--sx)); }
.lib__inner { padding-inline: var(--gutter-design); }

.lib__controls { display: flex; flex-wrap: wrap; align-items: center; gap: 19px; }
.lib__filters { display: contents; }

/* The sort control is drawn at a fixed 189px on the left gutter; the filters
   range right against the other one. */
.lib__sort { flex: none; width: 189px; margin-right: auto; }
/* The disclosure only exists on phones; on the desktop the filters are always
   out. Written as a child selector so it outranks the control's own `display`
   whichever order the two stylesheets are served in. */
.lib__controls > .lib__disclosure { display: none; }
.lib__clear {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: 0.46px;
  color: var(--c-darkblue);
  cursor: pointer;
}
.lib__clear:hover { text-decoration: underline; text-underline-offset: 3px; }

/* The design draws the Video chip 115px wide — the width the dropdown component
   it was copied from takes — where the label alone measures 86. Keeping the
   drawn width is what lands the whole right-ranged cluster on the design's x
   positions; the chevron is deliberately not drawn, since the chip is a filter
   that is either on or off and has no menu behind it. */
.lib__type--video { width: 115px; }

.lib__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: calc(2.08 * var(--sx));                 /* 30 */
  margin-top: calc(2.78 * var(--sx));          /* 40 */
}
/* A grid item's automatic minimum is its content, which would push four cards
   wider than the page on a tablet; the design only draws four-up and one-up, so
   everything between them runs two columns. */
.lib__grid > * { min-width: 0; }
@media (max-width: 1180px) {
  .lib__grid { grid-template-columns: repeat(2, 1fr); }
}

/* Promo panel: solid brand blue, everything centred, the same 398px as a card. */
.lib__promo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  height: 398px;
  padding: 0 24px;
  background: var(--c-blue);
  color: var(--c-white);
  text-align: center;
}
.lib__promo-title { max-width: 210px; margin: 0; font-size: 1.5rem; font-weight: 600; line-height: 1.2083; }   /* 24/29 */
.lib__promo-body { margin: 23px 0 0; font-size: 1rem; font-weight: 300; line-height: 1.625; }  /* 16/26 */
.lib__promo-btn {
  margin-top: 22px;
  padding: 7px 21px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: var(--c-leather-300);
  color: var(--c-darkblue);
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.625rem;
  letter-spacing: 0.46px;
  text-decoration: none;
  box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);
}
.lib__promo-btn:hover { background: var(--c-white); }

.lib__empty { margin: calc(2.78 * var(--sx)) 0 0; color: var(--ink-muted); }

/* ---- pager ---- */
/* Every step is a link, so a page of the library can be opened, shared and
   crawled, and the back button walks the pages. */
.lib__pager {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: calc(2.78 * var(--sx));          /* 40 */
}
.lib__pg--gap { color: var(--ink-muted); cursor: default; }
.lib__pg {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: none;
  color: var(--c-darkblue);
  font-size: 0.875rem;                          /* 14 */
  font-weight: 400;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;
}
.lib__pg:hover { background: color-mix(in srgb, var(--c-darkblue) 8%, transparent); }
.lib__pg.is-current { background: var(--c-blue); color: var(--c-white); }
.lib__pg.is-current:hover { background: var(--c-blue-500); }
.lib__pg.is-off { opacity: 0.38; cursor: default; pointer-events: none; }
.lib__pg svg { width: 20px; height: 20px; fill: currentColor; }

/* ---- the card pop-up (Desktop Shurui Pop-up state & Active, 840 wide) ---- */
.lib__dialog {
  width: min(840px, calc(100vw - 32px));
  max-height: calc(100vh - 64px);
  padding: 0;
  border: 0;
  background: none;
  color: var(--c-darkblue);
  overflow: visible;
}
.lib__dialog::backdrop { background: rgb(31 39 57 / 72%); }
.lib__pop { position: relative; }
/* The frame hangs the close mark outside the panel, above its top right corner. */
.lib__close {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--c-white);
  cursor: pointer;
}
.lib__close:hover { opacity: 0.8; }

/* Waitak: "the item below the form should be shaded, so the card below the
   form". The frame sits the gate on the dimmed page, not on the card's own
   cover, so while the form is up the picture behind it is held back and only
   comes forward once the content is unlocked. */
.lib__pop-media--gated .lib__poster { opacity: 0.22; }

.lib__pop-head {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px;
  background: var(--c-white);
}
.lib__pop-headings { min-width: 0; }
/* "Lobectomy/Segmentectomy" is one unbreakable word on a phone, and it pushed
   the heading past its box and under the close mark. */
.lib__pop-title { margin: 0; overflow-wrap: anywhere; font-size: 1.375rem; font-weight: 600; line-height: 1.2083; }   /* 22 */
.lib__pop-body { margin: 10px 0 0; font-size: 1.125rem; font-weight: 300; line-height: 1.3; }
.lib__pop-meta { flex: none; display: grid; justify-items: end; gap: 10px; }
.lib__pop-tags { display: flex; gap: 7px; }
.lib__pop-tags span {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 9px;
  border: 1px solid var(--c-darkblue);
  border-radius: 4px;
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0.46px;
  white-space: nowrap;
}
.lib__pop-date { font-size: 0.75rem; font-weight: 400; line-height: 1.2; color: var(--c-black-300); }

.lib__pop-media { position: relative; aspect-ratio: 16 / 9; background: var(--c-black); }
.lib__poster { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: none; }
.lib__poster img { width: 100%; height: 100%; object-fit: cover; }
.lib__poster-play {
  position: absolute;
  inset: 50% auto auto 50%;
  translate: -50% -50%;
  display: grid;
  place-items: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgb(255 255 255 / 40%);
}
.lib__poster-play svg { width: 36px; height: 36px; fill: rgb(255 255 255 / 88%); }
button.lib__poster { cursor: pointer; }
.lib__frame { position: absolute; inset: 0; background: var(--c-black); }
.lib__frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }

/* ---- the gate ---- */
.lib__gate {
  position: absolute;
  inset: 24px;
  display: grid;
  background: var(--c-neutral-300);
}
.lib__field input,
.lib__field input:focus-visible,
/* The frame marks a filled field with a green rule and a tick. */

.lib__pop-actions { display: flex; gap: 16px; padding: 20px 24px; background: var(--c-white); }
.lib__pop-cta {
  display: inline-flex;
  align-items: center;
  height: 42px;
  padding: 0 21px;
  border-radius: 4px;
  background: var(--c-blue);
  color: var(--c-white);
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: 0.46px;
  text-decoration: none;
}
.lib__pop-cta:hover { background: var(--c-blue-500); }

/* Phone modules (extra-modules-mobile): the sort control and the filters
   disclosure each run the full 358px, 32px apart, then one card per row. */
@media (max-width: 720px) {
  .lib { padding: 56px 0 96px; }
  .lib__inner { padding-inline: 16px; }
  .lib__controls { flex-direction: column; align-items: stretch; gap: 32px; }
  /* Every control runs the design's full 358px; the drawn 13px inset and 24px
     chevron are the control's own phone geometry. */
  .lib__sort, .lib__specialty, .lib__type, .lib__type--video { width: 100%; margin-right: 0; }
  .lib__controls > .lib__disclosure { display: inline-flex; width: 100%; }
  .lib__filters {
    display: grid;
    gap: 16px;
    margin-top: -16px;                         /* 16px under the disclosure, not 32 */
  }
  .lib__filters:not(.is-open) { display: none; }
  /* Matching News & events: 30 reads as cramped once the cards are full width. */
  .lib__grid { grid-template-columns: 1fr; gap: 48px; margin-top: 32px; }
  .lib__promo { height: auto; padding: 48px 24px; }
  .lib__pager { gap: 0; margin-top: 32px; }
  .lib__pg { width: 38px; }
  /* The phone frame gives the gate the room it needs instead of fitting it into
     the 16:9 media: at 390 that box is only 206 tall and the form is 290, so it
     spilled past the foot of the dialog. Gated, the panel sizes to the form and
     the media's shape comes back when the content does. */
  .lib__dialog { width: calc(100vw - 32px); max-height: calc(100dvh - 32px); overflow-y: auto; }
  /* Waitak: "no exit button for the pop-up in the mobile version". The frame
     hangs the close mark above the panel, which on a phone puts it off the top
     of the screen, since the dialog fills the viewport. Here it sits inside the
     panel instead, over its own corner. */
  /* Waitak, 20 October: "exit button breaks the layout, should we place it
     inside of the card?" The floated version escaped the header box and sat
     over the title. It is pinned to the panel's own corner now, and the header
     keeps its right side clear so nothing runs under it. */
  .lib__close {
    position: absolute;
    z-index: 2;
    top: 6px;
    right: 6px;
    bottom: auto;
    float: none;
    margin: 0;
    color: var(--ink);
  }

  .lib__pop-head { flex-direction: column; gap: 12px; padding: 16px 56px 16px 16px; }
  .lib__pop-meta { justify-items: start; }
  .lib__pop-media--gated { aspect-ratio: auto; }
  /* Gated, the panel is the whole of the media box, so the piece behind it is
     not on show above the form. */
  .lib__pop-media--gated .lib__poster { display: none; }
  .lib__gate { position: static; inset: auto; }
  .lib__pop-actions { padding: 16px; }
  .lib__pop-cta { flex: 1 1 auto; justify-content: center; }
}
</style>
