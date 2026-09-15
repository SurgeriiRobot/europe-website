<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <div v-editable="blok" class="nav-column">
    <p v-if="blok.title" class="nav-column__title">{{ blok.title }}</p>
    <StoryblokComponent v-for="link in blok.links || []" :key="link._uid" :blok="link" />
  </div>
</template>

<style scoped>
.nav-column__title {
  margin-bottom: var(--space-2);
  font-size: var(--t-caption);
  font-weight: var(--w-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-muted);
}
</style>
