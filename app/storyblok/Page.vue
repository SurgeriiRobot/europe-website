<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <div v-editable="blok" :data-theme="blok.theme || 'light'">
    <StoryblokComponent v-for="section in blok.body || []" :key="section._uid" :blok="section" />
  </div>
</template>
