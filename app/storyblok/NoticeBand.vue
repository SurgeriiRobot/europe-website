<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section notice" :data-theme="blok.theme || 'light'">
    <div class="container container--narrow notice__inner">
      <img v-if="blok.icon?.filename" :src="blok.icon.filename" :alt="''" class="notice__icon" height="40">
      <h2 v-if="blok.headline" class="notice__headline">{{ blok.headline }}</h2>
      <p v-if="blok.body" class="notice__body caption">{{ blok.body }}</p>
    </div>
  </section>
</template>

<style scoped>
.notice__inner { display: grid; justify-items: center; gap: var(--space-3); text-align: center; }
.notice__headline { font-size: var(--t-h4); }
.notice__body { color: var(--ink-muted); max-width: 60ch; }
</style>
