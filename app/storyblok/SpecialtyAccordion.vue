<script setup lang="ts">
// Clinical Evidence "Multi-specialty clinical experience" (clinical-evidence-
// desktop, 2385-3661): a 48px centred title over a 490px paragraph, a row of
// five specialty drawings on a 92x84 artboard with 15px blue labels, then the
// list itself — full-width 94px rows from gutter to gutter, 34/41 blue labels
// 24px in from the rule, and a 28px plus sign 42px off the right.
//
// Open, each row prints the specialty's procedures as the design's text example
// frame draws them ("Desktop Clinical Evidence Text Example"): group titles and
// bulleted procedures all at 18/29 on one unbroken rhythm, with no space of
// their own between the groups. The frame's row heights are hand-set there and
// clip the last line; a real disclosure sizes to its content instead.
const props = defineProps<{ blok: any }>()
const icons = computed<any[]>(() => props.blok.icons || [])
const items = computed<any[]>(() => props.blok.items || [])

// The row a link asks for. Clinical Applications sends people here with
// ?specialty=urology, and the drawings above the list are shortcuts to the same
// rows: both were dead until now, the icons because they only ever looked
// clickable. Matching is on the slug and tolerates "thoracic" for
// "Thoracic surgery", since the library's own values are the short forms.
const route = useRoute()
const slug = (v: unknown) => String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
// The query seeds which row is open; it does not keep owning it. Reading the
// query directly here meant that arriving from "View all urology cases" froze
// the whole list: every click set this ref, the query kept winning, and the
// icons and summaries did nothing until you reloaded without it.
const open = ref('')
watch(() => route.query.specialty, v => { open.value = slug(v) }, { immediate: true })
// A row's stable name. The link says ?specialty=urology in every language, but
// the label is translated copy, so matching on the label only ever worked in
// English: the German row reads Urologie, and Pediatric surgery is
// Paediatrische Chirurgie there, which no amount of tolerance reaches. The key
// is set once in Storyblok and is never translated. A row without one falls
// back to its label, which is what every row did before.
const rowKey = (item: any) => slug(item.key) || slug(item.label)
const isOpen = (item: any) => {
  const want = open.value
  if (!want) return false
  const have = rowKey(item)
  return have === want || have.startsWith(`${want}-`) || want.startsWith(`${have}-`)
}
// The drawings above the list name their row by the label they print, both in
// the reader's own language, so they find the row through the labels on the
// page and then use its key like everything else.
const rowFor = (label: string) => {
  const want = slug(label)
  return items.value.find(i => slug(i.label) === want) || { label }
}
// Opening one row closes the rest, which is how a <details> group reads when it
// is driven from a link rather than from its own summary.
const show = (item: any) => { open.value = isOpen(item) ? '' : rowKey(item) }

// A link that names a specialty should land on that row rather than at the top
// of the page with the row open somewhere below the fold. Doing it on mount is
// not enough: Vue Router scrolls a new route to the top of the page, and it does
// so after this mounts, so arriving from "View all urology cases" on another
// page the router won and you got the hero. It only ever worked on a direct
// load, where there is no route change to scroll. Nuxt applies that scroll once
// the page has rendered (page:transition:finish when the page animates,
// page:finish otherwise), so the row claims it back after whichever of those
// runs, and two frames later so the router's scroll has already landed and
// cannot cut the smooth one short.
const list = ref<HTMLElement>()
const jump = () => {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const row = list.value?.querySelector('details[open]')
    row?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }))
}
onMounted(() => {
  if (!route.query.specialty) return
  const nuxt = useNuxtApp()
  nuxt.hooks.hookOnce('page:finish', jump)
  nuxt.hooks.hookOnce('page:transition:finish', jump)
  nextTick(jump)
})

const px = (v: unknown) => (Number(v) > 0 ? `${Number(v)}px` : undefined)
// A negative `space_top` lifts the section into the one above instead of padding
// it: `stats_band` draws its figures 110px lower than this page's design wants
// (room for a stat icon this page has none of), and that slack has to come off
// somewhere. Positive values stay plain padding.
const top = computed(() => {
  const v = props.blok.space_top
  return v === '' || v == null || !Number.isFinite(Number(v)) ? null : Number(v)
})
const style = computed(() => ({
  '--sa-top': top.value === null ? undefined : `${Math.max(0, top.value)}px`,
  '--sa-lift': top.value === null ? undefined : `${Math.min(0, top.value)}px`,
  '--sa-bottom': px(props.blok.space_bottom),
  '--sa-top-m': px(props.blok.space_top_mobile),
  '--sa-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section spec"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="spec__inner">
      <h2 v-if="blok.headline" class="spec__title"><BrandText :text="blok.headline" /></h2>
      <p v-if="blok.body" class="spec__body"><BrandText :text="blok.body" :nowrap="false" /></p>

      <ul v-if="icons.length" class="spec__icons">
        <li v-for="icon in icons" :key="icon._uid" v-editable="icon" class="spec__icon">
          <button type="button" class="spec__icon-btn" @click="show(rowFor(icon.label))">
          <img
            v-if="icon.icon?.filename"
            class="spec__icon-img"
            :src="sbImage(icon.icon, '368x0')"
            :srcset="`${sbImage(icon.icon, '184x0')} 184w, ${sbImage(icon.icon, '368x0')} 368w`"
            sizes="92px"
            :alt="icon.icon.alt || ''"
            width="92"
            height="84"
            loading="lazy"
          >
          <span class="spec__icon-label">{{ icon.label }}</span>
          </button>
        </li>
      </ul>

      <div v-if="items.length" ref="list" class="spec__list">
        <details
          v-for="item in items"
          :key="item._uid"
          v-editable="item"
          :id="`specialty-${rowKey(item)}`"
          class="spec__row"
          :open="isOpen(item)"
        >
          <summary class="spec__summary" @click="show(item)">
            <span class="spec__label">{{ item.label }}</span>
            <span class="spec__mark" aria-hidden="true">
              <svg viewBox="0 0 28 28" width="28" height="28" focusable="false">
                <path class="spec__bar" d="M0 13.5h28v2.4H0z" />
                <path class="spec__bar spec__bar--v" d="M12.8 0h2.4v28h-2.4z" />
              </svg>
            </span>
          </summary>
          <div v-if="item.body" class="spec__procedures">
            <StoryblokRichText :document="item.body" />
          </div>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
.spec {
  --connector-len: max(40px, calc(4.1 * var(--sx)));
  margin-top: var(--sa-lift, 0px);
  padding-top: var(--sa-top, calc(5.49 * var(--sx)));                       /* 79 */
  padding-bottom: var(--sa-bottom, calc(14.51 * var(--sx)));                /* 209 */
}
/* The drawing and its label are one control; it carries no look of its own, so
   the row of specialties is drawn exactly as before. */
.spec__icon-btn {
  display: contents;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.spec__icon:hover .spec__icon-label { text-decoration: underline; }
.spec__icon-btn:focus-visible { outline: 2px solid var(--c-blue); outline-offset: 4px; }

.spec__inner {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--gutter-design);                                     /* 75 */
}
.spec__title {
  max-width: 660px;
  margin: 0 auto;
  font-size: clamp(2rem, 3.33vw, 3rem);                                     /* 48 */
  font-weight: 600;
  line-height: 1.2083;                                                      /* 58/48 */
  color: var(--ink);
  text-align: center;
  white-space: pre-line;
}
.spec__body {
  max-width: 490px;
  margin: calc(1.76 * var(--sx)) auto 0;                                    /* 25.3 */
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;                                                      /* 29/18 */
  color: var(--ink-muted);
  text-align: center;
  white-space: pre-line;
}

/* Five drawings on a 174px pitch, the row centred. Every drawing is exported on
   the same 92x84 artboard, so they sit at the size and height the design gives
   them without a per-icon rule. */
.spec__icons {
  display: flex;
  justify-content: center;
  /* Figma hangs the row 9px left of the frame's centre. */
  margin: calc(4.35 * var(--sx)) 0 0 calc(-1.28 * var(--sx));              /* 62.6 / -9 off centre */
  padding: 0;
  list-style: none;
}
.spec__icon {
  display: flex;
  flex: 0 0 calc(12.08 * var(--sx));                                        /* 174 */
  flex-direction: column;
  align-items: center;
}
.spec__icon-img { width: calc(6.39 * var(--sx)); height: calc(5.83 * var(--sx)); object-fit: contain; }   /* 92x84 */
.spec__icon-label {
  margin-top: calc(1.7 * var(--sx));                                        /* 24.5 */
  font-size: 0.9375rem;                                                     /* 15 */
  font-weight: 400;
  line-height: 1.2133;                                                      /* 18.2/15 */
  color: var(--c-blue);
  text-align: center;
}

.spec__list { margin-top: calc(6.94 * var(--sx)); }                         /* 100 */
.spec__row { border-top: var(--line-w) solid var(--c-darkblue); }
.spec__row:last-child { border-bottom: var(--line-w) solid var(--c-darkblue); }
.spec__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(1.74 * var(--sx)) calc(2.92 * var(--sx)) calc(1.84 * var(--sx)) calc(1.67 * var(--sx));   /* 25 / 42 / 26.5 / 24 */
  cursor: pointer;
  list-style: none;
}
.spec__summary::-webkit-details-marker { display: none; }
.spec__label {
  font-size: clamp(1.5rem, 2.36vw, 2.125rem);                               /* 34 */
  font-weight: 600;
  line-height: 1.2059;                                                      /* 41/34 */
  color: var(--c-blue);
}
.spec__mark { flex: none; width: 28px; height: 28px; color: var(--c-darkblue); }
.spec__mark svg { width: 100%; height: 100%; }
.spec__bar { fill: currentColor; }
.spec__bar--v { transition: opacity 150ms ease; }
.spec__row[open] .spec__bar--v { opacity: 0; }
.spec__summary:hover .spec__label { color: var(--c-blue-500); }

/* The procedures: one 18/29 rhythm from the first group title to the last
   bullet, 40px under the label and 40px above the rule. */
.spec__procedures {
  padding: 0 calc(2.92 * var(--sx)) calc(2.78 * var(--sx)) calc(2.08 * var(--sx));   /* 42 / 40 / 30 */
  margin-top: calc(0.59 * var(--sx));                                       /* the design sets the first line 77px under the label's cap */
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;                                                      /* 29/18 */
  color: var(--ink);
}
.spec__procedures :deep(p) { margin: 0; }
.spec__procedures :deep(ul) { margin: 0; padding: 0; list-style: none; }
.spec__procedures :deep(li) { position: relative; padding-left: 32px; }
.spec__procedures :deep(li::before) {
  content: '';
  position: absolute;
  top: 12.7px;
  left: 11px;
  width: 4.6px;
  height: 4.6px;
  border-radius: 50%;
  background: currentColor;
}

/* Phones: the drawings wrap three to a row inside the 16px gutters, and the
   rows set their labels at 24/29 with the plus at 20px. */
@media (max-width: 720px) {
  /* The desktop lift compensates for `stats_band`'s desktop spacing only. */
  .spec { margin-top: 0; padding-top: var(--sa-top-m, 72px); padding-bottom: var(--sa-bottom-m, 96px); }
  .spec__inner { padding-inline: 16px; }
  .spec__title { max-width: none; }
  .spec__body { max-width: none; margin-top: 24px; white-space: normal; }
  .spec__icons { flex-wrap: wrap; gap: 32px 0; margin-top: 48px; }
  .spec__icon { flex-basis: 33.33%; }
  .spec__icon-img { width: 80px; height: 73px; }
  .spec__icon-label { margin-top: 16px; }
  .spec__list { margin-top: 56px; }
  .spec__summary { padding: 18px 0 20px; gap: 16px; }
  .spec__label { font-size: 1.5rem; line-height: 1.2083; }
  .spec__mark { width: 20px; height: 20px; }
  .spec__procedures { padding: 0 0 28px; margin-top: 24px; font-size: 1rem; line-height: 1.625; }
  .spec__procedures :deep(li) { padding-left: 24px; }
  .spec__procedures :deep(li::before) { top: 8px; left: 8px; width: 4px; height: 4px; }
}
</style>
