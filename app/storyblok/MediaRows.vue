<script setup lang="ts">
// Rows of copy beside an image (SP Robot "1. Access / 2. Deployment / 3. Control",
// Figma 8601-10553): media on the right, left or alternating, rows 240px apart,
// the first 105px under the section top and the last 220px above its bottom.
//
// Those defaults are SP Robot's. Every other page that uses this section draws
// its own spacing, so the section carries the usual `sectionBase()` overrides,
// and the row rhythm, the title size and the centred button below the rows are
// all content decisions rather than constants.
const props = defineProps<{ blok: any }>()
const items = computed<any[]>(() => props.blok.items || [])
const buttons = computed<any[]>(() => props.blok.buttons || [])
const sideOf = (i: number): 'left' | 'right' => {
  const start = props.blok.media_side === 'left' ? 'left' : 'right'
  if (props.blok.alternate && i % 2 === 1) return start === 'left' ? 'right' : 'left'
  return start
}

// Spacing is authored as px at the 1440 design width, so it is held as a bare
// number and scaled with --sx; the phone values are real px and are not.
// undefined, not null: Vue's style binding accepts string | number | undefined.
const n = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : String(Number(v)))
const px = (v: unknown) => { const s = n(v); return s === undefined ? undefined : `${s}px` }
const style = computed(() => ({
  '--rows-top': n(props.blok.space_top),
  '--rows-bottom': n(props.blok.space_bottom),
  '--rows-top-m': px(props.blok.space_top_mobile),
  '--rows-bottom-m': px(props.blok.space_bottom_mobile),
  '--rows-gap': n(props.blok.row_gap),
  '--connector-len': px(props.blok.connector_length),
}))

// A large section title is the 72px one System Principles draws over "Dual
// Continuum Mechanism", on the same measure StatsBand uses for its own.
const headSize = computed(() => (props.blok.headline_size === 'large'
  ? { '--sec-title-size': 'clamp(2.5rem, 5vw, 4.5rem)', '--sec-title-measure': 'calc(68 * var(--sx))' }
  : {}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section rows"
    :class="[
      `rows--align-${blok.media_align === 'edge' ? 'edge' : 'center'}`,
      `rows--${blok.layout === 'compact' ? 'compact' : 'wide'}`,
      `rows--phone-${blok.phone_layout || 'copy-first'}`,
      { 'rows--ticks': blok.edge_ticks, 'rows--ticks-foot': blok.edge_ticks && blok.tick_align === 'foot' },
    ]"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <div v-if="blok.headline" class="container rows__head" :style="headSize">
      <SectionTitle :headline="blok.headline" :lines="blok.title_lines" />
    </div>
    <div class="rows__list">
      <StoryblokComponent
        v-for="(item, i) in items"
        :key="item._uid"
        :blok="item"
        :side="sideOf(i)"
        :tone="blok.headline_tone === 'accent' ? 'accent' : 'default'"
      />
    </div>
    <!-- The schema has always described these as "centred below the rows", but
         nothing rendered them, so Instruments Ecosystem silently lost its
         "Book a demo" button. -->
    <div v-if="buttons.length" class="rows__actions">
      <StoryblokComponent v-for="button in buttons" :key="button._uid" :blok="button" />
    </div>
  </section>
</template>

<style scoped>
.rows {
  --connector-len: calc(3.47 * var(--sx));                               /* 50 */
  padding: calc(var(--rows-top, 105) / 14.4 * var(--sx)) 0 calc(var(--rows-bottom, 220) / 14.4 * var(--sx));
  overflow: hidden;
}
.rows__head { margin-bottom: calc(7.5 * var(--sx)); }
.rows__list { display: grid; gap: calc(var(--rows-gap, 240) / 14.4 * var(--sx)); }
.rows__actions { display: flex; justify-content: center; margin-top: calc(5.56 * var(--sx)); }   /* 80 */

@media (max-width: 720px) {
  .rows {
    --connector-len: 40px;
    padding: var(--rows-top-m, 59px) 0 var(--rows-bottom-m, 180px);
  }
  .rows__list { gap: 48px; }
  .rows__actions { margin-top: 40px; padding-inline: 16px; }
}
</style>
