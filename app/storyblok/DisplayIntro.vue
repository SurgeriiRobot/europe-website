<script setup lang="ts">
// Clinical Evidence "Clinical data & outcomes" (clinical-evidence-desktop,
// 800-1222): a 72/86 centred title with a hairline from each page edge level
// with its middle, a short 18/29 paragraph 46px below it, and a lead line that
// is drawn *under* the section — the design leaves 21px of white between the
// section's foot and the start of the line, which a connector inside the box
// cannot express.
const props = defineProps<{ blok: any }>()

// Style bindings reject null, so an unset number has to come back undefined.
const px = (v: unknown) => (Number(v) > 0 ? `${Number(v)}px` : undefined)
const style = computed(() => ({
  '--di-measure': px(props.blok.measure),
  '--di-top': px(props.blok.space_top),
  '--di-bottom': px(props.blok.space_bottom),
  '--di-top-m': px(props.blok.space_top_mobile),
  '--di-bottom-m': px(props.blok.space_bottom_mobile),
  '--di-lead': px(props.blok.connector_length),
  '--di-lead-gap': px(props.blok.lead_gap),
}))
const lead = computed(() => props.blok.connector === 'bottom' || props.blok.connector === 'both')
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section dintro"
    :class="{ 'dintro--lines': blok.title_lines !== false }"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector === 'bottom' ? 'none' : blok.connector" />
    <div class="container dintro__inner">
      <h2 class="dintro__title">
        <BrandText :text="blok.headline" />
        <template v-if="blok.title_lines !== false">
          <span class="dintro__rule dintro__rule--left" aria-hidden="true" />
          <span class="dintro__rule dintro__rule--right" aria-hidden="true" />
        </template>
      </h2>
      <p v-if="blok.body" class="dintro__body"><BrandText :text="blok.body" :nowrap="false" /></p>
    </div>
    <span v-if="lead" class="dintro__lead" aria-hidden="true" />
  </section>
</template>

<style scoped>
.dintro {
  padding-top: var(--di-top, calc(7.99 * var(--sx)));                       /* 115 */
  padding-bottom: var(--di-bottom, calc(4.67 * var(--sx)));                 /* 67 */
}
.dintro__inner { display: grid; justify-items: center; text-align: center; }
.dintro__title {
  position: relative;
  width: 100%;
  margin: 0;
  font-size: clamp(2.75rem, 5vw, 4.5rem);                                   /* 72 */
  font-weight: 600;
  line-height: 1.1944;                                                      /* 86/72 */
  color: var(--ink);
  white-space: pre-line;
}
/* 0 -> 157 at 1440, level with the title's middle — the measure the design uses
   for every title above 48px. */
.dintro__rule {
  position: absolute;
  top: 50%;
  width: calc(50vw - 563px);
  border-top: var(--line-w) solid var(--line);
}
.dintro__rule--left { left: calc(50% - 50vw); }
.dintro__rule--right { right: calc(50% - 50vw); }
@media (max-width: 1180px) { .dintro__rule { display: none; } }

.dintro__body {
  max-width: var(--di-measure, 465px);
  margin: calc(2.9 * var(--sx)) 0 0;                                        /* 41.8 */
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;                                                      /* 29/18 */
  color: var(--ink-muted);
  white-space: pre-line;
}

/* The lead line into the next section, drawn below this one's box. */
.dintro__lead {
  position: absolute;
  left: 50%;
  top: 100%;
  height: var(--di-lead, calc(6.94 * var(--sx)));                           /* 100 */
  margin-top: var(--di-lead-gap, 0px);
  border-left: var(--line-w) solid var(--line);
  pointer-events: none;
}

/* Phones follow the 72px titles elsewhere on the site: 42/50, with the body on
   the full gutter-to-gutter measure. */
@media (max-width: 720px) {
  .dintro { padding-top: var(--di-top-m, 96px); padding-bottom: var(--di-bottom-m, 40px); }
  .dintro__title { font-size: clamp(2.25rem, 10.77vw, 2.625rem); line-height: 1.1905; }
  .dintro__body { max-width: none; margin-top: 32px; }
  .dintro__lead { height: 80px; }
}
</style>
