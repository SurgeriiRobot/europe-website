<script setup lang="ts">
// The banner the three legal pages open with (Figma privacy-policy /
// legal-notice / cookie-policy desktop, y 0-339): no photograph and no tint.
// The white page carries on under the header, with the page title set flush to
// the 75px gutter in Inter 600 48/58. Its baseline sits at y=273 in the design,
// which is 150px under the 80px header; the long-form text that follows starts
// 54px below the title's line box, so the banner itself has no bottom padding.
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
    class="pbanner"
    :data-theme="blok.theme || 'light'"
    :style="spacing"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="pbanner__inner">
      <h1 class="pbanner__title"><BrandText :text="blok.headline" /></h1>
      <p v-if="blok.intro" class="pbanner__intro"><BrandText :text="blok.intro" :nowrap="false" /></p>
    </div>
  </section>
</template>

<style scoped>
.pbanner {
  position: relative;
  background: var(--surface);
  color: var(--ink);
  padding-top: calc(var(--sp-top, 150) / 14.4 * var(--sx));
  padding-bottom: calc(var(--sp-bottom, 0) / 14.4 * var(--sx));
}
.pbanner__inner {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--gutter-design);
}
.pbanner__title {
  margin: 0;
  font-size: clamp(2rem, 3.334vw, 3rem);   /* 48 */
  font-weight: 600;
  line-height: 1.2083;                     /* 58/48 */
  color: inherit;
}
/* Optional standfirst. The design draws none, so it only appears when an
   editor fills it (a "last updated" line, say). */
.pbanner__intro {
  max-width: 900px;
  margin: 24px 0 0;
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;
  white-space: pre-line;
}

/* No phone frame was drawn for these pages, so the banner follows the
   convention the built pages already use: the 16px gutter, a 34/41 title, and
   80px of air under the 64px header. */
@media (max-width: 720px) {
  .pbanner {
    padding-top: calc(var(--sp-top-m, 80) * 1px);
    padding-bottom: calc(var(--sp-bottom-m, 0) * 1px);
  }
  .pbanner__title { font-size: clamp(1.75rem, 8.72vw, 2.125rem); line-height: 1.206; }
  .pbanner__intro { margin-top: 16px; font-size: 1rem; line-height: 1.625; }
}
</style>
