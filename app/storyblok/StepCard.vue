<script setup lang="ts">
// One step of a step_grid (training-and-proctoring-desktop 1517-2171): the 48/58
// blue word, a 335x366 tile in #f5f5f5 with the drawing centred on it, then a
// 24/29 blue title 31px under the tile and 18/29 copy 28px under that.
//
// Each drawing is drawn at its own size in Figma (220, 200.5 and 202 tall), so
// the height travels with the card and the width follows the file's own shape.
const props = defineProps<{ blok: any }>()
const icon = computed(() => props.blok.icon)
const isSvg = computed(() => /\.svg($|\?)/i.test(icon.value?.filename || ''))
const srcset = computed(() => (isSvg.value
  ? undefined
  : [240, 480, 720].map(w => `${sbImage(icon.value, `${w}x0`)} ${w}w`).join(', ')))

const style = computed(() => {
  const h = Number(props.blok.icon_height)
  return h > 0 ? { '--step-icon-h': String(h) } : {}
})
</script>

<template>
  <li v-editable="blok" class="step" :style="style">
    <h3 v-if="blok.label" class="step__label"><BrandText :text="blok.label" /></h3>
    <div class="step__tile">
      <img
        v-if="icon?.filename"
        class="step__icon"
        :src="isSvg ? icon.filename : sbImage(icon, '480x0')"
        :srcset="srcset"
        sizes="(max-width: 720px) 220px, calc(15.28 * min(1vw, 14.4px))"
        :alt="icon.alt || ''"
        loading="lazy"
      >
    </div>
    <p v-if="blok.title" class="step__title"><BrandText :text="blok.title" /></p>
    <p v-if="blok.body" class="step__body"><BrandText :text="blok.body" :nowrap="false" /></p>
  </li>
</template>

<style scoped>
.step { display: flex; flex-direction: column; }
.step__label {
  margin: 0;
  font-size: clamp(2rem, 3.33vw, 3rem);                                       /* 48 */
  font-weight: 600;
  line-height: 1.2083;                                                        /* 58/48 */
  color: var(--c-blue);
  text-align: center;
}
.step__tile {
  display: grid;
  place-items: center;
  margin-top: calc(1.53 * var(--sx));                                         /* 22: the design's 26 off the word's box */
  aspect-ratio: 335 / 366;
  border-radius: 20px;
  background: var(--c-leather-200);
}
.step__icon {
  width: auto;
  max-width: 76%;
  height: calc(var(--step-icon-h, 200) / 14.4 * var(--sx));
  object-fit: contain;
}
.step__title {
  margin: calc(2.15 * var(--sx)) 0 0;                                         /* 31 */
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2083;                                                        /* 29/24 */
  color: var(--c-blue);
  white-space: pre-line;                                                      /* "Build foundational\nknowledge" */
}
.step__body {
  margin: calc(1.74 * var(--sx)) 0 0;                                         /* 25: the design's 28 off the title's box */
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;                                                        /* 29/18 */
  color: var(--ink);
}

/* Phones: the tile fills the 358px measure and the drawing keeps its drawn size. */
@media (max-width: 720px) {
  .step__tile { margin-top: 24px; }
  .step__icon { height: calc(var(--step-icon-h, 200) * 1px); }
  .step__title { margin-top: 28px; }
  .step__body { margin-top: 24px; font-size: 1rem; line-height: 1.625; }
}
</style>
