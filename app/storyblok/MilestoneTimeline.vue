<script setup lang="ts">
// About 2072-3241: the company timeline, one milestone at a time. A 325px disc
// carries the milestone in white 32/38, the year sits behind it in Lora 220 at
// #f4f4f4 (the disc covers its top 23px), the caption runs under it in 34/41,
// and the years either side are the controls: a chevron, the year, and a
// hairline running in towards the centre (209-365 and 1072-1241 at 1440).
const props = defineProps<{ blok: any }>()
const items = computed<any[]>(() => props.blok.items || [])
const index = ref(Math.min(Math.max(0, Number(props.blok.start) || 0), Math.max(0, items.value.length - 1)))

const current = computed(() => items.value[index.value] || null)
const prev = computed(() => (index.value > 0 ? items.value[index.value - 1] : null))
const next = computed(() => (index.value < items.value.length - 1 ? items.value[index.value + 1] : null))
const lead = (side: 'top' | 'bottom') => props.blok.connector === side || props.blok.connector === 'both'
const go = (step: number) => {
  const to = index.value + step
  if (to >= 0 && to < items.value.length) index.value = to
}

// undefined, not null: Vue's style binding accepts string | number | undefined.
const px = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : `${Number(v)}px`)
const style = computed(() => ({
  '--tl-top': px(props.blok.space_top),
  '--tl-bottom': px(props.blok.space_bottom),
  '--tl-top-m': px(props.blok.space_top_mobile),
  '--tl-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section tl"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <!-- The band's gradient is nearly black where this section starts and white
         where it ends, so the two lead lines cannot share one colour the way
         SectionConnector's do. -->
    <span v-if="lead('top')" class="tl__lead tl__lead--top" aria-hidden="true" />
    <span v-if="lead('bottom')" class="tl__lead tl__lead--bottom" aria-hidden="true" />

    <div v-if="current" class="tl__stage">
      <p v-if="current.title" class="tl__disc"><BrandText :text="current.title" /></p>
      <p v-else class="tl__disc" aria-hidden="true" />
      <p class="tl__year display-word">{{ current.year }}</p>
    </div>

    <div v-if="current" class="tl__foot">
      <button
        v-if="prev"
        type="button"
        class="tl__nav tl__nav--prev"
        :aria-label="`Show ${prev.year}`"
        @click="go(-1)"
      >
        <Icon name="chevron-left" :size="24" />
        <span>{{ prev.year }}</span>
      </button>
      <span v-if="prev" class="tl__rule tl__rule--left" aria-hidden="true" />

      <p v-if="current.caption" class="tl__caption"><BrandText :text="current.caption" /></p>

      <span v-if="next" class="tl__rule tl__rule--right" aria-hidden="true" />
      <button
        v-if="next"
        type="button"
        class="tl__nav tl__nav--next"
        :aria-label="`Show ${next.year}`"
        @click="go(1)"
      >
        <span>{{ next.year }}</span>
        <Icon name="chevron-right" :size="24" />
      </button>
    </div>
  </section>
</template>

<style scoped>
.tl { padding: var(--tl-top, calc(13.61 * var(--sx))) 0 var(--tl-bottom, calc(26.53 * var(--sx))); }   /* 196 / 382 */

.tl__lead {
  position: absolute;
  left: 50%;
  z-index: 2;
  height: var(--connector-len, max(40px, calc(4.1 * var(--sx))));
  border-left: var(--line-w) solid var(--line);
  pointer-events: none;
}
.tl__lead--top { top: 0; border-left-color: var(--line-light); }              /* the dark end of the gradient */
.tl__lead--bottom { bottom: 0; border-left-color: var(--c-blue); }            /* the white end */

.tl__stage { position: relative; }
.tl__disc {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  width: calc(22.57 * var(--sx));                                             /* 325 */
  height: calc(22.57 * var(--sx));
  margin: 0 auto;
  padding-top: calc(1.88 * var(--sx));                                        /* Figma sets the copy 13px below the disc's centre */
  border-radius: 50%;
  background: var(--c-blue);
  font-size: calc(2.22 * var(--sx));                                          /* 32 */
  font-weight: 600;
  line-height: 1.1875;                                                        /* 38/32 */
  color: var(--c-white);
  text-align: center;
  white-space: pre-line;
}
/* The year is drawn behind the disc, its top 23px covered by it. */
.tl__year {
  position: relative;
  z-index: 1;
  margin: calc(-3.74 * var(--sx)) 0 0;                                        /* -53.8 */
  font-size: calc(15.28 * var(--sx));                                         /* 220 */
  line-height: 1;
  color: var(--c-neutral-300);
  text-align: center;
}

.tl__foot {
  position: relative;
  margin-top: calc(1.24 * var(--sx));                                         /* 17.8 */
}
.tl__caption {
  max-width: calc(34.72 * var(--sx));                                         /* 500 */
  margin: 0 auto;
  font-size: clamp(1.5rem, 2.36vw, 2.125rem);                                 /* 34 */
  font-weight: 600;
  line-height: 1.2059;                                                        /* 41/34 */
  color: var(--ink);
  text-align: center;
  white-space: pre-line;
}
.tl__nav {
  position: absolute;
  top: 50%;
  display: flex;
  align-items: center;
  gap: calc(1.01 * var(--sx));                                                /* 14.6 */
  padding: 0;
  border: 0;
  background: none;
  font-size: 1.5rem;                                                          /* 24 */
  font-weight: 600;
  line-height: 1.2083;
  color: var(--c-blue);
  cursor: pointer;
  translate: 0 -50%;
}
.tl__nav:hover { color: var(--c-blue-500); }
.tl__nav--prev { left: calc(var(--frame-x) + 4.61 * var(--sx)); }            /* the chevron's ink starts at the 75px gutter */
.tl__nav--next { right: calc(var(--frame-x) + 4.69 * var(--sx)); }
.tl__rule {
  position: absolute;
  top: 50%;
  border-top: var(--line-w) solid var(--line);
}
.tl__rule--left { left: calc(var(--frame-x) + 14.51 * var(--sx)); width: calc(10.83 * var(--sx)); }    /* 209 -> 365 */
.tl__rule--right { right: calc(var(--frame-x) + 13.82 * var(--sx)); width: calc(11.74 * var(--sx)); }  /* 1072 -> 1241 */
@media (max-width: 1000px) { .tl__rule { display: none; } }

/* Phones: the disc at 240, the year at 150, and the controls under the caption
   rather than beside it, since there is no room for them at the gutters. */
@media (max-width: 720px) {
  .tl { padding: var(--tl-top-m, 96px) 0 var(--tl-bottom-m, 120px); }
  .tl__disc { width: 240px; height: 240px; padding-top: 10px; font-size: 1.5rem; line-height: 1.2083; }
  .tl__year { margin-top: -40px; font-size: 150px; }
  .tl__foot { display: grid; grid-template-columns: 1fr 1fr; justify-items: center; gap: 28px; margin-top: 12px; padding-inline: 16px; }
  .tl__caption { grid-area: 1 / 1 / 2 / 3; max-width: none; font-size: 1.5rem; line-height: 1.2083; }
  .tl__nav { position: static; translate: none; gap: 12px; font-size: 1.25rem; }
  .tl__nav--prev { grid-area: 2 / 1; justify-self: start; }
  .tl__nav--next { grid-area: 2 / 2; justify-self: end; }
}
</style>
