<script setup lang="ts">
// Figma 991:18680-82: 200px lead-in, title with hairlines, then a 2x408px grid
// (30px apart) — values in Lora 600 96/115 blue, labels Inter 600 24/29 — and a
// centred button 80px below.
const props = defineProps<{ blok: any }>()
const columns = computed(() => Number(props.blok.columns) || 2)

// Spacing overrides. The editor types px as drawn at 1440, so the desktop pair
// scales with --sx; the _mobile pair is raw px at 390 and does not. Empty
// fields have to come back as undefined, never null: Vue's style binding takes
// string | number | undefined only, and each fallback below is the spacing the
// band already drew.
const n = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : Number(v))
const sx = (v: unknown) => { const x = n(v); return x === undefined ? undefined : `calc(${x} / 14.4 * var(--sx))` }
const px = (v: unknown) => { const x = n(v); return x === undefined ? undefined : `${x}px` }
const style = computed(() => ({
  ...(props.blok.title_size === 'large'
    // The hairline inset the other large-heading bands already carry. Without
    // it the band kept the 48px default, and on Contact the rules ran right up
    // against the "W" and the "?" of "Why connect with SHURUI?". The design
    // stops them at x157 and x1285 against ink at 241 and 1198.
    ? { '--sec-title-size': 'clamp(2.5rem, 5vw, 4.5rem)', '--sec-title-measure': 'calc(68 * var(--sx))', '--sec-title-line-inset': 'calc(39.1 * var(--sx))' }
    : {}),
  '--stats-top': sx(props.blok.space_top),
  '--stats-bottom': sx(props.blok.space_bottom),
  '--stats-top-m': px(props.blok.space_top_mobile),
  '--stats-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': sx(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section stats"
    :class="{ 'stats--inline': blok.figures === 'inline', 'stats--large-title': blok.title_size === 'large' }"
    :data-theme="blok.theme || 'light'"
    :style="style"
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
          // Contact draws its figures at 64px in the surface's own ink and sets
          // them straight under the intro: no icon rhythm above them (Contact
          // 1122 to 1205 is the whole gap, carried here rather than in the cell)
          // and 26px down to the labels, which puts the label ink at 1313 under
          // figure ink that ends at 1274.
          ...(blok.figures === 'inline'
            ? {
                '--stat-size': 'clamp(2.5rem, 4.44vw, 4rem)',
                '--stat-ink': 'var(--ink)',
                '--stat-margin': '0px',
                '--stat-gap': 'calc(1.795 * var(--sx))',
                '--stats-gap': 'calc(5.74 * var(--sx))',
              }
            : {}),
        }"
      >
        <StoryblokComponent v-for="item in blok.items || []" :key="item._uid" :blok="item" />
      </div>
      <!-- A closing line between the figures and the button. The field existed
           and carried copy, but nothing rendered it. -->
      <p v-if="blok.outro" class="stats__outro">{{ blok.outro }}</p>
      <div v-if="blok.buttons?.length" class="stats__actions">
        <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats {
  --connector-len: max(30px, calc(3.47 * var(--sx)));                                        /* 50px each side */
  padding: var(--stats-top, clamp(96px, 13.9vw, 200px)) 0 var(--stats-bottom, clamp(96px, 13.9vw, 200px));
}
.stats__inner { display: grid; justify-items: center; }
.stats__grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 2), minmax(0, 408px));
  gap: var(--stats-rowgap, clamp(56px, 8.3vw, 120px)) 30px;
  margin-top: var(--stats-gap, clamp(48px, 7.4vw, 106px));
}
/* Clinical Applications 8240-8500: the closing title sits 231px under the last
   row of labels, which is far more air than the band gives its own title. */
.stats__outro {
  margin: calc(16.15 * var(--sx)) auto 0;                                     /* 232.6 */
  max-width: calc(49.3 * var(--sx));
  font-size: clamp(2rem, 3.33vw, 3rem);
  font-weight: 600;
  line-height: 1.2083;
  white-space: pre-line;
  text-align: center;
  color: var(--ink);
}
/* A 72px heading stands further off its intro than the 48px one the shared
   title draws: Contact 1003 to 1035. The intro keeps the 630 measure the
   default title uses, which the widened box would otherwise give away, and
   which is what sets its three lines. */
.stats--large-title :deep(.sec-title) { gap: calc(2.22 * var(--sx)); }                 /* 32 */
.stats--large-title :deep(.sec-title__p) { max-width: calc(43.75 * var(--sx)); }       /* 630 */

/* Contact 1212-1266: the CE mark is drawn at the size of a figure, on the
   figures' own line, not on a line of its own above them. Stat puts an icon in
   a row before the value, so here the icon shares the value's cell and the row
   keeps the figure's height; the cell packs from the top so a two-line label
   cannot push the other columns' figures down with it. */
.stats--inline :deep(.stat) { align-content: start; }
.stats--inline :deep(.stat__icon) {
  grid-area: 1 / 1;
  align-self: center;
  height: calc(3.82 * var(--sx));                                                      /* 55 */
  width: auto;
}
.stats--inline :deep(.stat__value) { grid-area: 1 / 1; }
.stats--inline :deep(.stat__label) { grid-area: 2 / 1; }

.stats__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; margin-top: 48px; }
/* A closing title already carries the air above it, so the design sets the
   button 23px under it (8617 to 8641) rather than the usual 48. */
.stats__outro + .stats__actions { margin-top: calc(1.625 * var(--sx)); }      /* 23.4 */
@media (max-width: 640px) { .stats__grid { grid-template-columns: minmax(0, 1fr); } }
/* Phone design: title 116px down, 20px to the intro, one column of figures on a
   321px pitch, the button 72px below them — and the lead line into the next
   section drawn here, above its photo (desktop draws it inside the photo). */
@media (max-width: 720px) {
  .stats { --connector-len: 40px; padding: var(--stats-top-m, 116px) 0 var(--stats-bottom-m, 140px); }
  .stats :deep(.sec-title) { gap: 20px; }
  .stats__grid { gap: 156px; margin-top: 91px; }
  /* No phone frame is drawn for the Contact band, so its intro keeps the whole
     title measure there and the CE mark the 80px crop it is served at, which is
     the same share of the 96px phone figure as 55 is of the 64px desktop one. */
  .stats--large-title :deep(.sec-title__p) { max-width: none; }
  .stats--inline :deep(.stat__icon) { height: 80px; }
  /* Waitak: "could we have more spacing between the last data set and the
     header 'clinical outcomes....'. Right now it's quite tight." The phone frame
     agrees and the gap was not the only thing wrong with it: the closing title
     is drawn at 48px there, where the shared clamp bottoms out at 32, and the
     710px measure the desktop gives it scales down to 192 at 390, which broke
     the four lines the frame sets into six narrow ones. At 48px on the
     container's own width it breaks where the frame breaks, "and supporting"
     on one line at 353 against the frame's 348. Below it the frame leaves 36 to
     the button (y8054 to y8090), which the line's own descent already covers.

     Above it the frame leaves 179 (y7664 to y7843) against the 31 this had, but
     that is one stat row's own rhythm to the digit (178.5 on the phone frame,
     237.5 against 241 on the desktop one), so at the frame's figure the title
     still reads as another row of the list rather than the block that closes
     it. Half a row again, 268, is the first spacing that separates it. */
  .stats__outro { margin-top: 258px; max-width: none; font-size: 48px; }
  .stats__actions { margin-top: 72px; }
  /* Waitak: "the button is too close to the header". The frame's 36 was drawn
     under a 32px title; under the 48px one it reads tight, so the button takes
     the space the bigger title asks for. */
  .stats__outro + .stats__actions { margin-top: 32px; }
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
