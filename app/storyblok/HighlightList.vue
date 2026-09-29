<script setup lang="ts">
// Instruments Ecosystem "Key differentiators" (Figma 818-1961): a 100px title
// with hairlines, then a cut-out instrument running off the left edge beside a
// short list of the page's highlights, each a link down to the row that explains
// it. The first is lit in brand blue; hovering or focusing another lights that
// one instead. Phones stack the title, the cut-out and the list.
const props = defineProps<{ blok: any }>()
const items = computed<any[]>(() => props.blok.items || [])
const media = computed(() => (props.blok.media?.filename ? props.blok.media : null))
const sbHref = useSbUrl()
const hrefOf = (l: any) => (l && (l.cached_url || l.url || l.story?.full_slug) ? sbHref(l) : null)
const active = ref(0)
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section hl" :data-theme="blok.theme || 'light'">
    <SectionConnector :connector="blok.connector" />
    <div class="container hl__head">
      <SectionTitle :headline="blok.headline" :lines="blok.title_lines" />
    </div>
    <div class="hl__stage">
      <img
        v-if="media"
        class="hl__media"
        :src="sbImage(media, '2310x0')"
        :srcset="`${sbImage(media, '1160x0')} 1160w, ${sbImage(media, '2310x0')} 2310w`"
        sizes="(max-width: 720px) 161vw, calc(80.11 * min(1vw, 14.4px))"
        :alt="media.alt || ''"
        loading="lazy"
      >
      <ul v-if="items.length" class="hl__list">
        <li
          v-for="(item, i) in items"
          :key="item._uid"
          v-editable="item"
          class="hl__item"
          :class="{ 'is-active': active === i }"
          @mouseenter="active = i"
        >
          <component
            :is="hrefOf(item.link) ? 'a' : 'span'"
            :href="hrefOf(item.link) || undefined"
            class="hl__link"
            @focus="active = i"
          >
            <BrandText :text="item.label" />
          </component>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.hl {
  --connector-len: calc(6.94 * var(--sx));                                  /* 100 */
  padding: calc(8.4 * var(--sx)) 0 calc(7.29 * var(--sx));                  /* 121 to the title / 105 */
  overflow: hidden;
}
/* 100px title; its hairlines stop at 157px, like the other oversized titles. */
.hl__head { --title-line: calc(50vw - 563px); }
.hl__head :deep(.sec-title) { max-width: none; }
.hl__head :deep(.sec-title__h) { font-size: clamp(3rem, 6.94vw, 6.25rem); line-height: 1.21; }

/* Laid out on the 1440 frame: the cut-out's drawing starts 200px under the title
   and 450px off the frame's left edge; the list sits at x859, 311px down. */
.hl__stage { position: relative; max-width: var(--container); min-height: calc(55.28 * var(--sx)); margin-inline: auto; }   /* 796 */
.hl__media {
  position: absolute;
  top: calc(13.61 * var(--sx));                                             /* 196 */
  left: calc(-31.28 * var(--sx));                                           /* -450.5 */
  width: calc(80.11 * var(--sx));                                           /* 1153.6 */
  max-width: none;
  height: auto;
  pointer-events: none;
}
.hl__list {
  position: relative;
  display: grid;
  gap: 28px;
  width: calc(27.92 * var(--sx));                                           /* 402 */
  margin: 0 0 0 calc(59.65 * var(--sx));                                    /* x859 */
  padding: calc(21.35 * var(--sx)) 0 0;                                     /* 307.5 */
  list-style: none;
}
.hl__item { position: relative; padding-left: 22px; font-size: 1.5rem; font-weight: 600; line-height: 1.25; color: var(--c-darkblue); transition: color 200ms ease; }   /* 24/30 */
/* 7.4px dot on the first line's x-height. */
.hl__item::before { content: ''; position: absolute; top: 14.2px; left: 0.3px; width: 7.4px; height: 7.4px; border-radius: 50%; background: currentColor; }
.hl__item.is-active { color: var(--c-blue); }
.hl__link { color: inherit; text-decoration: none; }
.hl__link:hover { text-decoration: none; }

/* Phone design (780-1710): 52px title in two lines with 16px edge ticks, the
   cut-out 626px wide from 63vw off the left, the list at x30 overlapping its foot. */
@media (max-width: 720px) {
  .hl { --connector-len: 80px; padding: 72px 0 172px; }
  .hl__head :deep(.sec-title__h) { font-size: 13.33vw; line-height: 1.1923; }            /* 52/62 */
  .hl__head :deep(.sec-title--lines .sec-title__text::before),
  .hl__head :deep(.sec-title--lines .sec-title__text::after) { display: block; width: 16px; }
  .hl__stage { min-height: 0; padding-top: 74px; }
  .hl__media { position: relative; top: auto; left: -63vw; width: 160.6vw; }
  .hl__list { width: auto; margin: -42px 8px 0 30px; padding: 0; }            /* "Dual Continuum Mechanism" (326px) on one line */
}
</style>
