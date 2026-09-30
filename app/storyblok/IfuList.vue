<script setup lang="ts">
// Instructions for Use (Figma instructions-for-use-desktop, 1440x2247).
//
// The whole page is one band under the header: the 48/58 title at the 75px
// gutter (its line box at y227), then ten two-line entries on a 29px grid —
// 58px from the title to the first, one blank line between each, and 203px of
// air out to the footer.
//
// Phones keep the same single column at the 16px gutter with the title at the
// mobile heading size; there is no drawn phone frame for this page.
const props = defineProps<{ blok: any }>()

const items = computed<any[]>(() => props.blok.items || [])
// Section spacing overrides are in design px at 1440 / 390; blank keeps the
// section's own rhythm.
// undefined, not null: Vue's style binding accepts string | number | undefined.
const px = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : `${Number(v)}px`)
const style = computed(() => ({
  '--ifu-top': px(props.blok.space_top),
  '--ifu-bottom': px(props.blok.space_bottom),
  '--ifu-top-m': px(props.blok.space_top_mobile),
  '--ifu-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section ifu"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="ifu__inner">
      <h1 v-if="blok.headline" class="ifu__h"><BrandText :text="blok.headline" /></h1>
      <p v-if="blok.intro" class="ifu__intro"><BrandText :text="blok.intro" :nowrap="false" /></p>

      <ul v-if="items.length" class="ifu__list">
        <IfuItem v-for="item in items" :key="item._uid" :blok="item" />
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* 152px from the header to the title's ink, 203px from the last entry to the
   footer band. */
.ifu { padding-block: var(--ifu-top, 152px) var(--ifu-bottom, 203px); }
.ifu__inner {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: clamp(16px, 5.21vw, 75px);   /* the design's 75px gutter */
}

.ifu__h {
  margin: 0 0 53px;
  font-size: clamp(2rem, 3.33vw, 3rem);        /* 48 */
  font-weight: 600;
  line-height: 1.2083;                         /* 58/48 */
  color: var(--ink);
}
.ifu__intro {
  max-width: 760px;
  margin: -29px 0 58px;
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;
  color: var(--ink-muted);
  white-space: pre-line;
}

.ifu__list { margin: 0; padding: 0; list-style: none; }

@media (max-width: 720px) {
  .ifu { padding-block: var(--ifu-top-m, 56px) var(--ifu-bottom-m, 96px); }
  .ifu__inner { padding-inline: 16px; }        /* the phone designs' gutter */
  .ifu__h { margin-bottom: 40px; font-size: clamp(2rem, 9.5vw, 2.5rem); }
  .ifu__intro { margin: -20px 0 40px; font-size: 1rem; line-height: 1.625; }
}
</style>
