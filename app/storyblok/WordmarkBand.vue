<script setup lang="ts">
// Figma 991:18638 + 991:18639. "SHURUI" in Inter 600 at 360px (25vw), uppercase,
// with the robot cut-out overlapping the letters: the word's 432px line box starts
// 40px into a 320px band, so it overhangs by 152px and the image paints on top.
const props = defineProps<{ blok: any }>()
const media = computed(() => props.blok.media)
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section wordmark" :data-theme="blok.theme || 'light'">
    <SectionConnector :connector="blok.connector" />
    <span class="wordmark__rule" aria-hidden="true" />
    <span class="wordmark__tick" aria-hidden="true" />
    <p class="wordmark__word">{{ blok.word }}</p>
    <div class="wordmark__stage">
    <span class="wordmark__bracket" aria-hidden="true" />
    <img
      v-if="media?.filename"
      :src="sbCrop(media, 2280)"
      :srcset="`${sbCrop(media, 1440)} 1440w, ${sbCrop(media, 2280)} 2280w`"
      sizes="100vw"
      :alt="media.alt || ''"
      class="wordmark__media"
      loading="lazy"
    >
    </div>
    <p v-if="blok.caption" class="wordmark__caption container">{{ blok.caption }}</p>
  </section>
</template>

<style scoped>
.wordmark {
  padding-block: 40px 0;
  text-align: center;
  overflow: hidden;
}
/* Full-width hairline 66px below the band's top edge. */
.wordmark__rule {
  position: absolute;
  inset-inline: 0;
  top: 66px;
  border-top: var(--line-w) solid var(--line);
}
.wordmark__word {
  position: relative;
  margin: 0;
  font-size: 25vw;               /* 360/1440 */
  font-weight: 600;
  line-height: 1.2;              /* 432/360 */
  letter-spacing: 0;
  text-transform: uppercase;
  color: var(--c-darkblue);
  white-space: nowrap;
}
.wordmark__tick {                /* 66px gutter tick at the right, from the band's top */
  position: absolute;
  top: 0;
  right: 5.21vw;
  height: 66px;
  border-left: var(--line-w) solid var(--line);
}
.wordmark__stage {
  position: relative;
  margin-top: -10.56vw;          /* the 152px overhang */
}
.wordmark__media {
  position: relative;
  display: block;
  width: 100%;
  height: 48.4vw;                /* 697/1440 */
  object-fit: contain;
}
/* L-bracket at the left gutter: vertical 124-461px into the image, then out to the edge. */
.wordmark__bracket {
  position: absolute;
  left: 0;
  top: 8.61vw;
  width: 11.88vw;                /* 171 */
  height: 23.4vw;                /* 337 */
  border-bottom: var(--line-w) solid var(--line);
  pointer-events: none;
}
.wordmark__bracket::before {
  content: '';
  position: absolute;
  left: 5.21vw;                  /* 75 */
  top: 0;
  bottom: 0;
  border-left: var(--line-w) solid var(--line);
}
.wordmark__caption { padding-block: var(--space-5); color: var(--ink-muted); }
</style>
