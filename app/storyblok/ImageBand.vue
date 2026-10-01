<script setup lang="ts">
// A picture on its own, centred in the page: the learning curve chart
// (training-and-proctoring-desktop 2510-3146, 1136 wide) and the reference
// centre map (4027-4571, 1312 wide). `width` is the width Figma draws it at,
// in px at 1440, so it scales with every other measurement; phones give it the
// full measure between the 16px gutters.
const props = defineProps<{ blok: any }>()
const image = computed(() => props.blok.image)
const mobile = computed(() => (props.blok.image_mobile?.filename ? props.blok.image_mobile : null))
const width = computed(() => {
  const w = Number(props.blok.width)
  return w > 0 ? w : 1136
})

// Storyblok asset URLs carry the pixel size (/f/<space>/<W>x<H>/...), which
// gives the browser the shape of the picture before it loads.
const dims = computed(() => {
  const m = image.value?.filename?.match(/\/(\d+)x(\d+)\//)
  return m ? { w: Number(m[1]), h: Number(m[2]) } : null
})
const height = computed(() => (dims.value ? Math.round(width.value * dims.value.h / dims.value.w) : undefined))

const src = computed(() => (image.value?.filename
  ? sbImage(image.value, `${width.value * 2}x0/filters:format(webp):quality(85)`)
  : ''))
const srcset = computed(() => (image.value?.filename
  ? [1, 2].map(d => `${sbImage(image.value, `${width.value * d}x0/filters:format(webp):quality(85)`)} ${d}x`).join(', ')
  : ''))
const mobileSrc = computed(() => (mobile.value ? sbImage(mobile.value, '780x0/filters:format(webp):quality(85)') : ''))

// undefined, not null: Vue's style binding accepts string | number | undefined.
const px = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : `${Number(v)}px`)
const style = computed(() => ({
  '--band-w': `${(width.value / 14.4).toFixed(3)}`,
  '--fig-top': px(props.blok.space_top),
  '--fig-bottom': px(props.blok.space_bottom),
  '--fig-top-m': px(props.blok.space_top_mobile),
  '--fig-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section fig"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <figure class="fig__inner">
      <picture v-if="src">
        <source v-if="mobileSrc" media="(max-width: 720px)" :srcset="mobileSrc">
        <img
          :src="src"
          :srcset="srcset"
          :alt="image.alt || ''"
          :width="width"
          :height="height"
          loading="lazy"
          decoding="async"
        >
      </picture>
      <figcaption v-if="blok.caption" class="fig__caption">{{ blok.caption }}</figcaption>
    </figure>
  </section>
</template>

<style scoped>
.fig { padding: var(--fig-top, calc(11.81 * var(--sx))) 0 var(--fig-bottom, calc(11.81 * var(--sx))); }   /* 170 */
.fig__inner {
  width: min(100% - 32px, calc(var(--band-w) * var(--sx)));
  margin: 0 auto;
}
.fig__inner img { width: 100%; height: auto; }
.fig__caption {
  margin-top: calc(1.67 * var(--sx));                                         /* 24 */
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.625;
  color: var(--ink-muted);
  text-align: center;
}

@media (max-width: 720px) {
  .fig { padding: var(--fig-top-m, 64px) 0 var(--fig-bottom-m, 64px); }
  .fig__inner { width: calc(100% - 32px); }
  .fig__caption { margin-top: 16px; }
}
</style>
