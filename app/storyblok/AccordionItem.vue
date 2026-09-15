<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <details v-editable="blok" class="item">
    <summary class="item__summary">
      <span>{{ blok.label }}</span>
      <span class="item__marker" aria-hidden="true">+</span>
    </summary>
    <div class="item__body">
      <StoryblokRichText v-if="blok.body" :document="blok.body" />
    </div>
  </details>
</template>

<style scoped>
.item { border-bottom: 1px solid var(--border); }
.item__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding-block: var(--space-4);
  font-size: var(--t-h6);
  color: var(--accent);
  cursor: pointer;
  list-style: none;
}
.item__summary::-webkit-details-marker { display: none; }
.item__marker { font-size: 1.5rem; line-height: 1; transition: rotate 0.15s; }
.item[open] .item__marker { rotate: 45deg; }
.item__body { padding-bottom: var(--space-4); color: var(--ink-muted); }
</style>
