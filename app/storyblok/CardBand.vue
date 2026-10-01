<script setup lang="ts">
// "Educational resources" (training-and-proctoring-desktop 4680-5908): the
// centred 48/58 title with a hairline in from each page edge, a 18/29 paragraph
// that carries a link ("the media page"), and then the three cards the rest of
// the site already uses, 335px wide and 32px apart, each with its outlined
// button.
//
// It differs from `card_grid` only in carrying that paragraph, so the cards
// themselves stay `grid_card`s and are drawn by the same component.
const props = defineProps<{ blok: any }>()
const items = computed<any[]>(() => props.blok.items || [])
const hasBody = computed(() => Boolean(props.blok.body?.content?.length))

// undefined, not null: Vue's style binding accepts string | number | undefined.
const px = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : `${Number(v)}px`)
const style = computed(() => ({
  '--band-top': px(props.blok.space_top),
  '--band-bottom': px(props.blok.space_bottom),
  '--band-top-m': px(props.blok.space_top_mobile),
  '--band-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section band"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="container">
      <SectionTitle :headline="blok.headline" :lines="blok.title_lines">
        <div v-if="hasBody" class="band__body">
          <StoryblokRichText :document="blok.body" />
        </div>
      </SectionTitle>
    </div>
    <div v-if="items.length" class="band__grid">
      <StoryblokComponent v-for="item in items" :key="item._uid" :blok="item" variant="link" />
    </div>
  </section>
</template>

<style scoped>
.band {
  overflow: hidden;
  padding: var(--band-top, calc(11.39 * var(--sx))) 0 var(--band-bottom, calc(16.67 * var(--sx)));   /* 164 to the title ink / 240 */
}
.band :deep(.sec-title) { gap: calc(1.5625 * var(--sx)); max-width: 630px; }  /* 22.5: the design's 29 between the boxes */
/* The hairlines stop 157px in from the page edges: 630px of title box leaves
   405px of margin, and the design holds the line 248px off it. */
.band :deep(.sec-title--lines .sec-title__h::before),
.band :deep(.sec-title--lines .sec-title__h::after) { top: 0.656em; width: max(0px, calc(50vw - 563px)); }

.band__body {
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;                                                        /* 29/18 */
  color: var(--ink-muted);
}
.band__body :deep(p) { margin: 0; }
.band__body :deep(a) { color: inherit; text-decoration: underline; text-underline-offset: 3px; }
.band__body :deep(a:hover) { color: var(--c-blue); }

.band__grid {
  display: grid;
  grid-template-columns: repeat(3, calc(23.26 * var(--sx)));                  /* 335 */
  justify-content: center;
  align-items: start;
  gap: calc(2.22 * var(--sx));                                                /* 32 */
  margin-top: calc(5.59 * var(--sx));                                         /* 80.5: the design's 77 off the paragraph's box */
}
/* The design sets this page's cards a little wider apart than the shared card
   defaults: 28px under the title, 20px to the button, which is 44px tall. */
.band__grid :deep(.gcard__body) { margin-top: calc(1.74 * var(--sx)); }
.band__grid :deep(.gcard__button) { margin-top: calc(1.67 * var(--sx)); padding-block: 8px; }   /* 24; the button is 44 tall */

@media (max-width: 720px) {
  .band { padding: var(--band-top-m, 72px) 0 var(--band-bottom-m, 96px); }
  .band :deep(.sec-title) { gap: 24px; }
  .band__grid {
    grid-template-columns: minmax(0, 358px);
    gap: 60px;
    margin-top: 56px;
    padding-inline: 16px;
  }
  .band__grid :deep(.gcard__body) { margin-top: 24px; }
  .band__grid :deep(.gcard__button) { margin-top: 24px; }
}
</style>
