<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <div v-editable="blok" class="logo-group">
    <p v-if="blok.title" class="logo-group__title caption">{{ blok.title }}</p>
    <ul class="logo-group__list">
      <li v-for="logo in blok.logos || []" :key="logo._uid">
        <StoryblokComponent :blok="logo" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.logo-group { margin-bottom: var(--space-7); }
.logo-group__title {
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-muted);
  margin-bottom: var(--space-4);
}
.logo-group__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
