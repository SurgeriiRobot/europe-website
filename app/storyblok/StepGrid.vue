<script setup lang="ts">
// Training and proctoring, "Supporting every stage of the learning curve"
// (training-and-proctoring-desktop 800-2340).
//
// One module: a 72/86 centred title with a hairline running in from each page
// edge level with its first line, a 16/26 intro, a 100px rule on the centre
// axis, and then three steps in 335px columns 32px apart. Each step is a 48/58
// blue word over a 335x366 tile in #f5f5f5 carrying its line drawing.
//
// No phone frame is drawn for this page, so the steps stack at the 16px gutter
// and follow the built pages: a 42/50 title, 18/29 copy and an 80px rule.
const props = defineProps<{ blok: any }>()
const items = computed<any[]>(() => props.blok.items || [])
// Drawn by default: the design joins the intro to the steps with it.
const divider = computed(() => props.blok.divider !== false)

// undefined, not null: Vue's style binding accepts string | number | undefined.
const px = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : `${Number(v)}px`)
const style = computed(() => ({
  '--steps-top': px(props.blok.space_top),
  '--steps-bottom': px(props.blok.space_bottom),
  '--steps-top-m': px(props.blok.space_top_mobile),
  '--steps-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section steps"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="container">
      <SectionTitle :headline="blok.headline" :body="blok.body" :lines="blok.title_lines" />
    </div>
    <span v-if="divider" class="steps__divider" aria-hidden="true" />
    <ul v-if="items.length" class="steps__grid">
      <StoryblokComponent v-for="item in items" :key="item._uid" :blok="item" />
    </ul>
  </section>
</template>

<style scoped>
.steps {
  --connector-len: calc(6.94 * var(--sx));                                    /* 100 */
  padding: var(--steps-top, calc(7.99 * var(--sx))) 0 var(--steps-bottom, calc(11.74 * var(--sx)));   /* 115 to the title ink / 169 */
}

/* The title is set 72/86 over a 16/26 intro, 51px apart, and the hairlines stop
   157px in from each page edge (the 830px title box leaves 305px of margin, and
   the design holds the line 148px off it). */
.steps :deep(.sec-title) { gap: calc(3.06 * var(--sx)); max-width: 830px; }   /* 44: the design's 51 between the boxes, measured from the ink */
.steps :deep(.sec-title__h) { font-size: clamp(2.75rem, 5vw, 4.5rem); line-height: 1.1944; }   /* 72/86 */
.steps :deep(.sec-title__p) { max-width: 460px; font-size: 1rem; line-height: 1.625; }         /* 16/26 */
.steps :deep(.sec-title--lines .sec-title__h::before),
.steps :deep(.sec-title--lines .sec-title__h::after) { top: 0.588em; width: max(0px, calc(50vw - 563px)); }

.steps__divider {
  display: block;
  width: 0;
  height: calc(6.94 * var(--sx));                                             /* 100 */
  margin: calc(8.19 * var(--sx)) auto 0;                                      /* 118 under the intro */
  border-left: var(--line-w) solid var(--line);
}

.steps__grid {
  display: grid;
  grid-template-columns: repeat(3, calc(23.26 * var(--sx)));                  /* 335 */
  justify-content: center;
  align-items: start;
  gap: calc(2.22 * var(--sx));                                                /* 32 */
  margin: calc(6.53 * var(--sx)) 0 0;                                         /* 94 under the rule */
  padding: 0;
  list-style: none;
}

@media (max-width: 720px) {
  .steps { --connector-len: 80px; padding: var(--steps-top-m, 72px) 0 var(--steps-bottom-m, 110px); }
  .steps :deep(.sec-title) { gap: 24px; }
  .steps :deep(.sec-title__h) { font-size: clamp(2.25rem, 10.77vw, 2.625rem); line-height: 1.1905; }   /* 42/50 */
  .steps :deep(.sec-title__p) { max-width: 352px; font-size: 1.125rem; line-height: 1.6111; }
  .steps__divider { height: 80px; margin-top: 64px; }
  .steps__grid {
    grid-template-columns: minmax(0, 358px);
    justify-content: center;
    gap: 60px;
    margin-top: 56px;
    padding-inline: 16px;
  }
}
</style>
