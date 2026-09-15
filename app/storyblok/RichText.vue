<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section prose" :data-theme="blok.theme || 'light'">
    <div class="container" :class="blok.width === 'wide' ? '' : 'container--narrow'">
      <StoryblokRichText :document="blok.body" />
    </div>
  </section>
</template>

<style scoped>
.prose :deep(h2) { margin-top: var(--space-7); font-size: var(--t-h3); }
.prose :deep(h3) { margin-top: var(--space-6); font-size: var(--t-h4); }
.prose :deep(ul), .prose :deep(ol) { padding-inline-start: 1.25rem; }
.prose :deep(li) { margin-bottom: var(--space-2); }
.prose :deep(a) { color: var(--accent); }
.prose :deep(table) { width: 100%; border-collapse: collapse; }
.prose :deep(td), .prose :deep(th) { border: 1px solid var(--border); padding: var(--space-2); text-align: start; }
</style>
