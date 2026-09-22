<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <div v-editable="blok" class="stat">
    <img v-if="blok.icon?.filename" :src="sbCrop(blok.icon, 0, 80)" alt="" class="stat__icon" height="40">
    <p class="stat__value display-word">{{ blok.value }}</p>
    <p class="stat__label">{{ blok.label }}</p>
  </div>
</template>

<style scoped>
.stat { display: grid; justify-items: center; text-align: center; }
.stat__value {
  margin: clamp(24px, 7.6vw, 110px) 0 0;
  font-size: clamp(3.5rem, 6.67vw, 6rem);   /* 96px */
  line-height: 1.198;                        /* 115/96 */
  color: var(--c-blue);
}
.stat__label {
  margin: clamp(16px, 2.4vw, 35px) 0 0;
  font-size: clamp(1.125rem, 1.67vw, 1.5rem);
  font-weight: 600;
  line-height: 1.2083;
  color: var(--ink);
}
</style>
