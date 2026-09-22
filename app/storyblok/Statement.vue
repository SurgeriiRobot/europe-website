<script setup lang="ts">
// Two uses in the design:
//  - light (991:18640): centred title with hairlines, body, primary button
//  - gradient (991:18644): white title on the deep gradient, sky button, and the
//    oversized "Key features" watermark in Lora at 50% opacity overhanging the edges.
const props = defineProps<{ blok: any }>()
const dark = computed(() => ['dark', 'brand', 'gradient'].includes(props.blok.theme))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section statement"
    :class="{ 'statement--dark': dark, 'statement--watermarked': blok.watermark }"
    :data-theme="blok.theme || 'light'"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="container statement__inner">
      <SectionTitle :headline="blok.headline" :body="blok.body" :lines="blok.title_lines" />
      <div v-if="blok.buttons?.length" class="statement__actions">
        <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
      </div>
    </div>
    <p v-if="blok.watermark" class="statement__watermark display-word" aria-hidden="true">{{ blok.watermark }}</p>
    <template v-if="dark">
      <span class="statement__gutter statement__gutter--top" aria-hidden="true" />
      <span class="statement__gutter statement__gutter--bottom" aria-hidden="true" />
    </template>
  </section>
</template>

<style scoped>
.statement { padding-block: 40px 80px; overflow: hidden; }
/* The deep gradient starts 110px above the copy in the design (it begins in the
   previous section's padding), so the top padding is 120 + 110. */
.statement--dark { padding-block: 230px 120px; }
/* Figma's frame is a fixed 860px, not hug-contents: 423px sit below the button. */
.statement--watermarked { padding-bottom: clamp(220px, calc(29.4 * var(--sx)), 423px); }

.statement__inner { position: relative; z-index: 1; display: grid; justify-items: center; gap: 24px; }
.statement--dark .statement__inner { gap: 48px; }
.statement :deep(.sec-title) { max-width: 632px; }
.statement__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; }

/* White gutter line at x=75 with a tick out to the page edge, and a short
   closing segment at the bottom — Figma lines 38/39/43. */
.statement__gutter { position: absolute; left: var(--frame-gutter); border-left: var(--line-w) solid var(--line); pointer-events: none; }
.statement__gutter--top { top: 0; height: calc(33.4 * var(--sx)); }                 /* 481 */
.statement__gutter--top::before {
  content: ''; position: absolute; top: calc(3.96 * var(--sx)); right: 0; width: var(--gutter-design);   /* tick 0->75 at 57 */
  border-top: var(--line-w) solid var(--line);
}
.statement__gutter--bottom { bottom: 0; height: calc(4.86 * var(--sx)); }            /* 70 */
@media (max-width: 720px) { .statement__gutter { display: none; } }

/* Figma: Lora 600 252/302, #f5f5f5 at 50% opacity, 152px above the band's bottom. */
.statement__watermark {
  position: absolute;
  left: 50%;
  bottom: clamp(60px, calc(10.6 * var(--sx)), 152px);
  margin: 0;
  translate: -50% 0;
  font-size: calc(17.5 * var(--sx));               /* 252/1440 */
  color: var(--c-leather-200);
  opacity: 0.5;
  pointer-events: none;
  user-select: none;
}
</style>
