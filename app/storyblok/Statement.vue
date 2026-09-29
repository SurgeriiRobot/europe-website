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
      'statement--bracket': bracket,
      'statement--bracket-left': bracketLeft,
      'statement--wide': blok.width === 'wide',
    }"
    :data-theme="blok.theme || 'light'"
  >
    <SectionConnector :connector="blok.connector" />
    <p v-if="watermarkAbove" class="statement__watermark statement__watermark--above display-word" aria-hidden="true">{{ blok.watermark }}</p>
    <div class="container statement__inner">
      <SectionTitle :headline="blok.headline" :body="blok.body" :lines="blok.title_lines" />
      <span v-if="bracket" class="statement__bracket" aria-hidden="true" />
      <div v-if="blok.buttons?.length" class="statement__actions">
        <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
      </div>
    </div>
    <p v-if="blok.watermark && !watermarkAbove" class="statement__watermark display-word" aria-hidden="true">{{ blok.watermark }}</p>
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
/* Figma's band runs 3711-4721: 463px sit below the button. */
.statement--watermarked { padding-bottom: clamp(220px, calc(32.15 * var(--sx)), 463px); }

.statement__inner { position: relative; z-index: 1; display: grid; justify-items: center; gap: 24px; }
.statement--dark .statement__inner { gap: 48px; }
.statement :deep(.sec-title) { max-width: 632px; }
/* SP Robot's "Single-Port Surgical System" copy: the only measure at which the
   browser breaks both paragraphs where Figma does is 650.2-652.7px. */
.statement--wide :deep(.sec-title) { max-width: 651.5px; }
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
  font-size: calc(17.5 * var(--sx));               /* 252/1440 */
  color: #f4f4f4;
  opacity: 0.375;
  pointer-events: none;
  user-select: none;
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
.statement--wm-above { --connector-len: calc(6.94 * var(--sx)); padding: calc(15.49 * var(--sx)) 0 0; }   /* 100 line; 223 to the words; the rows below set the gap */
.statement__watermark--above {
  position: relative;
  left: auto;
  bottom: auto;
  translate: none;
  margin: 0 0 calc(5.21 * var(--sx)) calc(-4.375 * var(--sx));                    /* 75 to the title */
  font-size: calc(17.5 * var(--sx));               /* 252/1440 */
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
  .statement { padding-block: 39px 28px; }
  .statement--wm-above { --connector-len: 80px; padding: 161px 0 0; }
  .statement--dark { padding-block: 30.36vw 20px; }                  /* 118 */
  .statement--watermarked { padding-bottom: 98.5vw; }                /* 384 */
  .statement__watermark {
    bottom: 20vw;                                                     /* 78 */
    width: 100%;
    font-size: 25.64vw;                                               /* 100px */
    line-height: 1;
    white-space: normal;
    text-align: center;
  }
  /* Titles may run to 7px from the edges ("Surgical System" at 48px is 375 wide). */
  .statement :deep(.sec-title__h) { width: calc(100% + 18px); margin-inline: -9px; }
  /* The wide statement's phone copy breaks where Figma does only at 351-354px. */
  .statement--wide :deep(.sec-title__p) { max-width: 352.5px; }
  /* Watermark above the title (SP Robot mobile 6854-7373): 82px Lora on an 82px
     line, both lines centred, the indent dropped. */
  .statement__watermark.statement__watermark--above {
    bottom: auto;
    width: auto;
    margin: 0 0 20px;
    font-size: 21vw;
    line-height: 1;
    white-space: pre-line;
    text-align: center;
  }
}
</style>
