<script setup lang="ts">
// layout "bands" (Figma 991:18647-49): full-width 800px rows, image half and
// text half, alternating sides. layout "grid": the original card grid.
const props = defineProps<{ blok: any }>()
const columns = computed(() => Number(props.blok.columns) || 2)
const bands = computed(() => props.blok.layout === 'bands')
const items = computed<any[]>(() => props.blok.items || [])
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section features"
    :class="{ 'features--bands': bands }"
    :data-theme="blok.theme || 'dark'"
  >
    <SectionConnector :connector="blok.connector" />
    <p v-if="blok.watermark" class="features__watermark display-word" aria-hidden="true">{{ blok.watermark }}</p>

    <template v-if="bands">
      <StoryblokComponent
        v-for="(item, i) in items"
        :key="item._uid"
        :blok="item"
        layout="band"
        :flip="i % 2 === 1"
        :decor="i % 3"
      />
    </template>

    <div v-else class="container">
      <SectionTitle :headline="blok.headline" />
      <div class="features__grid" :style="{ '--cols': columns }">
        <StoryblokComponent v-for="item in items" :key="item._uid" :blok="item" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.features { overflow: hidden; }
.features--bands { padding: 0; background: var(--c-white) var(--grad-features); }
.features__watermark {
  margin: 0 0 var(--space-5);
  font-size: clamp(2.5rem, 9vw, 7rem);
  color: color-mix(in srgb, currentColor 14%, transparent);
  user-select: none;
}
.features__grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-6);
}
@media (max-width: 860px) { .features__grid { grid-template-columns: 1fr; } }
</style>
