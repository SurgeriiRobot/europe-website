<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <div v-editable="blok">
    <StoryblokComponent v-for="nested in blok.body || []" :key="nested._uid" :blok="nested" />
  </div>
</template>
