<script setup lang="ts">
// A centred title over an 18/29 paragraph, with the buttons under it: the shape
// `statement` draws, at the size and on the measure this one is drawn to.
// About sets five of these and no two share a measure: 630 (the 72px opener),
// 465 ("Founded by pioneer"), 520 ("Built on proprietary innovation"), 500
// ("Supporting surgeons worldwide") and 620 ("Committed to quality").
// `statement` has only the home page's fixed 632, which re-wraps every one.
const props = defineProps<{ blok: any }>()
const display = computed(() => props.blok.headline_size === 'display')

// undefined, not null: Vue's style binding accepts string | number | undefined.
const px = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : `${Number(v)}px`)
const style = computed(() => ({
  '--cb-measure': px(props.blok.measure),
  '--cb-gap': px(props.blok.title_gap),
  '--cb-linegap': px(props.blok.line_gap),
  '--cb-top': px(props.blok.space_top),
  '--cb-bottom': px(props.blok.space_bottom),
  '--cb-top-m': px(props.blok.space_top_mobile),
  '--cb-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section cblock"
    :class="{ 'cblock--display': display }"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="container cblock__inner">
      <h2 class="cblock__title" :class="{ 'cblock__title--lines': blok.title_lines }">
        <BrandText :text="blok.headline" />
        <template v-if="blok.title_lines">
          <span class="cblock__rule cblock__rule--left" aria-hidden="true" />
          <span class="cblock__rule cblock__rule--right" aria-hidden="true" />
        </template>
      </h2>
      <p v-if="blok.body" class="cblock__body"><BrandText :text="blok.body" :nowrap="false" /></p>
      <div v-if="blok.buttons?.length" class="cblock__actions">
        <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.cblock { padding: var(--cb-top, calc(8.33 * var(--sx))) 0 var(--cb-bottom, calc(8.33 * var(--sx))); }
.cblock__inner { display: grid; justify-items: center; text-align: center; }
.cblock__title {
  position: relative;
  width: 100%;
  margin: 0;
  font-size: clamp(2rem, 3.33vw, 3rem);                                       /* 48 */
  font-weight: 600;
  line-height: 1.2083;                                                        /* 58/48 */
  color: var(--ink);
  white-space: pre-line;
}
/* Level with the first line, in to 265px from the page edge: the measure every
   48px title on the site uses. */
.cblock__rule {
  position: absolute;
  top: 0.6em;
  width: max(0px, calc(50vw - var(--cb-linegap, 455px)));
  border-top: var(--line-w) solid var(--line);
}
.cblock__rule--left { left: calc(50% - 50vw); }
.cblock__rule--right { right: calc(50% - 50vw); }
@media (max-width: 1000px) { .cblock__rule { display: none; } }

/* The 72px opener: Figma holds its hairlines 50px below the title's top rather
   than level with the cap's middle, and in to 564px from the centre. */
.cblock--display .cblock__title { font-size: clamp(2.75rem, 5vw, 4.5rem); line-height: 1.1944; }   /* 72/86 */
.cblock--display .cblock__rule { top: calc(3.47 * var(--sx)); }               /* 50 */

.cblock__body {
  max-width: var(--cb-measure, 630px);
  margin: var(--cb-gap, calc(1.67 * var(--sx))) 0 0;                          /* 24 */
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;                                                        /* 29/18 */
  color: var(--ink-muted);
  white-space: pre-line;
}
.cblock__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: calc(1.46 * var(--sx));                                         /* 21 under the copy */
}

/* Phones keep the 48px title the rest of the site sets there, and give the body
   the full gutter-to-gutter measure. */
@media (max-width: 720px) {
  .cblock { padding: var(--cb-top-m, 72px) 0 var(--cb-bottom-m, 72px); }
  .cblock__title { font-size: clamp(2.25rem, 12.3vw, 3rem); }
  .cblock--display .cblock__title { font-size: clamp(2.25rem, 10.77vw, 2.625rem); line-height: 1.1905; }   /* 42/50 */
  .cblock__body { max-width: none; margin-top: var(--cb-gap-m, 24px); }
  .cblock__actions { width: 100%; margin-top: 32px; }
  .cblock__actions > :deep(.btn) { flex: 1 1 100%; justify-content: center; }
}
</style>
