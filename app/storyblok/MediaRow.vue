<script setup lang="ts">
// One row of a media_rows section: a 410px text column set 125px off the centre
// line, vertically centred on a 765px-wide image that sits centred in the other
// half. Phones stack the copy over the image (media_mobile when set).
const props = withDefaults(defineProps<{ blok: any, side?: 'left' | 'right', tone?: 'default' | 'accent' }>(), { side: 'right', tone: 'default' })
const media = computed(() => props.blok.media)
const mediaMobile = computed(() => (props.blok.media_mobile?.filename ? props.blok.media_mobile : null))

// Art in these rows ranges from a 765px photograph to a 311px icon. Pinning it
// at 765 pushed the smaller ones off both edges of the page.
const widthPx = computed(() => Number(props.blok.media_width) || 765)
const mediaWidth = computed(() => `calc(${(widthPx.value / 14.4).toFixed(2)} * min(1vw, 14.4px))`)
</script>

<template>
  <div
    v-editable="blok"
    class="mrow"
    :class="[`mrow--media-${side}`, `mrow--${tone}`]"
    :style="{ '--mrow-media-w': mediaWidth }"
  >
    <div class="mrow__text">
      <h3 v-if="blok.headline" class="mrow__title"><BrandText :text="blok.headline" /></h3>
      <p v-if="blok.subtitle" class="mrow__subtitle">{{ blok.subtitle }}</p>
      <!-- StoryblokRichText renders bare paragraphs, so it needs a wrapper to style. -->
      <div v-if="blok.body" class="mrow__body"><StoryblokRichText :document="blok.body" /></div>
      <!-- The list and its heading were in the schema and in the content, but
           nothing output them, so every row lost its procedures. -->
      <template v-if="blok.list_items?.length">
        <p v-if="blok.list_title" class="mrow__list-title">{{ blok.list_title }}</p>
        <ul class="mrow__list">
          <li v-for="item in blok.list_items" :key="item._uid">
            <StoryblokComponent :blok="item" />
          </li>
        </ul>
      </template>
      <div v-if="blok.buttons?.length" class="mrow__actions">
        <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
      </div>
    </div>
    <picture v-if="media?.filename" class="mrow__media">
      <source v-if="mediaMobile" media="(max-width: 720px)" :srcset="sbCrop(mediaMobile, 714)">
      <img
        :src="sbCrop(media, 1530)"
        :srcset="`${sbCrop(media, 765)} 765w, ${sbCrop(media, 1530)} 1530w`"
        :sizes="`(max-width: 720px) 92vw, ${mediaWidth}`"
        :alt="media.alt || ''"
        loading="lazy"
      >
    </picture>
  </div>
</template>

<style scoped>
/* Laid out on the 1440 frame so wide screens keep the design's positions. */
.mrow { display: grid; grid-template-columns: 1fr 1fr; align-items: center; max-width: var(--container); margin-inline: auto; }
.mrow__text { width: calc(28.47 * var(--sx)); }                            /* 410 */
.mrow--media-right .mrow__text { grid-column: 1; grid-row: 1; justify-self: start; margin-left: calc(12.85 * var(--sx)); }  /* x185 */
.mrow--media-left .mrow__text { grid-column: 2; grid-row: 1; justify-self: start; margin-left: calc(8.68 * var(--sx)); }   /* x845 */
.mrow--media-right .mrow__media { grid-column: 2; grid-row: 1; }
.mrow--media-left .mrow__media { grid-column: 1; grid-row: 1; }
/* The 765px image is wider than its 720px half: a flex row centres it with the
   overflow split evenly (a grid item that overflows would not stay centred). */
.mrow__media { display: flex; justify-content: center; min-width: 0; }
.mrow__media img { display: block; flex: none; width: var(--mrow-media-w, calc(53.13 * var(--sx))); max-width: 100%; height: auto; }

.mrow__title { margin: 0; font-size: clamp(2rem, 3.33vw, 3rem); font-weight: 600; line-height: 1.2083; color: var(--ink); }
.mrow--accent .mrow__title { color: var(--c-blue); }
.mrow__body { margin-top: 24px; font-size: 1.125rem; font-weight: 300; line-height: 1.6111; color: var(--ink-muted); }
.mrow__body :deep(p) { margin: 0; }
.mrow__body :deep(p + p) { margin-top: 29px; }
.mrow__body :deep(b), .mrow__body :deep(strong) { font-weight: 600; }
.mrow__actions { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 32px; }

/* Phones: copy then image, 16px gutters, 48px titles kept. */
@media (max-width: 720px) {
  .mrow { grid-template-columns: minmax(0, 1fr); gap: 24px; padding-inline: 16px; }
  .mrow--media-right .mrow__text, .mrow--media-left .mrow__text { grid-column: 1; grid-row: auto; justify-self: stretch; width: auto; margin: 0; }
  .mrow--media-right .mrow__media, .mrow--media-left .mrow__media { grid-column: 1; grid-row: auto; }
  .mrow__media img { flex: auto; width: 100%; }
  .mrow__title { font-size: clamp(2.25rem, 12.3vw, 3rem); }
}
</style>
