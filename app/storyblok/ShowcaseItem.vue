<script setup lang="ts">
// Rendered by Showcase.vue; standalone it simply shows the product.
defineProps<{ blok: any }>()
</script>

<template>
  <figure v-editable="blok" class="showcase-item">
    <img v-if="blok.image?.filename" :src="sbCrop(blok.image, 1440)" :alt="blok.image.alt || blok.name">
    <figcaption>{{ blok.headline || blok.name }}</figcaption>
  </figure>
</template>
