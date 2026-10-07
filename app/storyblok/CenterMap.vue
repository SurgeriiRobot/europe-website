<script setup lang="ts">
// "Where can you find us" (contact-desktop 2560-3890).
//
// A centred 48/58 title over an 18px brand-blue link to the full centres page,
// then one row per country on the 75px gutter measure: a 1px hairline above
// every row and below the last, the country and its count together in Inter 600
// 34/41 brand blue 24px in, and a 26px plus centred in the 94px row 42px from
// the right. Under them a dotted world map, 1258x516 of ink 86px below the last
// hairline, carrying one pin per country.
//
// Every distance is set from the design's ink rather than its text boxes: the
// row text sits 4.6px above the centre of its row, which is why the rows pad
// 21/31 rather than evenly and the plus is centred on the row itself.
//
// The basemap is a flat illustration lifted out of the design PDF, not a tile
// layer. Pulling in a mapping library would hand a third party every visitor's
// address for three static markers, and the consent work has not accounted for
// one, so the markers are drawn over the image instead.
//
// Phones follow the module library (extra-modules-mobile 20285-21101, the same
// country accordion the clinical centres list uses): 106px rows at the 16px
// gutter, 24/29 brand blue over a 1px #8182af hairline.
const props = defineProps<{ blok: any }>()
const language = useStoryblokLanguage()
const url = useSbUrl()

// Centres and country labels travel together: the labels are the `countries`
// datasource's own names, never a list written into this component.
const { data: source } = await useAsyncData(
  () => `center-map-${language.value}-${props.blok.source}-${props.blok.region || 'all'}`,
  async () => {
    const api = useStoryblokApi()
    const version = useStoryblokVersion()
    const [stories, countries] = await Promise.all([
      api.getAll('cdn/stories', {
        content_type: 'clinical_center',
        version,
        language: language.value,
        per_page: 100,
        ...(props.blok.source === 'by-region' && props.blok.region
          ? { search_term: props.blok.region }
          : {}),
      }),
      api.getAll('cdn/datasource_entries', { datasource: 'countries', per_page: 100 }),
    ])
    return {
      centers: (stories as any[]).map(s => ({
        uuid: s.uuid,
        // Each centre has its own page, so an opened row links out to it.
        slug: s.full_slug,
        name: s.content?.name || s.name,
        country: s.content?.country || '',
        city: s.content?.city || '',
        coordinates: s.content?.coordinates || '',
      })),
      countries: (countries as any[]).map(e => ({ name: e.name, value: e.value })),
    }
  },
)

const key = (v: unknown) => String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// The design prints "Spain", not "ES": the label is the datasource entry's own
// name, so it travels with the locale instead of being spelled out here.
const labels = computed(() => {
  const map = new Map<string, string>()
  for (const e of source.value?.countries || []) {
    if (e.value) map.set(key(e.value), e.name)
    if (e.name) map.set(key(e.name), e.name)
  }
  return map
})
const labelFor = (k: string) => labels.value.get(k) || k.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase())

// A country can be written either way: the centres hold the datasource code
// ("DE") while an editor naturally writes the name ("germany") in the order
// field or on a pin. Both resolve to the code, so the three always meet.
const canonical = computed(() => {
  const map = new Map<string, string>()
  for (const e of source.value?.countries || []) {
    const code = key(e.value)
    if (code) {
      map.set(code, code)
      if (e.name) map.set(key(e.name), code)
    }
  }
  return map
})
const canon = (v: unknown) => {
  const k = key(v)
  return canonical.value.get(k) || k
}

// "lat,lng", and nothing else. Every centre loaded so far has the field empty:
// the coordinates were left for the client rather than guessed, so anything
// that is not a real pair of degrees, 0,0 included, yields no location at all
// instead of a marker off the Gulf of Guinea.
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
const order = computed(() => String(props.blok.order || '').split(',').map(canon).filter(Boolean))

const groups = computed(() => {
  const by = new Map<string, any[]>()
  for (const c of source.value?.centers || []) {
    const k = canon(c.country) || 'other'
    if (!by.has(k)) by.set(k, [])
    by.get(k)!.push({ ...c, geo: geoOf(c.coordinates) })
  }
  const rest = [...by.keys()].filter(k => !order.value.includes(k))
    .sort((a, b) => labelFor(a).localeCompare(labelFor(b), 'en'))
  return [...order.value.filter(k => by.has(k)), ...rest].map(k => ({
    key: k,
    label: labelFor(k),
    list: by.get(k)!.sort((a, b) => String(a.name).localeCompare(String(b.name), 'en')),
  }))
})

// A pin is placed on the basemap, not projected onto it: the drawing is an
// illustration with no stated projection, and all twenty centres have an empty
// `coordinates`, so there is nothing to project. Each pin carries the share of
// the map's width and height the design draws it at, measured off the render;
// a pin whose country has no centres, or whose position is missing or out of
// range, is simply not drawn, so an unfilled field never lands a marker at 0,0.
const pct = (v: unknown) => {
  const n = Number(v)
  return v !== '' && v !== null && v !== undefined && Number.isFinite(n) && n >= 0 && n <= 100 ? n : undefined
}

const placed = computed(() => {
  const map = new Map<string, { x: number, y: number, blok: any }>()
  for (const pin of (props.blok.pins || []) as any[]) {
    const k = canon(pin?.country)
    const x = pct(pin?.x)
    const y = pct(pin?.y)
    if (!k || x === undefined || y === undefined) continue
    map.set(k, { x, y, blok: pin })
  }
  return map
})

const pins = computed(() => groups.value.flatMap((g) => {
  const at = placed.value.get(g.key)
  return at ? [{ key: g.key, blok: at.blok, style: { left: `${at.x}%`, top: `${at.y}%` } }] : []
}))

const basemap = computed(() => (props.blok.basemap?.filename ? props.blok.basemap : null))
const href = computed(() => url(props.blok.link))
const hasLink = computed(() => Boolean(props.blok.link_label) && href.value !== '#')

// undefined, not null: Vue's style binding accepts string | number | undefined.
const px = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : `${Number(v)}px`)
const style = computed(() => ({
  '--cm-top': px(props.blok.space_top),
  '--cm-bottom': px(props.blok.space_bottom),
  '--cm-top-m': px(props.blok.space_top_mobile),
  '--cm-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section cmap"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="cmap__inner">
      <h2 v-if="blok.headline" class="cmap__h"><BrandText :text="blok.headline" /></h2>

      <p v-if="hasLink" class="cmap__more">
        <NuxtLink :to="href" class="cmap__link">{{ blok.link_label }}</NuxtLink>
      </p>

      <div v-if="groups.length" class="cmap__rows">
        <details v-for="group in groups" :key="group.key" class="cmap__row">
          <summary class="cmap__summary">
            <span class="cmap__country">{{ group.label }}&#32;({{ group.list.length }})</span>
            <span class="cmap__marker" aria-hidden="true" />
          </summary>
          <ul class="cmap__list">
            <li
              v-for="center in group.list"
              :key="center.uuid"
              class="cmap__item"
              itemscope
              itemtype="https://schema.org/Hospital"
            >
              <!-- Not a link. Each centre does have a story, but it holds only the
                   name, the city and the country code, so every row led to a page
                   with nothing on it (Waitak: "the links lead to empty pages").
                   Restore the NuxtLink once a centre page carries content. -->
              <span class="cmap__name" itemprop="name">{{ center.name }}</span>
              <span v-if="center.city" class="cmap__where" itemprop="address">{{ center.city }}</span>
              <!-- Only a centre with real degrees carries a location. -->
              <span v-if="center.geo" itemprop="geo" itemscope itemtype="https://schema.org/GeoCoordinates">
                <meta itemprop="latitude" :content="String(center.geo.lat)">
                <meta itemprop="longitude" :content="String(center.geo.lng)">
              </span>
            </li>
          </ul>
        </details>
      </div>

      <!-- The rows above name every country and its count in text, so the
           drawing repeats what has already been read out: it is decorative. -->
      <div v-if="basemap" class="cmap__map">
        <img
          class="cmap__base"
          :src="sbCrop(basemap, 1258)"
          :srcset="`${sbCrop(basemap, 1258)} 1258w, ${sbCrop(basemap, 2516)} 2516w`"
          sizes="(max-width: 1440px) 88vw, 1258px"
          width="1258"
          height="516"
          alt=""
          loading="lazy"
          decoding="async"
        >
        <span v-for="pin in pins" :key="pin.key" v-editable="pin.blok" class="cmap__pin" :style="pin.style" aria-hidden="true">
          <svg viewBox="0 0 46 67" fill="none" focusable="false">
            <path
              d="M5.13 34.02A21 21 0 1 1 40.87 34.02L23 63Z"
              stroke="currentColor"
              stroke-width="4"
            />
          </svg>
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 73.4 over the title's line box puts its glyphs on the design's, and 218
   under the map's last dots closes the band at its drawn 1330. Every offset
   here is set from where the glyphs land, not from the line boxes: a line box
   is taller than its ink and the two drift apart at every size. */
.cmap { padding: var(--cm-top, calc(5.1 * var(--sx))) 0 var(--cm-bottom, calc(15.14 * var(--sx))); }
.cmap__inner {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--gutter-design);        /* the design's 75px gutter */
}

.cmap__h {
  margin: 0;
  font-size: clamp(2rem, 3.33vw, 3rem);        /* 48 */
  font-weight: 600;
  line-height: 1.2083;                         /* 58/48 */
  color: var(--ink);
  text-align: center;
}

.cmap__more {
  margin: calc(1.95 * var(--sx)) 0 0;          /* the line sits 58 under the title's own baseline */
  font-size: 1.125rem;                         /* 18 */
  font-weight: 400;
  line-height: 1.2222;                         /* 22/18 */
  text-align: center;
}
.cmap__link { color: var(--c-blue); text-decoration: underline; text-underline-offset: 3px; }

.cmap__rows {
  margin-top: calc(3.16 * var(--sx));          /* 48 from the line down to the first hairline */
  border-top: 1px solid var(--c-darkblue-200);
}
.cmap__row { border-bottom: 1px solid var(--c-darkblue-200); }

/* 25/27 rather than an even pair: the design sets the name's cap 30px under
   the hairline above it, which leaves its glyphs 4.6px high of the row's
   centre. 25 + 41 + 27 is the design's 94px pitch, hairline included. */
.cmap__summary {
  position: relative;
  padding: calc(1.74 * var(--sx)) calc(4.86 * var(--sx)) calc(1.87 * var(--sx)) calc(1.67 * var(--sx));
  cursor: pointer;
  list-style: none;
}
.cmap__summary::-webkit-details-marker { display: none; }
.cmap__country {
  font-size: clamp(1.5rem, 2.36vw, 2.125rem);  /* 34 */
  font-weight: 600;
  line-height: 1.2059;                         /* 41/34 */
  color: var(--c-blue);
}

/* 26x26 with 4px bars, centred on the row rather than on the name, which is
   where the design draws it. The upright drops away when the row is open. */
.cmap__marker {
  position: absolute;
  top: calc(50% + 0.5px);                       /* the design draws it a half pixel below centre */
  right: calc(2.92 * var(--sx));                /* 42 */
  width: 26px;
  height: 26px;
  transform: translateY(-50%);
}
.cmap__marker::before,
.cmap__marker::after { content: ''; position: absolute; background: var(--ink); }
.cmap__marker::before { inset: 11px 0; }
.cmap__marker::after { inset: 0 11px; }
.cmap__row[open] .cmap__marker::after { display: none; }

.cmap__list {
  margin: 0;
  padding: 0 calc(2.92 * var(--sx)) calc(2.05 * var(--sx)) calc(1.67 * var(--sx));
  list-style: none;
}
.cmap__item + .cmap__item { margin-top: 20px; }
.cmap__name {
  display: block;
  font-size: 1.25rem;                          /* 20 */
  font-weight: 600;
  line-height: 1.2;                            /* 24/20 */
  color: var(--ink);
}
/* The module draws a street address here; `clinical_center` holds only a city,
   and seven of the twenty give a province instead, so those entries print their
   name alone rather than an invented address. */
.cmap__where {
  display: block;
  margin-top: 4px;
  font-size: 1.125rem;                         /* 18 */
  font-weight: 300;
  line-height: 1.6111;                         /* 29/18 */
  color: var(--ink);
}

/* 1258x516 of dots, 86 under the last hairline, centred on the 1290 measure. */
.cmap__map {
  position: relative;
  width: calc(87.36 * var(--sx));
  margin: calc(5.97 * var(--sx)) auto 0;
}
.cmap__base { display: block; width: 100%; height: auto; aspect-ratio: 1258 / 516; }

/* The pin hangs from its point, so left/top are the place it marks. */
.cmap__pin {
  position: absolute;
  width: clamp(20px, 3.66%, 46px);             /* 46 at 1440 */
  aspect-ratio: 46 / 67;
  color: var(--c-blue);
  transform: translate(-50%, -100%);
}
.cmap__pin svg { display: block; width: 100%; height: 100%; }
.cmap__pin::after {
  content: '';
  position: absolute;
  top: 34.33%;                                 /* 23/67 */
  left: 50%;
  width: 39.13%;                               /* 18/46 */
  aspect-ratio: 1;
  border-radius: 50%;
  background: linear-gradient(180deg, color-mix(in srgb, var(--c-blue) 8%, var(--c-white)), var(--c-blue));
  transform: translate(-50%, -50%);
}

@media (max-width: 720px) {
  .cmap { padding: var(--cm-top-m, 56px) 0 var(--cm-bottom-m, 72px); }
  .cmap__inner { padding-inline: 16px; }       /* the phone designs' gutter */
  .cmap__h { font-size: clamp(2rem, 9.5vw, 2.5rem); }
  .cmap__more { margin-top: 20px; }

  .cmap__rows { margin-top: 40px; }
  .cmap__summary { padding: 38px 41px 38px 0; }   /* a 106px row */
  .cmap__country { font-size: 1.5rem; line-height: 1.2083; }   /* 24/29 */
  .cmap__marker { right: 0; }
  .cmap__list { padding: 10px 0 57px; }

  .cmap__map { width: 100%; margin-top: 48px; }
}
</style>
