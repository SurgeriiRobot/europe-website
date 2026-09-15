<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section hero"
    :data-theme="blok.theme || 'light'"
    :class="`hero--media-${blok.media_position || 'right'}`"
  >
    <div class="container hero__inner">
      <div class="hero__text stack">
        <p v-if="blok.eyebrow" class="hero__eyebrow caption">{{ blok.eyebrow }}</p>
        <h1 class="hero__headline">{{ blok.headline }}</h1>
        <p v-if="blok.body" class="hero__body">{{ blok.body }}</p>
        <div v-if="blok.buttons?.length" class="hero__actions">
          <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
        </div>
      </div>
      <img
        v-if="blok.media?.filename"
        :src="blok.media.filename"
        :alt="blok.media.alt || ''"
        class="hero__media"
        loading="eager"
      >
    </div>
  </section>
</template>

<style scoped>
.hero__inner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  align-items: center;
  gap: var(--space-7);
}
.hero--media-left .hero__media { order: -1; }
.hero__eyebrow { text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-muted); }
.hero__headline { font-size: var(--t-h1); }
.hero__body { max-width: 48ch; color: var(--ink-muted); }
.hero__actions { display: flex; flex-wrap: wrap; gap: var(--space-3); }
@media (max-width: 720px) {
  .hero--media-left .hero__media { order: 0; }
}
</style>
