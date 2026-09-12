<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <div v-editable="blok" class="feature">
    <h2>{{ blok.name }}</h2>
  </div>
</template>

<style scoped>
.feature {
  border: 1px solid currentColor;
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
}
.feature h2 { margin: 0; font-size: 1.1rem; }
</style>
