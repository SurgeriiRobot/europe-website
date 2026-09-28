<script setup lang="ts">
// Figma 991:18677: a 1290x600 card (75px gutters, 24px radius) on the grey field.
// Portrait fills the card under a black wash — solid to 40% of the width, gone by
// 70% — with the quote (Inter 600 34/41, 520 wide) and a white author line on top
// (name Inter 600 14/17, role 300 16/19), and the button pinned to the bottom.
const props = defineProps<{ blok: any }>()
const portrait = computed(() => props.blok.portrait)
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section quote" :data-theme="blok.theme || 'muted'">
    <SectionConnector :connector="blok.connector" />
    <figure class="quote__card">
      <img
        v-if="portrait?.filename"
        :src="sbCrop(portrait, 2580, 1200)"
        :srcset="`${sbCrop(portrait, 1290, 600)} 1290w, ${sbCrop(portrait, 2580, 1200)} 2580w`"
        sizes="(max-width: 1440px) 90vw, 1290px"
        :alt="portrait.alt || blok.author || ''"
        class="quote__bg"
        loading="lazy"
      >
      <div class="quote__content">
        <div class="quote__top">
          <blockquote class="quote__text">{{ blok.quote }}</blockquote>
          <figcaption class="quote__author">
            <span class="quote__tick" aria-hidden="true" />
            <span class="quote__name">{{ blok.author }}</span>
            <span v-if="blok.role" class="quote__role">{{ blok.role }}</span>
          </figcaption>
        </div>
        <div v-if="blok.buttons?.length" class="quote__actions">
          <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
        </div>
      </div>
    </figure>
  </section>
</template>

<style scoped>
.quote { padding: 0 clamp(16px, 5.2vw, 75px); }
.quote__card {
  position: relative;
  isolation: isolate;
  max-width: 1290px;
  min-height: clamp(480px, 41.7vw, 600px);
  margin: 0 auto;
  overflow: hidden;
  border-radius: 24px;
  background: var(--c-neutral-1000);
}
.quote__bg { position: absolute; inset: 0; z-index: -2; width: 100%; height: 100%; object-fit: cover; }
.quote__card::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, #000 40%, rgb(102 102 102 / 0) 70%);
}
.quote__content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 40px;
  min-height: inherit;
  padding: 60px clamp(24px, 5.2vw, 75px);
}
.quote__top { display: grid; gap: 32px; max-width: 520px; }
.quote__text {
  margin: 0;
  font-size: clamp(1.5rem, 2.36vw, 2.125rem);
  font-weight: 600;
  line-height: 1.206;              /* 41/34 */
  color: var(--c-white);
}
.quote__author {
  position: relative;
  display: grid;
  color: var(--c-white);
}
.quote__name { font-size: 0.875rem; font-weight: 600; line-height: 1.2143; }   /* 14/17 */
.quote__role { font-size: 1rem; font-weight: 300; line-height: 1.1875; }      /* 16/19 */
/* 43px hairline from the card edge to the author line. */
.quote__tick {
  position: absolute;
  top: 9px;
  right: calc(100% + 32px);
  width: 43px;
  border-top: var(--line-w) solid var(--c-white);
}
.quote__actions { display: flex; flex-wrap: wrap; gap: 16px; }

/* Phone design (390 wide): a 540px card, 16px in, 16px radius; the quote sits on
   black at the top and the portrait fills the bottom 358px, fading up into it. */
@media (max-width: 720px) {
  .quote { padding: 0 16px; }
  .quote__card { min-height: 540px; border-radius: 16px; }
  .quote__bg { inset: auto 0 0 0; height: 66.3%; object-position: 52% center; }
  .quote__card::after { background: linear-gradient(180deg, #000 35%, rgb(0 0 0 / 0) 52%); }
  .quote__content { gap: 24px; padding: 15px 16px 48px; }
  .quote__top { gap: 35px; max-width: none; }
  .quote__text { font-size: 1.25rem; line-height: 1.2; }           /* 20/24 */
  .quote__role { font-size: 0.875rem; line-height: 1.2143; }       /* 14/17 */
  .quote__tick { display: none; }
}
</style>
