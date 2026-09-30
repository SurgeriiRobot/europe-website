<script setup lang="ts">
// Long-form legal copy (Figma privacy-policy / legal-notice / cookie-policy
// desktop, y 339 to the footer). The whole document is one 18/29 Inter Light
// flow on the full 1290px measure between the 75px gutters, with nothing
// between paragraphs: the design separates blocks with blank lines typed into
// the text, not with paragraph spacing, so every paragraph sits on the same
// 29px rhythm and an empty paragraph is exactly one line tall.
//
// Numbered section titles are Inter 600 34/41 and carry no margin either.
// Stacked in the same flow, a 34/41 line lands 40px under the body baseline
// above it and 30px over the one below, which is what the design measures.
const props = defineProps<{ blok: any }>()

// Spacing overrides are written as px at the 1440 design width (and at 390 on
// phones), so the desktop ones scale with --sx and the phone ones do not.
const spacing = computed(() => {
  const b = props.blok
  const s: Record<string, string> = {}
  if (b.space_top) s['--sp-top'] = String(Number(b.space_top))
  if (b.space_bottom) s['--sp-bottom'] = String(Number(b.space_bottom))
  if (b.space_top_mobile) s['--sp-top-m'] = String(Number(b.space_top_mobile))
  if (b.space_bottom_mobile) s['--sp-bottom-m'] = String(Number(b.space_bottom_mobile))
  if (b.connector_length) s['--connector-len'] = `${Number(b.connector_length)}px`
  return s
})
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="legal"
    :data-theme="blok.theme || 'light'"
    :style="spacing"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="legal__inner" :class="blok.width === 'narrow' ? 'legal__inner--narrow' : ''">
      <div class="legal__body">
        <StoryblokRichText :document="blok.body" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.legal {
  position: relative;
  background: var(--surface);
  color: var(--ink);
  padding-top: calc(var(--sp-top, 54) / 14.4 * var(--sx));
  padding-bottom: calc(var(--sp-bottom, 180) / 14.4 * var(--sx));
}
.legal__inner {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--gutter-design);
}
.legal__body {
  font-size: 1.125rem;                 /* 18 */
  font-weight: 300;
  line-height: 1.6111;                 /* 29/18 */
  /* The wraps are measured against Figma's, so the greedy line breaker is
     asked for by name rather than left to the browser's default. */
  text-wrap: wrap;
  /* The design's measure is the full 1290px between the gutters, but Figma's
     build of Inter Light runs about 0.7% wider than the webfont Google serves,
     so the same words reach the edge some 9px sooner there. Measured in our own
     metrics that 1290 is 1281, and holding the column there is what reproduces
     Figma's line breaks across all three pages (scanned 1276-1290, a px at a
     time, against the design's own line ends). The column is ragged right, so
     the narrower measure moves nothing visible. */
  max-width: 1281px;
}
/* The narrow option, for a short notice rather than a whole policy. */
.legal__inner--narrow .legal__body { max-width: var(--container-narrow); }

/* No paragraph spacing anywhere: the document's own blank lines do that work,
   and an empty paragraph has to hold a line's height on its own. */
.legal__body :deep(p) { margin: 0; }
.legal__body :deep(p:empty) { height: 1.6111em; }

.legal__body :deep(h2) {
  margin: 0;
  font-size: clamp(1.5rem, 2.4vw, 2.125rem);   /* 34 */
  font-weight: 600;
  line-height: 1.2059;                          /* 41/34 */
  color: inherit;
}
/* Sub-heads (3.1, 3.2 …) are body size in the design, only heavier. */
.legal__body :deep(h3) {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.6111;
  color: inherit;
}
.legal__body :deep(strong), .legal__body :deep(b) { font-weight: 600; }

.legal__body :deep(ul), .legal__body :deep(ol) { margin: 0; padding-inline-start: 1.25rem; }
.legal__body :deep(li) { margin: 0; }
.legal__body :deep(table) { width: 100%; margin: 29px 0; border-collapse: collapse; }
.legal__body :deep(td), .legal__body :deep(th) {
  padding: 8px 12px;
  border: 1px solid var(--border);
  text-align: start;
  vertical-align: top;
}
.legal__body :deep(th) { font-weight: 600; }
.legal__body :deep(a) { color: inherit; }

/* No phone frame was drawn for these pages: they follow the convention the
   built pages already use: the 16px gutter, 16/26 body, and the 34px section
   titles stepped down to 24/29 so they still fit the 358px measure. */
@media (max-width: 720px) {
  .legal {
    padding-top: calc(var(--sp-top-m, 32) * 1px);
    padding-bottom: calc(var(--sp-bottom-m, 96) * 1px);
  }
  .legal__body { font-size: 1rem; line-height: 1.625; }   /* 16/26 */
  .legal__body :deep(p:empty) { height: 1.625em; }
  .legal__body :deep(h2) { font-size: 1.5rem; line-height: 1.2083; }   /* 24/29 */
  .legal__body :deep(h3) { font-size: 1rem; line-height: 1.625; }
  .legal__body :deep(table) { margin: 26px 0; }
}
</style>
