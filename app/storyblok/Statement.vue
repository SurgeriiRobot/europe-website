<script setup lang="ts">
// Two uses in the design:
//  - light (991:18640): centred title with hairlines, body, primary button
//  - gradient (991:18644): white title on the deep gradient, sky button, and the
//    oversized "Key features" watermark in Lora at 37.5% opacity overhanging the edges.
//  - watermark above (SP Robot "Operating principle"): the oversized Lora word
//    set before the title, in pale blue on white, as written (line breaks and
//    leading spaces kept), overhanging both page edges.
// `title_bracket` (home, 991:18640): the right title hairline stops at x1281, drops
// 202px and runs off the page edge; `bracket_side: left` mirrors it (SP Robot).
const props = defineProps<{ blok: any }>()
const dark = computed(() => ['dark', 'brand', 'gradient'].includes(props.blok.theme))
const bracket = computed(() => Boolean(props.blok.title_lines && props.blok.title_bracket))
const bracketLeft = computed(() => bracket.value && props.blok.bracket_side === 'left')
const watermarkAbove = computed(() => Boolean(props.blok.watermark) && props.blok.watermark_position === 'above')
const watermarkCentred = computed(() => watermarkAbove.value && props.blok.watermark_align === 'center')

// undefined, not null: Vue's style binding accepts string | number | undefined.
const px = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : `${Number(v)}px`)
const sx = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : `calc(${(Number(v) / 14.4).toFixed(4)} * var(--sx))`)

// The above-title watermark is drawn at two sizes: 252px (SP Robot) and 180px
// (System Principles). Phones halve them to 82 and 62; `auto` follows desktop.
const medium = computed(() => props.blok.watermark_size === 'medium')
const mediumMobile = computed(() => {
  const m = props.blok.watermark_size_mobile
  return m === 'medium' || ((!m || m === 'auto') && medium.value)
})
const style = computed(() => ({
  '--st-top': px(props.blok.space_top),
  '--st-bottom': px(props.blok.space_bottom),
  '--st-top-m': px(props.blok.space_top_mobile),
  '--st-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
  '--sec-title-measure': sx(props.blok.title_measure),
  // vw, not --sx, for the same reason as the default below it: the watermark
  // bleeds off both edges and has to keep growing past the design width.
  '--wm-size': medium.value ? '12.5vw' : undefined,
  '--wm-size-m': mediumMobile.value ? '15.9vw' : undefined,
  '--wm-gap': sx(props.blok.watermark_gap),
  '--wm-gap-m': px(props.blok.watermark_gap_mobile),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section statement"
    :class="{
      'statement--dark': dark,
      'statement--watermarked': blok.watermark && !watermarkAbove,
      'statement--wm-above': watermarkAbove,
      'statement--wm-centred': watermarkCentred,
      'statement--bracket': bracket,
      'statement--bracket-left': bracketLeft,
      'statement--wide': blok.width === 'wide',
    }"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <p v-if="watermarkAbove" class="statement__watermark statement__watermark--above display-word" :style="{ '--wm-chars': String((blok.watermark || '').length) }" aria-hidden="true">{{ blok.watermark }}</p>
    <div class="container statement__inner">
      <SectionTitle :headline="blok.headline" :body="blok.body" :lines="blok.title_lines" />
      <span v-if="bracket" class="statement__bracket" aria-hidden="true" />
      <div v-if="blok.buttons?.length" class="statement__actions">
        <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
      </div>
    </div>
    <p v-if="blok.watermark && !watermarkAbove" class="statement__watermark display-word" :style="{ '--wm-chars': String((blok.watermark || '').length) }" aria-hidden="true">{{ blok.watermark }}</p>
    <template v-if="dark">
      <span class="statement__gutter statement__gutter--top" aria-hidden="true" />
      <span class="statement__gutter statement__gutter--bottom" aria-hidden="true" />
    </template>
  </section>
</template>

<style scoped>
.statement { padding-block: var(--st-top, 40px) var(--st-bottom, 80px); overflow: hidden; }
/* The deep gradient starts 110px above the copy in the design (it begins in the
   previous section's padding), so the top padding is 120 + 110. */
.statement--dark { padding-block: var(--st-top, 230px) var(--st-bottom, 120px); }
/* Figma's band runs 3711-4721: 463px sit below the button. */
.statement--watermarked { padding-bottom: var(--st-bottom, clamp(220px, calc(32.15 * var(--sx)), 463px)); }

.statement__inner { position: relative; z-index: 1; display: grid; justify-items: center; gap: 24px; }
.statement--dark .statement__inner { gap: 48px; }
.statement :deep(.sec-title) { max-width: var(--sec-title-measure, 632px); }
/* SP Robot's "Single-Port Surgical System" copy: the only measure at which the
   browser breaks both paragraphs where Figma does is 650.2-652.7px. */
.statement--wide :deep(.sec-title) { max-width: var(--sec-title-measure, 651.5px); }
.statement__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; }

/* White gutter line at x=75 with a tick out to the page edge, and a short
   closing segment at the bottom — Figma lines 38/39/43. */
.statement__gutter { position: absolute; left: var(--frame-gutter); border-left: var(--line-w) solid var(--line); pointer-events: none; }
.statement__gutter--top { top: 0; height: calc(33.4 * var(--sx)); }                 /* 481 */
.statement__gutter--top::before {
  content: ''; position: absolute; top: calc(3.96 * var(--sx)); right: 0; width: var(--gutter-design);   /* tick 0->75 at 57 */
  border-top: var(--line-w) solid var(--line);
}
.statement__gutter--bottom { bottom: calc(2.78 * var(--sx)); height: calc(4.86 * var(--sx)); }   /* 70, ending 40 above the edge */
@media (max-width: 720px) { .statement__gutter { display: none; } }

/* Figma: Lora 600 252/302, #f4f4f4 at 37.5% opacity, 192px above the band's bottom. */
.statement__watermark {
  position: absolute;
  left: 50%;
  bottom: clamp(60px, calc(13.33 * var(--sx)), 192px);
  margin: 0;
  translate: -50% 0;
  /* vw rather than --sx: see the --above variant below. The same bleed, and
     the same cap, which left Home's "Key features" 215px short of the right
     edge at 1920 instead of running off it. */
  /* The word is meant to be cut by both edges, but the size was fixed while
     the word was not: English "Key features" showed 97% of itself and the
     German, 26 characters of it, showed 43%. 210/chars lands on exactly
     17.5vw at the English length and eases off for anything longer. */
  font-size: min(17.5vw, calc(210vw / var(--wm-chars, 12)));
  color: #f4f4f4;
  opacity: 0.375;
  pointer-events: none;
  user-select: none;
}

/* `watermark_align: center` (Instruments Ecosystem, System Principles): the words
   are centred on the page axis and overhang both edges, in place of SP Robot's
   63px left indent. max-content keeps the block as wide as its longest line so
   each line can be centred inside it. */
/* On the grey (muted) ground the design darkens the words a step, to --c-blue-200
   at 50%: system-principles-desktop reads #b2c1f0 where the white pages read
   #e0e8ff. */
.statement[data-theme='muted'] .statement__watermark--above { color: rgb(131 162 255 / 50%); }

.statement--wm-centred .statement__watermark--above {
  width: max-content;
  margin-left: 50%;
  translate: -50% 0;
  text-align: center;
}

/* The right title hairline (1175-1281) turns down 202px, then runs to the page
   edge. Measured from the centre so it tracks the title like the hairlines do.
   Below ~1180px there is no room for the drop, so the plain hairline returns. */
@media (min-width: 1181px) {
  .statement--bracket :deep(.sec-title--lines .sec-title__h::after) { display: none; }
}
.statement__bracket {
  position: absolute;
  top: 0;
  left: calc(50% + 455px);
  width: 106px;
  height: 202px;
  margin-top: calc(0.6 * clamp(2rem, 3.33vw, 3rem));   /* level with the title hairlines */
  border-top: var(--line-w) solid var(--line);
  border-right: var(--line-w) solid var(--line);
  pointer-events: none;
}
.statement__bracket::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 100%;
  width: calc(50vw - 561px);
  border-top: var(--line-w) solid var(--line);
}
@media (max-width: 1180px) { .statement__bracket { display: none; } }

/* Mirrored bracket (SP Robot 2335-2538): the left hairline stops at x265, turns
   down at x155 for 202px, then runs off the left edge. */
@media (min-width: 1181px) {
  .statement--bracket-left :deep(.sec-title--lines .sec-title__h::after) { display: block; }
  .statement--bracket-left :deep(.sec-title--lines .sec-title__h::before) { display: none; }
}
.statement--bracket-left .statement__bracket {
  left: auto;
  right: calc(50% + 455px);
  width: 110px;
  border-right: 0;
  border-left: var(--line-w) solid var(--line);
}
.statement--bracket-left .statement__bracket::after { left: auto; right: 100%; width: calc(50vw - 565px); }

/* Watermark above the title (SP Robot 7665-8520): a 100px lead line, then the
   Lora words on a 252px line — line 1 starting 63px off the left edge — in
   #c1d1ff at 50%, and the title 72px under the second line's box. */
.statement--wm-above { --connector-len: calc(6.94 * var(--sx)); padding: var(--st-top, calc(15.49 * var(--sx))) 0 var(--st-bottom, 0px); }   /* 100 line; 223 to the words; the rows below set the gap */
.statement__watermark--above {
  position: relative;
  left: auto;
  bottom: auto;
  translate: none;
  /* The left indent scales with the type, not with --sx. Once the font kept
     growing past 1440 and this did not, the whole word slid right: the left
     overhang fell from 25% of the type to 19% by 1920 while the right grew to
     21%. Both edges are meant to be cut, in the design's proportions. */
  margin: 0 0 var(--wm-gap, calc(5.21 * var(--sx))) -4.375vw;     /* 63 at 1440; 75 to the title */
  /* vw rather than --sx, so it keeps growing past the design width. The
     watermark is a full-bleed device, meant to run off both edges; capped at
     1440 the type stopped growing while the viewport kept widening, and by
     1920 the second line stopped 442px short of the right edge instead of
     being cut by it. Waitak, SP Robot 9: "Can we have the principle part
     (light blue header) move a bit more right? As it should also be a bit cut
     off... this should auto adapt when change of screensize." At 1440 and
     below this renders exactly as before, since --sx is 1vw there. */
  font-size: var(--wm-size, 17.5vw);                   /* 252 at 1440, or 180 when medium */
  line-height: 1;
  white-space: pre;
  color: rgb(193 209 255 / 50%);
  opacity: 1;
}

/* Phone design (390 wide), placed last so it overrides the rules above: the light
   statement hands straight on to the next section's lead line; the gradient band
   opens 118px above its title and sets the watermark as two 100px lines, 78px
   off the bottom. Gaps stay the desktop 24 / 48. */
@media (max-width: 720px) {
  .statement { padding-block: var(--st-top-m, 39px) var(--st-bottom-m, 28px); }
  .statement--wm-above { --connector-len: 80px; padding: var(--st-top-m, 161px) 0 var(--st-bottom-m, 0px); }
  .statement--dark { padding-block: var(--st-top-m, 30.36vw) var(--st-bottom-m, 20px); }   /* 118 */
  .statement--watermarked { padding-bottom: var(--st-bottom-m, 98.5vw); }                  /* 384 */
  .statement__watermark {
    bottom: 20vw;                                                     /* 78 */
    width: 100%;
    font-size: min(25.64vw, calc(308vw / var(--wm-chars, 12)));        /* 100px at the English length */
    line-height: 1;
    white-space: normal;
    text-align: center;
  }
  /* Titles may run to 7px from the edges ("Surgical System" at 48px is 375 wide). */
  .statement :deep(.sec-title__h) { width: calc(100% + 18px); margin-inline: -9px; }
  /* `title_measure` is a desktop break point for the title; phones run it full width. */
  .statement :deep(.sec-title),
  .statement--wide :deep(.sec-title) { max-width: none; }
  /* The wide statement's phone copy breaks where Figma does only at 351-354px. */
  .statement--wide :deep(.sec-title__p) { max-width: 352.5px; }
  /* Watermark above the title (SP Robot mobile 6854-7373): 82px Lora on an 82px
     line, both lines centred, the indent dropped. */
  .statement__watermark.statement__watermark--above {
    bottom: auto;
    width: auto;
    margin: 0 0 var(--wm-gap-m, 20px);
    translate: none;                                 /* undo the centred desktop offset */
    font-size: var(--wm-size-m, 21vw);
    line-height: 1;
    white-space: pre-line;
    text-align: center;
  }
}
</style>
