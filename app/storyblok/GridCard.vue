<script setup lang="ts">
// A card in a card_grid (SP Robot "System composition" / "Go deeper"): a 335x366
// image with 24px corners, a blue Inter 600 24/29 title 31px under it, then body
// copy ("info") or an outlined "Explore more" button ("link"). Phones get their
// own image shape, cut around the same focal point.
const props = withDefaults(defineProps<{ blok: any, variant?: 'info' | 'link' | 'product' }>(), { variant: 'info' })
const sbHref = useSbUrl()
const href = computed(() => {
  const l = props.blok.link
  return l && (l.cached_url || l.url || l.story?.full_slug) ? sbHref(l) : null
})
const image = computed(() => props.blok.image)
// Phone image boxes: 321x400 in the composition slider, 358x240 when stacked,
// 358x400 for a product tile.
const phone = computed(() => {
  if (props.variant === 'product') return [716, 800]
  return props.variant === 'info' ? [642, 800] : [716, 480]
})
// Product tiles are drawn 410x480; every other card is 335x366.
const shot = computed(() => (props.variant === 'product' ? [820, 960] : [670, 732]))
</script>

<template>
  <article v-editable="blok" class="gcard" :class="`gcard--${variant}`">
    <component
      :is="href ? 'NuxtLink' : 'div'"
      :to="href || undefined"
      class="gcard__media"
      :tabindex="href ? -1 : undefined"
      :aria-hidden="href ? 'true' : undefined"
    >
      <picture v-if="image?.filename">
        <source media="(max-width: 720px)" :srcset="sbCrop(image, phone[0]!, phone[1]!)">
        <img :src="sbCrop(image, shot[0]!, shot[1]!)" :alt="image.alt || ''" :width="variant === 'product' ? 410 : 335" :height="variant === 'product' ? 480 : 366" loading="lazy">
      </picture>
    </component>
    <h3 class="gcard__title"><BrandText :text="blok.title" /></h3>
    <p v-if="blok.body" class="gcard__body"><BrandText :text="blok.body" :nowrap="false" /></p>
    <NuxtLink v-if="href && variant === 'link'" :to="href" class="gcard__button">{{ blok.link_label || 'Explore more' }}</NuxtLink>
  </article>
</template>

<style scoped>
.gcard { display: flex; flex-direction: column; align-items: flex-start; }
.gcard__media {
  display: block;
  width: 100%;
  aspect-ratio: 335 / 366;
  overflow: hidden;
  border-radius: 24px;
  background: var(--c-neutral-300);
}
.gcard__media img { width: 100%; height: 100%; object-fit: cover; }
.gcard__title {
  margin: 31px 0 0;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2083;                                  /* 29/24 */
  color: var(--c-blue);
  white-space: pre-line;                                /* "Instruments & flexible\n3D endoscope" */
}
.gcard__body { margin: 24px 0 0; font-size: 1.125rem; font-weight: 300; line-height: 1.6111; color: var(--ink); }
.gcard__button {
  margin-top: 24px;
  padding: 7px 21px;
  border: 1px solid var(--c-blue);
  border-radius: 4px;
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.625rem;
  letter-spacing: 0.46px;
  color: var(--c-blue);
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 150ms ease;
}
.gcard__button:hover { background: rgb(7 69 254 / 6%); }

/* Product tile (Instruments Ecosystem): the 36px title and its caption are set
   above a 410x480 white tile, the whole card centred. The picture is ordered last
   visually; it carries no focus stop, so the reading order stays title-first. */
.gcard--product { align-items: center; text-align: center; }
.gcard--product .gcard__title { order: 1; margin: 0; font-size: calc(2.5 * var(--sx)); line-height: 1.2083; }   /* 36/43.5 */
.gcard--product .gcard__body { order: 2; margin: calc(1.67 * var(--sx)) 0 calc(2.26 * var(--sx)); }            /* 24 / 32.5 */
/* Tiles line up across a row even where one caption runs to two lines, so the
   card stretches to the row and the auto margin carries the slack. */
.gcard--product .gcard__media {
  order: 3;
  margin-top: auto;
  aspect-ratio: 410 / 480;
  background: #fcfcfc;
}

/* Phones: composition cards are 321 wide with the copy 16px in (16/26 body);
   "Go deeper" cards stack, 358x240 image, title and button centred. */
@media (max-width: 720px) {
  .gcard--info .gcard__media { aspect-ratio: 321 / 400; }
  .gcard--info .gcard__title, .gcard--info .gcard__body { padding-inline: 16px; }
  .gcard--info .gcard__title { margin-top: 29px; }
  .gcard--info .gcard__body { margin-top: 28px; font-size: 1rem; line-height: 1.625; }
  .gcard--link { align-items: center; text-align: center; }
  .gcard--link .gcard__media { aspect-ratio: 358 / 240; }
  .gcard--link .gcard__title { margin-top: 32px; }
  /* Product tiles keep the 36px title and run the full column width, 358x400. */
  .gcard--product .gcard__title { font-size: 2.25rem; }
  .gcard--product .gcard__body { margin: 24px 0; }
  .gcard--product .gcard__media { aspect-ratio: 358 / 400; }
}
</style>
