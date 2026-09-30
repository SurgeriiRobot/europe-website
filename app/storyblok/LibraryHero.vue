<script setup lang="ts">
// Clinical Library banner (Figma clinical-library-desktop, 0-800): a full-bleed
// photograph with the copy anchored bottom-left at the 75px gutter on a 528px
// measure — Inter 600 48/58 over Inter 300 18/29, 31px apart, 81px above the
// foot. Unlike `hero_full` (339-380px column, home / SP Robot / Clinical
// applications) this page's lines run the full measure, so the wraps only come
// out right on the wider column.
const props = defineProps<{ blok: any }>()

const WIDTHS = [768, 1440, 2160, 2880]
const bg = computed(() => props.blok.background)
const bgMobile = computed(() => (props.blok.background_mobile?.filename ? props.blok.background_mobile : null))
const src = computed(() => (bg.value?.filename ? sbImage(bg.value, '1440x0/filters:format(webp):quality(80)') : ''))
const srcset = computed(() =>
  bg.value?.filename
    ? WIDTHS.map(w => `${sbImage(bg.value, `${w}x0/filters:format(webp):quality(80)`)} ${w}w`).join(', ')
    : '',
)
// The design places the photo so its horizon sits a little above centre; with a
// full-bleed cover crop that is 37% down the source frame.
const position = computed(() => props.blok.focus_y || '37%')
const height = computed(() => Number(props.blok.height) || 800)
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="lhero"
    :data-theme="blok.theme || 'dark'"
    :style="{ '--lhero-h': `${height}px`, '--lhero-ratio': `${(height / 1440) * 100}vw` }"
  >
    <picture v-if="src && bgMobile">
      <source media="(max-width: 720px)" :srcset="sbCrop(bgMobile, 780, 1560)">
      <img
        :src="src"
        :srcset="srcset"
        sizes="100vw"
        :alt="bg.alt || ''"
        class="lhero__bg"
        :style="{ objectPosition: `center ${position}` }"
        loading="eager"
        fetchpriority="high"
      >
    </picture>
    <img
      v-else-if="src"
      :src="src"
      :srcset="srcset"
      sizes="100vw"
      :alt="bg.alt || ''"
      class="lhero__bg"
      :style="{ objectPosition: `center ${position}` }"
      loading="eager"
      fetchpriority="high"
    >

    <div class="lhero__inner">
      <div class="lhero__content">
        <h1 class="lhero__headline"><BrandText :text="blok.headline" /></h1>
        <p v-if="blok.body" class="lhero__body"><BrandText :text="blok.body" /></p>
        <div v-if="blok.buttons?.length" class="lhero__actions">
          <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lhero {
  position: relative;
  isolation: isolate;
  display: flex;
  min-height: clamp(560px, var(--lhero-ratio, 55.56vw), var(--lhero-h, 800px));
  overflow: hidden;
  background: var(--c-black);
  color: var(--c-white);
}
/* As the page's opening section it starts at y=0 behind the header, exactly as
   drawn (banner 0-800 with the header over its top 80px). */
.lhero:first-child { margin-top: calc(-1 * var(--header-h)); }

.lhero__bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* The design darkens the left of the photograph behind the copy. Ours holds the
   wash a little longer and a little heavier than Figma's: the design leaves the
   end of the body lines on about 3.9:1, and the 18px Light setting needs 4.5:1. */
.lhero::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg,
    rgb(20 25 37 / 82%) 0%,
    rgb(20 25 37 / 74%) 20%,
    rgb(20 25 37 / 52%) 42%,
    rgb(20 25 37 / 26%) 54%,
    rgb(20 25 37 / 0) 68%);
}

.lhero__inner {
  display: flex;
  align-items: flex-end;
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding: calc(var(--header-h) + 60px) var(--gutter-design) 81px;
}
.lhero__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 31px;
  max-width: 528px;
}
.lhero__headline {
  margin: 0;
  font-size: clamp(2.25rem, 3.33vw, 3rem);     /* 48 */
  font-weight: 600;
  line-height: 1.2083;                          /* 58/48 */
  color: inherit;
}
.lhero__body {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;                          /* 29/18 */
  white-space: pre-line;                        /* the blank line between the two paragraphs */
}
.lhero__actions { display: flex; flex-wrap: wrap; gap: 16px; }

/* No phone frame was drawn for this page, so it follows the banner convention
   the built pages already use: 780px tall under the transparent header, copy at
   the 16px gutter, 34/41 title over 16/26 body, 48px above the edge. */
@media (max-width: 720px) {
  .lhero { min-height: clamp(560px, 200vw, 780px); }
  .lhero__inner { padding: calc(var(--header-h) + 60px) 16px 48px; }
  .lhero__content { gap: 24px; max-width: none; }
  .lhero__headline { font-size: clamp(1.75rem, 8.72vw, 2.125rem); line-height: 1.206; }
  .lhero__body { font-size: 1rem; line-height: 1.625; }
  .lhero::after {
    background: linear-gradient(0deg, rgb(20 25 37 / 82%) 0%, rgb(20 25 37 / 62%) 42%, rgb(20 25 37 / 18%) 72%, rgb(20 25 37 / 0) 100%);
  }
  .lhero__actions { width: 100%; }
  .lhero__actions > :deep(.btn) { flex: 1 1 100%; justify-content: center; }
}
</style>
