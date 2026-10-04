<script setup lang="ts">
// System Principles "Actuation and control" (Figma 1643-3940): a centred title
// and body, then line drawings over blue labels, three to a row in 335px columns
// 32px apart, a row every 486px, a short last row centred; one column on phones.
// Each drawing sits on a 240x185 artboard, so the labels line up whatever shape
// the drawing is.
const props = defineProps<{ blok: any }>()

// Spacing overrides. The editor types px as drawn at 1440, so the desktop pair
// scales with --sx; the _mobile pair is raw px at 390 and does not. Empty
// fields have to come back as undefined, never null: Vue's style binding takes
// string | number | undefined only, and each fallback below is the spacing the
// section already drew.
const n = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : Number(v))
const sx = (v: unknown) => { const x = n(v); return x === undefined ? undefined : `calc(${x} / 14.4 * var(--sx))` }
const px = (v: unknown) => { const x = n(v); return x === undefined ? undefined : `${x}px` }
const spacing = computed(() => ({
  '--icons-top': sx(props.blok.space_top),
  '--icons-bottom': sx(props.blok.space_bottom),
  '--icons-top-m': px(props.blok.space_top_mobile),
  '--icons-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': sx(props.blok.connector_length),
}))
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section icons" :data-theme="blok.theme || 'light'" :style="spacing">
    <SectionConnector :connector="blok.connector" />
    <div class="container">
      <SectionTitle :headline="blok.headline" :body="blok.body" />
    </div>
    <ul v-if="blok.items?.length" class="icons__grid">
      <StoryblokComponent v-for="item in blok.items" :key="item._uid" :blok="item" />
    </ul>
  </section>
</template>

<style scoped>
.icons {
  --connector-len: calc(6.94 * var(--sx));                                  /* 100 */
  padding: var(--icons-top, calc(13.85 * var(--sx))) 0 var(--icons-bottom, calc(22.68 * var(--sx)));   /* 199 to the title / 327 */
}
.icons :deep(.sec-title) { max-width: 632px; }
/* "Actuation / and control" on phones: even lines rather than a lone word; the
   body keeps "collision risk." together rather than leaving "risk." alone. */
.icons :deep(.sec-title__h) { text-wrap: balance; }
.icons :deep(.sec-title__p) { text-wrap: pretty; }
.icons__grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: calc(14.79 * var(--sx)) calc(2.22 * var(--sx));                      /* 213 / 32 */
  max-width: calc(74.24 * var(--sx));                                       /* three 335 columns */
  margin: calc(12.71 * var(--sx)) auto 0;                                   /* 183 under the body */
  padding: 0;
  list-style: none;
}
.icons__grid > :deep(*) { flex: 0 0 calc(23.26 * var(--sx)); }             /* 335 */

/* Phone design: an 80px line in, a 40px line out, one icon every 452px. */
@media (max-width: 720px) {
  .icons { --connector-top-len: 80px; --connector-bottom-len: 40px; padding: var(--icons-top-m, 178px) 0 var(--icons-bottom-m, 169px); }
  .icons__grid { flex-direction: column; align-items: center; row-gap: 152px; max-width: 358px; margin-top: 135px; }
  .icons__grid > :deep(*) { flex: none; width: 100%; }
}
</style>
