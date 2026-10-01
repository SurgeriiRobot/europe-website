<script setup lang="ts">
// "Reference centers" (training-and-proctoring-desktop 3300-4000): a 48/58
// centred title over 18/29 copy, then the entries on the full 1290px measure.
// Every row opens with a hairline, carries its name in Inter 600 34/41 brand
// blue 24px in, and a 26px plus at the right that loses its upright when the
// row is open.
//
// It holds `accordion_item`s, the same entries the narrow `accordion` section
// takes, so nothing about the content changes with the way it is drawn.
//
// Phones follow the module library (extra-modules-mobile 17402-17614, and the
// country list the clinical centres page uses): 106px rows at the 16px gutter,
// the name at 24/29 over a 1px #8182af hairline.
const props = defineProps<{ blok: any }>()
const items = computed<any[]>(() => props.blok.items || [])
const hasBody = (item: any) => Boolean(item?.body?.content?.length)

// undefined, not null: Vue's style binding accepts string | number | undefined.
const px = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : `${Number(v)}px`)
const style = computed(() => ({
  '--dl-top': px(props.blok.space_top),
  '--dl-bottom': px(props.blok.space_bottom),
  '--dl-top-m': px(props.blok.space_top_mobile),
  '--dl-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section dl"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="dl__inner">
      <SectionTitle :headline="blok.headline" :body="blok.intro" />

      <div v-if="items.length" class="dl__list">
        <details v-for="item in items" :key="item._uid" v-editable="item" class="dl__row">
          <summary class="dl__summary">
            <span class="dl__label">{{ item.label }}</span>
            <span class="dl__marker" aria-hidden="true" />
          </summary>
          <div v-if="hasBody(item)" class="dl__body">
            <StoryblokRichText :document="item.body" />
          </div>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dl { padding: var(--dl-top, calc(16.88 * var(--sx))) 0 var(--dl-bottom, calc(3.58 * var(--sx))); }   /* 243 to the title ink / 51.5 */
.dl__inner {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--gutter-design);                                       /* the design's 75px gutter */
}
.dl :deep(.sec-title) { gap: calc(1.5625 * var(--sx)); max-width: 620px; }    /* 22.5 under the title; 620 is the measure that breaks the copy where Figma does */

.dl__list { margin-top: calc(3.47 * var(--sx)); border-bottom: var(--line-w) solid var(--ink); }   /* 50 under the copy */
.dl__row { border-top: var(--line-w) solid var(--ink); }
.dl__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(1.67 * var(--sx));
  padding: calc(1.63 * var(--sx)) calc(2.92 * var(--sx)) calc(1.98 * var(--sx)) calc(1.67 * var(--sx));   /* 23.5 / 42 / 28.5 / 24: a 94px row */
  cursor: pointer;
  list-style: none;
}
.dl__summary::-webkit-details-marker { display: none; }
.dl__label {
  font-size: clamp(1.5rem, 2.36vw, 2.125rem);                                 /* 34 */
  font-weight: 600;
  line-height: 1.2059;                                                        /* 41/34 */
  color: var(--c-blue);
}

/* 26x26 with 4px bars; the upright drops away when the row is open. */
.dl__marker { position: relative; flex: none; width: 26px; height: 26px; }
.dl__marker::before,
.dl__marker::after { content: ''; position: absolute; background: var(--ink); }
.dl__marker::before { inset: 11px 0; }
.dl__marker::after { inset: 0 11px; }
.dl__row[open] .dl__marker::after { display: none; }

.dl__body {
  padding: 0 calc(2.92 * var(--sx)) calc(2.05 * var(--sx)) calc(1.67 * var(--sx));
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;                                                        /* 29/18 */
  color: var(--ink);
}
.dl__body :deep(p) { margin: 0 0 16px; }
.dl__body :deep(p:last-child) { margin-bottom: 0; }
.dl__body :deep(a) { color: var(--c-blue); }

@media (max-width: 720px) {
  .dl { padding: var(--dl-top-m, 56px) 0 var(--dl-bottom-m, 72px); }
  .dl__inner { padding-inline: 16px; }
  .dl :deep(.sec-title) { gap: 24px; }
  .dl__list { margin-top: 40px; border-bottom-color: var(--c-darkblue-200); border-bottom-width: 1px; }
  .dl__row { border-top-color: var(--c-darkblue-200); border-top-width: 1px; }
  .dl__summary { gap: 16px; padding: 38px 15px 38px 0; }                      /* a 106px row */
  .dl__label { font-size: 1.5rem; line-height: 1.2083; }                      /* 24/29 */
  .dl__body { padding: 10px 0 57px; }
}
</style>
