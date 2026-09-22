<script setup lang="ts">
// Figma 991:18680-82: 200px lead-in, title with hairlines, then a 2x408px grid
// (30px apart) — values in Lora 600 96/115 blue, labels Inter 600 24/29 — and a
// centred button 80px below.
const props = defineProps<{ blok: any }>()
const columns = computed(() => Number(props.blok.columns) || 2)
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section stats" :data-theme="blok.theme || 'light'">
    <SectionConnector :connector="blok.connector" />
    <div class="container stats__inner">
      <SectionTitle :headline="blok.headline" :body="blok.intro" :lines="blok.title_lines" />
      <div class="stats__grid" :style="{ '--cols': columns }">
        <StoryblokComponent v-for="item in blok.items || []" :key="item._uid" :blok="item" />
      </div>
      <div v-if="blok.buttons?.length" class="stats__actions">
        <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats { padding: clamp(96px, 13.9vw, 200px) 0 clamp(96px, 13.9vw, 200px); }
.stats__inner { display: grid; justify-items: center; }
.stats__grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 2), minmax(0, 408px));
  gap: clamp(56px, 8.3vw, 120px) 30px;
  margin-top: clamp(48px, 7.4vw, 106px);
}
.stats__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; margin-top: 80px; }
@media (max-width: 640px) { .stats__grid { grid-template-columns: minmax(0, 1fr); } }
</style>
