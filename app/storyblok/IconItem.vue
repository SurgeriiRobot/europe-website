<script setup lang="ts">
// One icon of an icon_grid: the drawing on its 240x185 artboard (1.06x on phones),
// then a blue Inter 600 24/29 label, broken where the editor breaks it. Every
// item keeps room for two label lines, so the rows keep one rhythm.
const props = defineProps<{ blok: any }>()
const icon = computed(() => props.blok.icon)
const isSvg = computed(() => /\.svg($|\?)/i.test(icon.value?.filename || ''))
const srcset = computed(() => (isSvg.value
  ? undefined
  : [240, 480, 720].map(w => `${sbImage(icon.value, `${w}x0`)} ${w}w`).join(', ')))
</script>

<template>
  <li v-editable="blok" class="icon-item">
    <img
      v-if="icon?.filename"
      class="icon-item__img"
      :src="isSvg ? icon.filename : sbImage(icon, '480x0')"
      :srcset="srcset"
      sizes="(max-width: 720px) 254px, calc(16.67 * min(1vw, 14.4px))"
      :alt="icon.alt || ''"
      width="240"
      height="185"
      loading="lazy"
    >
    <p class="icon-item__label"><BrandText :text="blok.label" /></p>
  </li>
</template>

<style scoped>
.icon-item { display: flex; flex-direction: column; align-items: center; min-height: calc(18.96 * var(--sx)); }   /* 185 + 30 + 2 x 29 */
.icon-item__img { width: calc(16.67 * var(--sx)); height: calc(12.85 * var(--sx)); object-fit: contain; }    /* 240x185 */
.icon-item__label {
  margin: calc(2.08 * var(--sx)) 0 0;                                       /* 30 */
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2083;                                                      /* 29/24 */
  color: var(--c-blue);
  text-align: center;
  white-space: pre-line;
}

@media (max-width: 720px) {
  .icon-item { min-height: 300px; }                                         /* 196 + 46 + 58 */
  .icon-item__img { width: 254px; height: 196px; }
  .icon-item__label { margin-top: 46px; }
}
</style>
