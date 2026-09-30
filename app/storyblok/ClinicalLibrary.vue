<script setup lang="ts">
// Clinical Library listing (Figma clinical-library-desktop, 800-2927): a sort
// select at the left gutter with the specialty select and the type chips ranged
// right, then a four-column grid of 300x398 cards 30px apart with the promo
// panel in the fourth slot, and the pager centred 40px below the last row.
// Phones follow the modules in extra-modules-mobile: one card per row at the
// 16px gutter, the sort select and a "Show filters" disclosure stacked above it.
//
// Everything filters, sorts and pages in the browser: the whole library travels
// with the story, so no request is made as the visitor narrows it down.
const props = defineProps<{ blok: any }>()

const sbHref = useSbUrl()
const items = computed<any[]>(() => props.blok.items || [])
const perPage = computed(() => Math.max(1, Number(props.blok.per_page) || 15))
const promoAt = computed(() => {
  const n = Number(props.blok.promo_position)
  return Number.isFinite(n) && n >= 0 ? n : -1
})
const hasPromo = computed(() => Boolean(props.blok.promo_headline || props.blok.promo_body))

const label = (v: string) => (v ? v.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase()) : '')

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

const sort = ref<'recent' | 'oldest'>('recent')
const specialty = ref('')
const activeKinds = ref<string[]>([])
const page = ref(1)
const filtersOpen = ref(false)

const time = (i: any) => {
  const t = new Date(String(i.date || '').replace(' ', 'T')).valueOf()
  return Number.isNaN(t) ? 0 : t
}
const filtered = computed(() => {
  const list = items.value.filter(i =>
    (!specialty.value || i.specialty === specialty.value)
    && (!activeKinds.value.length || activeKinds.value.includes(i.kind)))
  return [...list].sort((a, b) => (sort.value === 'recent' ? time(b) - time(a) : time(a) - time(b)))
})
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))
const shown = computed(() => filtered.value.slice((page.value - 1) * perPage.value, page.value * perPage.value))

watch([sort, specialty, activeKinds], () => { page.value = 1 }, { deep: true })

const listTop = ref<HTMLElement>()
function goToPage(n: number) {
  const next = Math.min(pages.value, Math.max(1, n))
  if (next === page.value) return
  page.value = next
  const reduce = import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  listTop.value?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
function toggleKind(kind: string) {
  activeKinds.value = activeKinds.value.includes(kind)
    ? activeKinds.value.filter(k => k !== kind)
    : [...activeKinds.value, kind]
}

// Page numbers: the design shows five. Longer libraries keep the current page in
// a five-wide window rather than printing every number.
const numbers = computed(() => {
  const total = pages.value
  const span = Math.min(5, total)
  let start = Math.max(1, page.value - Math.floor(span / 2))
  start = Math.min(start, total - span + 1)
  return Array.from({ length: span }, (_, i) => start + i)
})

// ---- video facade ---------------------------------------------------------
// Nothing reaches Google until the visitor presses play: the poster is our own
// asset and the nocookie iframe is only created here, on the click.
const playing = ref<any>(null)
const dialog = ref<HTMLDialogElement>()
const embedSrc = computed(() =>
  playing.value?.video_id
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(playing.value.video_id)}?autoplay=1&rel=0&modestbranding=1`
    : '',
)
function play(item: any) {
  playing.value = item
  nextTick(() => dialog.value?.showModal())
}
function closePlayer() {
  dialog.value?.close()
  playing.value = null
}

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
      <div ref="listTop" class="lib__controls">
        <label class="lib__field lib__field--sort">
          <span class="lib__sr">{{ blok.sort_name || 'Sort by' }}</span>
          <select v-model="sort" class="lib__select">
            <option value="recent">{{ blok.sort_label || 'Most recent' }}</option>
            <option value="oldest">{{ blok.sort_oldest_label || 'Oldest first' }}</option>
          </select>
          <Icon name="expand-more" :size="12" class="lib__chev" />
        </label>

        <button
          type="button"
          class="lib__field lib__field--disclosure"
          :aria-expanded="filtersOpen"
          aria-controls="library-filters"
          @click="filtersOpen = !filtersOpen"
        >
          <span>{{ filtersOpen ? (blok.hide_filters_label || 'Hide filters') : (blok.show_filters_label || 'Show filters') }}</span>
          <Icon name="expand-more" :size="12" class="lib__chev" :class="{ 'is-open': filtersOpen }" />
        </button>

        <div id="library-filters" class="lib__filters" :class="{ 'is-open': filtersOpen }">
          <label v-if="specialties.length" class="lib__field lib__field--specialty">
            <span class="lib__sr">{{ blok.specialty_label || 'Medical specialties' }}</span>
            <select v-model="specialty" class="lib__select">
              <option value="">{{ blok.specialty_label || 'Medical specialties' }}</option>
              <option v-for="s in specialties" :key="s" :value="s">{{ label(s) }}</option>
            </select>
            <Icon name="expand-more" :size="12" class="lib__chev" />
          </label>

          <button
            v-for="kind in kinds"
            :key="kind"
            type="button"
            class="lib__chip"
            :class="{ 'is-on': activeKinds.includes(kind) }"
            :aria-pressed="activeKinds.includes(kind)"
            @click="toggleKind(kind)"
          >
            {{ label(kind) }}
          </button>
        </div>
      </div>

      <div class="lib__grid">
        <template v-for="(item, i) in shown" :key="item._uid">
          <article v-if="hasPromo && i === promoAt" class="lib__promo">
            <h3 class="lib__promo-title"><BrandText :text="blok.promo_headline" /></h3>
            <p v-if="blok.promo_body" class="lib__promo-body"><BrandText :text="blok.promo_body" :nowrap="false" /></p>
            <NuxtLink v-if="promoHref" :to="promoHref" class="lib__promo-btn">
              {{ blok.promo_link_label || 'Book a demo' }}
            </NuxtLink>
          </article>
          <LibraryItem :blok="item" @play="play" />
        </template>
      </div>

      <p v-if="!shown.length" class="lib__empty">Nothing matches these filters yet.</p>

      <nav v-if="pages > 1" class="lib__pager" aria-label="Library pages">
        <button type="button" class="lib__pg lib__pg--icon" :disabled="page === 1" aria-label="First page" @click="goToPage(1)">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18.41 16.59 13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" /></svg>
        </button>
        <button type="button" class="lib__pg lib__pg--icon" :disabled="page === 1" aria-label="Previous page" @click="goToPage(page - 1)">
          <Icon name="chevron-left" :size="20" />
        </button>
        <button
          v-for="n in numbers"
          :key="n"
          type="button"
          class="lib__pg"
          :class="{ 'is-current': n === page }"
          :aria-current="n === page ? 'page' : undefined"
          @click="goToPage(n)"
        >
          {{ n }}
        </button>
        <button type="button" class="lib__pg lib__pg--icon" :disabled="page === pages" aria-label="Next page" @click="goToPage(page + 1)">
          <Icon name="chevron-right" :size="20" />
        </button>
        <button type="button" class="lib__pg lib__pg--icon" :disabled="page === pages" aria-label="Last page" @click="goToPage(pages)">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5.59 7.41 10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" /></svg>
        </button>
      </nav>
    </div>

    <dialog
      ref="dialog"
      class="lib__dialog"
      :aria-label="playing?.title || undefined"
      @close="playing = null"
      @click.self="closePlayer"
    >
      <div v-if="playing" class="lib__player">
        <button type="button" class="lib__close" aria-label="Close video" @click="closePlayer">
          <Icon name="close" :size="24" />
        </button>
        <h3 class="lib__player-title">{{ playing.title }}</h3>
        <div class="lib__frame">
          <iframe
            :src="embedSrc"
            :title="playing.title"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          />
        </div>
        <p v-if="playing.excerpt" class="lib__player-body">{{ playing.excerpt }}</p>
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

.lib__field {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 42px;
  padding: 0 20px 0 22px;
  border: 1px solid var(--c-darkblue);
  border-radius: 4px;
  background: var(--surface);
  color: var(--c-darkblue);
  font-size: 0.9375rem;                       /* 15 */
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0.46px;                     /* the MUI control tracking the design is built on */
  cursor: pointer;
}
/* The disclosure only exists on phones; on the desktop the filters are always out. */
.lib__field--disclosure { display: none; }
.lib__field--sort { min-width: 189px; padding-left: 14px; margin-right: auto; }
.lib__field--specialty { min-width: 220px; }
.lib__select {
  flex: 1;
  appearance: none;
  padding: 0 28px 0 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.lib__select:focus-visible { outline: none; }
.lib__field:focus-within { outline: 2px solid var(--c-blue); outline-offset: 2px; }
.lib__chev { position: absolute; right: 20px; pointer-events: none; transition: rotate 200ms ease; }
.lib__chev.is-open { rotate: 180deg; }
.lib__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.lib__chip {
  height: 42px;
  padding: 0 22px;
  border: 1px solid var(--c-darkblue);
  border-radius: 4px;
  background: var(--surface);
  color: var(--c-darkblue);
  font-size: 0.9375rem;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0.46px;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 180ms ease, color 180ms ease;
}
.lib__chip:hover { background: color-mix(in srgb, var(--c-darkblue) 7%, transparent); }
.lib__chip.is-on { background: var(--c-darkblue); color: var(--c-white); }

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

.lib__pager {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: calc(2.78 * var(--sx));          /* 40 */
}
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
  cursor: pointer;
}
.lib__pg:hover { background: color-mix(in srgb, var(--c-darkblue) 8%, transparent); }
.lib__pg.is-current { background: var(--c-blue); color: var(--c-white); }
.lib__pg.is-current:hover { background: var(--c-blue-500); }
.lib__pg[disabled] { opacity: 0.38; cursor: default; }
.lib__pg[disabled]:hover { background: none; }
.lib__pg svg { width: 20px; height: 20px; fill: currentColor; }

/* ---- video dialog ---- */
.lib__dialog {
  width: min(960px, calc(100vw - 32px));
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: var(--c-white);
  color: var(--c-darkblue);
}
.lib__dialog::backdrop { background: rgb(31 39 57 / 72%); }
.lib__player { position: relative; padding: 24px; }
.lib__close {
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--c-darkblue);
  cursor: pointer;
}
.lib__close:hover { background: color-mix(in srgb, var(--c-darkblue) 8%, transparent); }
.lib__player-title { margin: 0 52px 16px 0; font-size: 1.125rem; font-weight: 600; line-height: 1.2083; }
.lib__frame { position: relative; aspect-ratio: 16 / 9; background: var(--c-black); }
.lib__frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.lib__player-body { margin: 16px 0 0; font-size: 1rem; font-weight: 300; line-height: 1.625; }

/* Phone modules (extra-modules-mobile): the sort select and the filters
   disclosure each run the full 358px, 32px apart, then one card per row. */
@media (max-width: 720px) {
  .lib { padding: 56px 0 96px; }
  .lib__inner { padding-inline: 16px; }
  .lib__controls { flex-direction: column; align-items: stretch; gap: 32px; }
  .lib__field--sort { min-width: 0; margin-right: 0; }
  .lib__field--specialty { min-width: 0; }
  .lib__field--disclosure { display: inline-flex; justify-content: flex-start; padding-left: 14px; }
  .lib__filters {
    display: grid;
    gap: 16px;
    margin-top: -16px;
  }
  .lib__filters:not(.is-open) { display: none; }
  .lib__chip { width: 100%; text-align: left; }
  .lib__grid { grid-template-columns: 1fr; gap: 30px; margin-top: 32px; }
  .lib__promo { height: auto; padding: 48px 24px; }
  .lib__pager { gap: 0; margin-top: 32px; }
  .lib__pg { width: 38px; }
  .lib__player { padding: 16px; }
}
</style>
