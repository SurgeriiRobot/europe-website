<script setup lang="ts">
// Clinical Applications "Pediatric applications" (Figma 4640-5804): oversized
// pale Lora words, centred, over white fading into brand blue towards the band
// below. The words are decoration; the band that follows carries the heading.
const props = defineProps<{ blok: any }>()

// Spacing overrides. The editor types px as drawn at 1440, so the desktop pair
// scales with --sx; the _mobile pair is raw px at 390 and does not. Empty
// fields have to come back as undefined, never null: Vue's style binding takes
// string | number | undefined only, and each fallback below is the value the
// band already drew.
const n = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : Number(v))
const sx = (v: unknown) => { const x = n(v); return x === undefined ? undefined : `calc(${x} / 14.4 * var(--sx))` }
const px = (v: unknown) => { const x = n(v); return x === undefined ? undefined : `${x}px` }
const spacing = computed(() => ({
  '--wm-top': sx(props.blok.space_top),
  '--wm-bottom': sx(props.blok.space_bottom),
  '--wm-top-m': px(props.blok.space_top_mobile),
  '--wm-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': sx(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section wmband"
    :class="`wmband--${blok.backdrop || 'fade-to-brand'}`"
    :data-theme="blok.theme || 'light'"
    :style="spacing"
  >
    <SectionConnector :connector="blok.connector" />
    <p class="wmband__word display-word" aria-hidden="true">{{ blok.word }}</p>
  </section>
</template>

<style scoped>
.wmband {
  padding: var(--wm-top, calc(40.65 * var(--sx))) 0 var(--wm-bottom, calc(5.19 * var(--sx)));   /* 585 to the words / 75 */
  overflow: hidden;
}
.wmband--fade-to-brand { background: var(--grad-fade-to-brand); }
.wmband--fade-to-grey { background: var(--grad-fade-to-grey); }
/* 252px Lora on a 252px line, white at 50%, each line centred on the page even
   where it runs wider than the screen. */
.wmband__word {
  width: max-content;
  margin: 0 0 0 50%;
  translate: -50% 0;
  font-size: calc(17.5 * var(--sx));
  line-height: 1;
  text-align: center;
  white-space: pre-line;
  color: rgb(255 255 255 / 50%);
  user-select: none;
}

/* Phones: 62px words wrapped to the screen, 36px above the band below. */
@media (max-width: 720px) {
  .wmband { padding: var(--wm-top-m, 194px) 0 var(--wm-bottom-m, 36px); }
  .wmband__word { width: auto; margin: 0; translate: none; font-size: 15.9vw; white-space: normal; }
}
</style>
