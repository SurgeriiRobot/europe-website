<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <!-- Rendered by Tabs.vue; standalone use just renders its content. -->
  <div v-editable="blok">
    <StoryblokComponent v-for="child in blok.body || []" :key="child._uid" :blok="child" />
  </div>
</template>
