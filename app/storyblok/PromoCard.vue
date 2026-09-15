<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <article v-editable="blok" class="promo" :data-theme="blok.theme || 'brand'">
    <h3 class="promo__headline">{{ blok.headline }}</h3>
    <p v-if="blok.body" class="promo__body">{{ blok.body }}</p>
    <div v-if="blok.buttons?.length" class="promo__actions">
      <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
    </div>
  </article>
</template>

<style scoped>
.promo {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  justify-content: center;
  padding: var(--space-5);
  background: var(--surface);
  color: var(--ink);
  border-radius: var(--radius);
}
.promo__headline { font-size: var(--t-h5); }
.promo__body { font-size: var(--t-body-sm); }
</style>
