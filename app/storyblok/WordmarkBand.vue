<script setup lang="ts">
// Figma 991:18638 + 991:18639. "SHURUI" in Inter 600 at 360px (calc(25 * var(--sx))), uppercase,
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
      sizes="calc(100 * var(--sx))"
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
  font-size: calc(25 * var(--sx));               /* 360/1440 */
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
  right: var(--frame-gutter);
  height: 66px;
  border-left: var(--line-w) solid var(--line);
}
.wordmark__stage {
  position: relative;
  margin-top: calc(-10.56 * var(--sx));   /* the 152px overhang */
}
.wordmark__media {
  position: relative;
  display: block;
  width: 100%;
  height: calc(48.4 * var(--sx));                /* 697/1440 */
  object-fit: contain;
}
/* L-bracket at the left gutter: vertical 124-461px into the image, then out to the edge. */
.wordmark__bracket {
  position: absolute;
  left: 0;
  top: calc(8.61 * var(--sx));
  width: calc(11.88 * var(--sx));                /* 171 */
  height: calc(23.4 * var(--sx));                /* 337 */
  border-bottom: var(--line-w) solid var(--line);
  pointer-events: none;
}
.wordmark__bracket::before {
  content: '';
  position: absolute;
  left: var(--frame-gutter);                   /* 75 */
  top: 0;
  bottom: 0;
  border-left: var(--line-w) solid var(--line);
}
.wordmark__caption { padding-block: var(--space-5); color: var(--ink-muted); }

/* Phone design (390 wide): rule and tick 34px down, a 100px word, and the
   product filling the 321x289 box the design gives it (our render's transparent
   margins are cropped by sizing, so its ink lands 909-1198 like the design's). */
@media (max-width: 720px) {
  .wordmark { padding-top: 37px; }
  .wordmark__rule { top: 34px; }
  .wordmark__tick { right: 40px; height: 34px; }
  .wordmark__word { font-size: 25.64vw; }                     /* 100px */
  .wordmark__stage { margin-top: -12.46vw; }
  .wordmark__media { width: 125.4vw; max-width: none; height: auto; margin: 0 0 -4.2vw -7.55vw; object-fit: fill; }
  .wordmark__bracket { display: none; }
}
</style>
