<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <div v-editable="blok" class="grid">
    <StoryblokComponent v-for="column in blok.columns || []" :key="column._uid" :blok="column" />
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1.25rem;
  max-width: 60rem;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
}
</style>
