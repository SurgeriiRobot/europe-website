<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section logos" :data-theme="blok.theme || 'light'">
    <div class="container">
      <h2 v-if="blok.headline" class="logos__headline">{{ blok.headline }}</h2>
      <StoryblokComponent v-for="group in blok.groups || []" :key="group._uid" :blok="group" />
    </div>
  </section>
</template>

<style scoped>
.logos__headline { margin-bottom: var(--space-6); font-size: var(--t-h3); text-align: center; }
</style>
