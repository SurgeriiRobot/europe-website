<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section statement" :data-theme="blok.theme || 'dark'">
    <p v-if="blok.watermark" class="statement__watermark" aria-hidden="true">{{ blok.watermark }}</p>
    <div class="container container--narrow statement__inner stack">
      <h2 class="statement__headline">{{ blok.headline }}</h2>
      <p v-if="blok.body" class="statement__body">{{ blok.body }}</p>
      <div v-if="blok.buttons?.length" class="statement__actions">
        <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.statement { position: relative; text-align: center; overflow: hidden; }
.statement__watermark {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  margin: 0;
  font-size: clamp(3rem, 12vw, 9rem);
  font-weight: var(--w-semibold);
  line-height: 0.9;
  color: color-mix(in srgb, currentColor 12%, transparent);
  pointer-events: none;
  user-select: none;
}
.statement__inner { position: relative; }
.statement__headline { font-size: var(--t-h2); }
.statement__body { color: var(--ink-muted); }
.statement__actions { display: flex; flex-wrap: wrap; gap: var(--space-3); justify-content: center; }
</style>
