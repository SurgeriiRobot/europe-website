<script setup lang="ts">
// Figma 991:18680-82: 200px lead-in, title with hairlines, then a 2x408px grid
// (30px apart) — values in Lora 600 96/115 blue, labels Inter 600 24/29 — and a
// centred button 80px below.
const props = defineProps<{ blok: any }>()
const columns = computed(() => Number(props.blok.columns) || 2)
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section stats"
    :data-theme="blok.theme || 'light'"
    :style="blok.title_size === 'large'
      ? { '--sec-title-size': 'clamp(2.5rem, 5vw, 4.5rem)', '--sec-title-measure': 'calc(68 * var(--sx))' }
      : undefined"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="container stats__inner">
      <SectionTitle :headline="blok.headline" :body="blok.intro" :lines="blok.title_lines" />
      <div
        class="stats__grid"
        :style="{
          '--cols': columns,
          // Compact draws the title closer to the grid, and carries the row
          // rhythm in the gap rather than in a margin above each figure, since
          // these figures have no icon to clear.
          ...(blok.spacing === 'compact'
            ? { '--stats-gap': 'clamp(32px, 4.3vw, 62px)', '--stats-rowgap': 'clamp(110px, 16.04vw, 231px)', '--stat-margin': '0px' }
            : {}),
          // Contact draws its figures at 64px in the surface's own ink, 100px
          // above their labels, rather than the 96px blue the home band uses.
          ...(blok.figures === 'inline'
            ? {
                '--stat-size': 'clamp(2.5rem, 4.44vw, 4rem)',
                '--stat-ink': 'var(--ink)',
                '--stat-gap': 'clamp(28px, 3.68vw, 53px)',
              }
            : {}),
        }"
      >
        <StoryblokComponent v-for="item in blok.items || []" :key="item._uid" :blok="item" />
      </div>
      <div v-if="blok.buttons?.length" class="stats__actions">
        <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats { --connector-len: max(30px, calc(3.47 * var(--sx))); padding: clamp(96px, 13.9vw, 200px) 0 clamp(96px, 13.9vw, 200px); }   /* 50px each side */
.stats__inner { display: grid; justify-items: center; }
.stats__grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 2), minmax(0, 408px));
  gap: var(--stats-rowgap, clamp(56px, 8.3vw, 120px)) 30px;
  margin-top: var(--stats-gap, clamp(48px, 7.4vw, 106px));
}
.stats__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; margin-top: 80px; }
@media (max-width: 640px) { .stats__grid { grid-template-columns: minmax(0, 1fr); } }
/* Phone design: title 116px down, 20px to the intro, one column of figures on a
   321px pitch, the button 72px below them — and the lead line into the next
   section drawn here, above its photo (desktop draws it inside the photo). */
@media (max-width: 720px) {
  .stats { --connector-len: 40px; padding: 116px 0 140px; }
  .stats :deep(.sec-title) { gap: 20px; }
  .stats__grid { gap: 156px; margin-top: 91px; }
  .stats__actions { margin-top: 72px; }
  .stats::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    height: 40px;
    border-left: var(--line-w) solid var(--line);
  }
}
</style>
