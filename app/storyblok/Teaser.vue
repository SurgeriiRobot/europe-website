<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <h1 v-editable="blok" class="teaser">{{ blok.headline }}</h1>
</template>

<style scoped>
.teaser {
  margin: 0;
  padding: 4rem 1.5rem;
  text-align: center;
  font-size: clamp(2rem, 6vw, 3.5rem);
  line-height: 1.1;
}
</style>
