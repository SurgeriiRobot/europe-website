<script setup lang="ts">
withDefaults(defineProps<{
  headline?: string
  body?: string
  lines?: boolean
  tag?: 'h1' | 'h2' | 'h3'
}>(), { lines: false, tag: 'h2' })
</script>

<template>
  <div v-if="headline || body" class="sec-title" :class="{ 'sec-title--lines': lines }">
    <component :is="tag" v-if="headline" class="sec-title__h"><BrandText :text="headline" /></component>
    <p v-if="body" class="sec-title__p">{{ body }}</p>
    <slot />
  </div>
</template>
