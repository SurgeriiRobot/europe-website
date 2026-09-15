<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section wordmark" :data-theme="blok.theme || 'light'">
    <p class="wordmark__word">{{ blok.word }}</p>
    <img v-if="blok.media?.filename" :src="blok.media.filename" :alt="blok.media.alt || ''" class="wordmark__media">
    <p v-if="blok.caption" class="wordmark__caption container">{{ blok.caption }}</p>
  </section>
</template>

<style scoped>
.wordmark { position: relative; text-align: center; overflow: hidden; }
.wordmark__word {
  margin: 0;
  font-family: var(--font-display);
  font-weight: var(--w-semibold);
  font-size: clamp(3rem, 18vw, 14rem);
  line-height: 0.9;
  color: var(--c-darkblue);
  letter-spacing: -0.02em;
}
.wordmark__media { margin: calc(var(--space-7) * -1) auto 0; max-width: min(100%, 48rem); }
.wordmark__caption { margin-top: var(--space-5); color: var(--ink-muted); }
</style>
