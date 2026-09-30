<script setup lang="ts">
// Clinical centers (Figma clinical-centers-desktop, 1440x4207).
//
// Desktop is one band under the header: the 48/58 title at the 75px gutter,
// then a country heading (Inter 600 34/41) over its hospitals (Inter 300
// 16/26) on a 26px grid, one country 48.7px under the last name of the one
// before, and 185px from the last name out to the footer band. Every distance
// is set from the design's ink rather than its text boxes, which sit ~3px high
// of the glyphs at 48px and ~2px at 34px.
//
// No phone frame was drawn for this page, but extra-modules-mobile carries the
// module it needs (y20285-21101): the same countries as an accordion — a
// hairline over every row, the country and its count in brand blue at 24/29
// with a 26px plus/minus at the right, and the open panel listing each centre
// as a 20/24 semibold name over an 18/29 Light line. Rows are 106px tall and
// the panel runs to 57px above the next hairline.
//
// Above 720px every panel is drawn open and the headings are plain text, so the
// toggles disable themselves and drop `aria-expanded` rather than telling a
// screen reader a visible list is collapsed.
const props = defineProps<{ blok: any }>()
const language = useStoryblokLanguage()

// Centres and country labels travel together: the labels are the `countries`
// datasource's own names, never a list written into this component.
const { data: source } = await useAsyncData(
  () => `center-list-${language.value}`,
  async () => {
    const api = useStoryblokApi()
    const version = useStoryblokVersion()
    const [stories, countries] = await Promise.all([
      api.getAll('cdn/stories', {
        content_type: 'clinical_center',
        version,
        language: language.value,
        per_page: 100,
      }),
      api.getAll('cdn/datasource_entries', { datasource: 'countries', per_page: 100 }),
    ])
    return {
      centers: (stories as any[]).map(s => ({
        uuid: s.uuid,
        name: s.content?.name || s.name,
        country: s.content?.country || '',
        city: s.content?.city || '',
        coordinates: s.content?.coordinates || '',
      })),
      countries: (countries as any[]).map(e => ({ name: e.name, value: e.value })),
    }
  },
)

// A country is stored either as the datasource value ("DE") or as the entry's
// own name slugified ("germany") — the centres loaded so far use the second.
// Both are matched, so neither convention loses its label.
const key = (v: unknown) => String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const labels = computed(() => {
  const map = new Map<string, string>()
  for (const e of source.value?.countries || []) {
    if (e.value) map.set(key(e.value), e.name)
    if (e.name) map.set(key(e.name), e.name)
  }
  return map
})
const labelFor = (k: string) => labels.value.get(k) || k.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase())

// "lat,lng", and nothing else. Every centre loaded so far has the field empty —
// the coordinates were left for the client rather than guessed — so anything
// that is not a real pair of degrees, 0,0 included, yields no location at all
// instead of a pin off the Gulf of Guinea.
const geoOf = (raw: string) => {
  const parts = String(raw || '').split(',')
  if (parts.length !== 2) return null
  const nums = parts.map(v => Number(v.trim()))
  const lat = nums[0] ?? Number.NaN
  const lng = nums[1] ?? Number.NaN
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  if (lat === 0 && lng === 0) return null
  return { lat, lng }
}

// The design's country order is neither alphabetical nor by size, so it is
// content: a comma-separated list of country keys. Anything with centres that
// the list does not name follows, by label.
const order = computed(() => String(props.blok.order || '').split(',').map(key).filter(Boolean))

const groups = computed(() => {
  const by = new Map<string, any[]>()
  for (const c of source.value?.centers || []) {
    const k = key(c.country) || 'other'
    if (!by.has(k)) by.set(k, [])
    by.get(k)!.push({ ...c, geo: geoOf(c.coordinates) })
  }
  const rest = [...by.keys()].filter(k => !order.value.includes(k))
    .sort((a, b) => labelFor(a).localeCompare(labelFor(b), 'en'))
  return [...order.value.filter(k => by.has(k)), ...rest].map(k => ({
    key: k,
    label: labelFor(k),
    // The design's order inside a country cannot be read off a list whose names
    // differ from the stories', so centres read alphabetically.
    list: by.get(k)!.sort((a, b) => String(a.name).localeCompare(String(b.name), 'en')),
  }))
})

// Phones draw the first country open, as the module does. `chosen` stays null
// until someone presses a heading, so closing that first panel leaves it closed
// rather than falling back to the default and springing open again.
const chosen = ref<string[] | null>(null)
const open = computed(() => chosen.value ?? (groups.value[0] ? [groups.value[0].key] : []))
const isOpen = (k: string) => open.value.includes(k)

const compact = ref(true)
const toggle = (k: string) => {
  if (!compact.value) return
  chosen.value = isOpen(k) ? open.value.filter(x => x !== k) : [...open.value, k]
}

// Above 720px every panel is drawn open whatever the state says, so the state
// is brought into line with what is on screen instead of leaving the headings
// claiming to be collapsed.
onMounted(() => {
  const mq = window.matchMedia('(max-width: 720px)')
  const sync = () => {
    compact.value = mq.matches
    if (!mq.matches) chosen.value = groups.value.map(g => g.key)
    else if (open.value.length > 1) chosen.value = open.value.slice(0, 1)
  }
  sync()
  mq.addEventListener('change', sync)
  onBeforeUnmount(() => mq.removeEventListener('change', sync))
})

// undefined, not null: Vue's style binding accepts string | number | undefined.
const px = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : `${Number(v)}px`)
const style = computed(() => ({
  '--cl-top': px(props.blok.space_top),
  '--cl-bottom': px(props.blok.space_bottom),
  '--cl-top-m': px(props.blok.space_top_mobile),
  '--cl-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section cl"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="cl__inner">
      <h1 v-if="blok.headline" class="cl__h"><BrandText :text="blok.headline" /></h1>

      <div class="cl__groups">
        <div v-for="group in groups" :key="group.key" class="cl__group">
          <h2 class="cl__country">
            <button
              type="button"
              class="cl__toggle"
              :disabled="!compact"
              :aria-expanded="compact ? isOpen(group.key) : undefined"
              :aria-controls="`${blok._uid}-${group.key}`"
              @click="toggle(group.key)"
            >
              <span>{{ group.label }}<span class="cl__count">&#32;({{ group.list.length }})</span></span>
              <span class="cl__icon" aria-hidden="true" />
            </button>
          </h2>

          <ul
            :id="`${blok._uid}-${group.key}`"
            class="cl__list"
            :class="{ 'is-open': isOpen(group.key) }"
          >
            <li
              v-for="center in group.list"
              :key="center.uuid"
              class="cl__item"
              itemscope
              itemtype="https://schema.org/Hospital"
            >
              <span class="cl__name" itemprop="name">{{ center.name }}</span>
              <span v-if="center.city" class="cl__where" itemprop="address">{{ center.city }}</span>
              <!-- Only a centre with real degrees carries a location. -->
              <span v-if="center.geo" itemprop="geo" itemscope itemtype="https://schema.org/GeoCoordinates">
                <meta itemprop="latitude" :content="String(center.geo.lat)">
                <meta itemprop="longitude" :content="String(center.geo.lng)">
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* The title's glyphs land on the design's at y239 and the last name's at 185px
   above the footer band; the heading offsets below carry the rest of the ink
   correction, so a group's names stay where the design draws them. */
.cl { padding-block: var(--cl-top, 151px) var(--cl-bottom, 166px); }
.cl__inner {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: clamp(16px, 5.21vw, 75px);   /* the design's 75px gutter */
}

.cl__h {
  margin: 0 0 53px;
  font-size: clamp(2rem, 3.33vw, 3rem);        /* 48 */
  font-weight: 600;
  line-height: 1.2083;                         /* 58/48 */
  color: var(--ink);
}

.cl__group + .cl__group { margin-top: 28px; }

.cl__country {
  margin: 0;
  font-size: clamp(1.5rem, 2.36vw, 2.125rem);  /* 34 */
  font-weight: 600;
  line-height: 1.2059;                         /* 41/34 */
  color: var(--ink);
}
/* Desktop draws the heading as plain text: no count, no marker, nothing to
   press. The element stays a button so phones need no second markup path. */
.cl__toggle {
  display: block;
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  -webkit-text-fill-color: currentcolor;       /* Safari greys disabled buttons */
  opacity: 1;
}
.cl__count, .cl__icon { display: none; }

.cl__list { margin: -2px 0 0; padding: 0; list-style: none; }
.cl__item {
  font-size: 1rem;                             /* 16 */
  font-weight: 300;
  line-height: 1.625;                          /* 26/16 */
  color: var(--ink);
}
.cl__where { display: none; }

/* Phone modules (extra-modules-mobile 20285-21101): the country accordion. */
@media (max-width: 720px) {
  .cl { padding-block: var(--cl-top-m, 56px) var(--cl-bottom-m, 96px); }
  .cl__inner { padding-inline: 16px; }         /* the phone designs' gutter */
  .cl__h { margin-bottom: 40px; font-size: clamp(2rem, 9.5vw, 2.5rem); }   /* as the IFU page, the other title-over-list page with no phone frame */

  .cl__groups { border-bottom: 1px solid var(--c-darkblue-200); }
  .cl__group { border-top: 1px solid var(--c-darkblue-200); }
  .cl__group + .cl__group { margin-top: 0; }

  .cl__country { font-size: 1.5rem; line-height: 1.2083; color: var(--accent); }   /* 24/29 */
  .cl__toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 38px 15px 38px 0;                 /* the row is 106px tall */
    cursor: pointer;
  }
  .cl__count { display: inline; }

  /* 26x26, 4px bars; the upright drops away when the panel is open. */
  .cl__icon { position: relative; display: block; flex: none; width: 26px; height: 26px; }
  .cl__icon::before,
  .cl__icon::after { content: ''; position: absolute; background: var(--ink); }
  .cl__icon::before { inset: 11px 0; }
  .cl__icon::after { inset: 0 11px; }
  .cl__toggle[aria-expanded='true'] .cl__icon::after { display: none; }

  .cl__list { display: none; padding: 10px 0 57px; }
  .cl__list.is-open { display: block; }
  .cl__item {
    font-size: 1.25rem;                        /* 20 */
    font-weight: 600;
    line-height: 1.2;                          /* 24/20 */
  }
  .cl__item + .cl__item { margin-top: 24px; }
  .cl__name { display: block; }
  /* The module draws a street address here; `clinical_center` holds only a
     city, and seven of the twenty give a province instead, so those entries
     print their name alone rather than an invented address. */
  .cl__where {
    display: block;
    margin-top: 4px;
    font-size: 1.125rem;                       /* 18 */
    font-weight: 300;
    line-height: 1.6111;                       /* 29/18 */
    color: var(--ink);
  }
}
</style>
