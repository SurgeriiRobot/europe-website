<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section text-media"
    :data-theme="blok.theme || 'light'"
    :class="`text-media--${blok.media_position || 'right'}`"
  >
    <div class="container text-media__inner">
      <div class="text-media__text stack">
        <h2 v-if="blok.headline">{{ blok.headline }}</h2>
        <StoryblokRichText v-if="blok.body" :document="blok.body" class="text-media__body" />
        <div v-if="blok.buttons?.length" class="text-media__actions">
          <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
        </div>
      </div>
      <img v-if="blok.media?.filename" :src="blok.media.filename" :alt="blok.media.alt || ''" class="text-media__media" loading="lazy">
    </div>
  </section>
</template>

<style scoped>
.text-media__inner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  align-items: center;
  gap: var(--space-7);
}
.text-media--left .text-media__media { order: -1; }
.text-media__body { color: var(--ink-muted); }
.text-media__actions { display: flex; flex-wrap: wrap; gap: var(--space-3); }
@media (max-width: 720px) {
  .text-media--left .text-media__media { order: 0; }
}
</style>
