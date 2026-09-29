<script setup lang="ts">
// Clinical Applications "Pediatric applications" (Figma 4640-5804): oversized
// pale Lora words, centred, over white fading into brand blue towards the band
// below. The words are decoration; the band that follows carries the heading.
defineProps<{ blok: any }>()
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section wmband"
    :class="`wmband--${blok.backdrop || 'fade-to-brand'}`"
    :data-theme="blok.theme || 'light'"
  >
    <SectionConnector :connector="blok.connector" />
    <p class="wmband__word display-word" aria-hidden="true">{{ blok.word }}</p>
  </section>
</template>

<style scoped>
.wmband { padding: calc(40.65 * var(--sx)) 0 calc(5.19 * var(--sx)); overflow: hidden; }   /* 585 to the words / 75 */
.wmband--fade-to-brand { background: var(--grad-fade-to-brand); }
/* 252px Lora on a 252px line, white at 50%, each line centred on the page even
   where it runs wider than the screen. */
.wmband__word {
  width: max-content;
  margin: 0 0 0 50%;
  translate: -50% 0;
  font-size: calc(17.5 * var(--sx));
  line-height: 1;
  text-align: center;
  white-space: pre-line;
  color: rgb(255 255 255 / 50%);
  user-select: none;
}

/* Phones: 62px words wrapped to the screen, 36px above the band below. */
@media (max-width: 720px) {
  .wmband { padding: 194px 0 36px; }
  .wmband__word { width: auto; margin: 0; translate: none; font-size: 15.9vw; white-space: normal; }
}
</style>
