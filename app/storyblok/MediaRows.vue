<script setup lang="ts">
// Rows of copy beside an image (SP Robot "1. Access / 2. Deployment / 3. Control",
// Figma 8601-10553): media on the right, left or alternating, rows 240px apart,
// the first 105px under the section top and the last 220px above its bottom.
const props = defineProps<{ blok: any }>()
const items = computed<any[]>(() => props.blok.items || [])
const sideOf = (i: number): 'left' | 'right' => {
  const start = props.blok.media_side === 'left' ? 'left' : 'right'
  if (props.blok.alternate && i % 2 === 1) return start === 'left' ? 'right' : 'left'
  return start
}
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section rows" :data-theme="blok.theme || 'light'">
    <SectionConnector :connector="blok.connector" />
    <div v-if="blok.headline" class="container rows__head">
      <SectionTitle :headline="blok.headline" :lines="blok.title_lines" />
    </div>
    <div class="rows__list">
      <StoryblokComponent
        v-for="(item, i) in items"
        :key="item._uid"
        :blok="item"
        :side="sideOf(i)"
        :tone="blok.headline_tone === 'accent' ? 'accent' : 'default'"
      />
    </div>
  </section>
</template>

<style scoped>
.rows {
  --connector-len: calc(3.47 * var(--sx));                               /* 50 */
  padding: calc(7.29 * var(--sx)) 0 calc(15.28 * var(--sx));            /* 105 / 220 */
  overflow: hidden;
}
.rows__head { margin-bottom: calc(7.5 * var(--sx)); }
.rows__list { display: grid; gap: calc(16.67 * var(--sx)); }             /* 240 */

@media (max-width: 720px) {
  .rows { --connector-len: 40px; padding: 59px 0 180px; }
  .rows__list { gap: 48px; }
}
</style>
