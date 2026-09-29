<script setup lang="ts">
// A card in a card_grid (SP Robot "System composition" / "Go deeper"): a 335x366
// image with 24px corners, a blue Inter 600 24/29 title 31px under it, then body
// copy ("info") or an outlined "Explore more" button ("link"). Phones get their
// own image shape, cut around the same focal point.
const props = withDefaults(defineProps<{ blok: any, variant?: 'info' | 'link' }>(), { variant: 'info' })
const sbHref = useSbUrl()
const href = computed(() => {
  const l = props.blok.link
  return l && (l.cached_url || l.url || l.story?.full_slug) ? sbHref(l) : null
})
const image = computed(() => props.blok.image)
// Phone image boxes: 321x400 in the composition slider, 358x240 when stacked.
const phone = computed(() => (props.variant === 'info' ? [642, 800] : [716, 480]))
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
        <img :src="sbCrop(image, 670, 732)" :alt="image.alt || ''" width="335" height="366" loading="lazy">
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
}
</style>
