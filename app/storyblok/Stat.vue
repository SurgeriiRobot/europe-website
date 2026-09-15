<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <div v-editable="blok" class="stat">
    <img v-if="blok.icon?.filename" :src="blok.icon.filename" :alt="''" class="stat__icon" height="40">
    <p class="stat__value">{{ blok.value }}</p>
    <p class="stat__label">{{ blok.label }}</p>
  </div>
</template>

<style scoped>
.stat { display: grid; justify-items: center; gap: var(--space-2); }
.stat__value { margin: 0; font-size: var(--t-h1); font-weight: var(--w-semibold); line-height: 1; }
.stat__label { margin: 0; font-size: var(--t-body-sm); color: var(--ink-muted); }
</style>
