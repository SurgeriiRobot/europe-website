<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const columns = computed(() => Number(props.blok.columns) || 2)
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section features" :data-theme="blok.theme || 'dark'">
    <p v-if="blok.watermark" class="features__watermark" aria-hidden="true">{{ blok.watermark }}</p>
    <div class="container">
      <h2 v-if="blok.headline" class="features__headline">{{ blok.headline }}</h2>
      <div class="features__grid" :style="{ '--cols': columns }">
        <StoryblokComponent v-for="item in blok.items || []" :key="item._uid" :blok="item" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.features { position: relative; overflow: hidden; }
.features__watermark {
  margin: 0 0 var(--space-5);
  font-size: clamp(2.5rem, 9vw, 7rem);
  font-weight: var(--w-semibold);
  line-height: 0.95;
  color: color-mix(in srgb, currentColor 14%, transparent);
  user-select: none;
}
.features__headline { margin-bottom: var(--space-6); font-size: var(--t-h2); }
.features__grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr));
  gap: var(--space-4);
}
@media (max-width: 860px) { .features__grid { grid-template-columns: 1fr; } }
</style>
