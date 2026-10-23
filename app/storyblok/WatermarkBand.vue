<script setup lang="ts">
// Clinical Applications "Pediatric applications" (Figma 4640-5804): oversized
// pale Lora words, centred, over white fading into brand blue towards the band
// below. The words are decoration; the band that follows carries the heading.
const props = defineProps<{ blok: any }>()

// Spacing overrides. The editor types px as drawn at 1440, so the desktop pair
// scales with --sx; the _mobile pair is raw px at 390 and does not. Empty
// fields have to come back as undefined, never null: Vue's style binding takes
// string | number | undefined only, and each fallback below is the value the
// band already drew.
const n = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : Number(v))
const sx = (v: unknown) => { const x = n(v); return x === undefined ? undefined : `calc(${x} / 14.4 * var(--sx))` }
const px = (v: unknown) => { const x = n(v); return x === undefined ? undefined : `${x}px` }
// The wash runs past this band and dies out behind the section below, so that
// section has to repaint it offset by exactly this band's height. base.css can
// only assume a height, and it assumes the two lines English wraps to: German
// takes three, which left its phone band 82px taller than the offset and drew a
// step across the seam. The band is the only thing that knows its own height,
// and the sibling is the only place the value is read, so it is written there.
const band = ref<HTMLElement>()
onMounted(() => {
  const el = band.value
  if (!el || (props.blok.backdrop || 'fade-to-brand') !== 'fade-to-grey') return
  const next = el.nextElementSibling as HTMLElement | null
  if (!next) return
  const sync = () => next.style.setProperty('--wash-band-h', `${el.getBoundingClientRect().height}px`)
  const ro = new ResizeObserver(sync)
  ro.observe(el)
  onBeforeUnmount(() => { ro.disconnect(); next.style.removeProperty('--wash-band-h') })
})

const spacing = computed(() => ({
  '--wm-top': sx(props.blok.space_top),
  '--wm-bottom': sx(props.blok.space_bottom),
  '--wm-top-m': px(props.blok.space_top_mobile),
  '--wm-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': sx(props.blok.connector_length),
}))
</script>

<template>
  <section
    ref="band"
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section wmband"
    :class="`wmband--${blok.backdrop || 'fade-to-brand'}`"
    :data-theme="blok.theme || 'light'"
    :style="spacing"
  >
    <SectionConnector :connector="blok.connector" />
    <p class="wmband__word display-word" :style="{ '--wm-chars': String((blok.word || '').length) }" aria-hidden="true">{{ blok.word }}</p>
  </section>
</template>

<style scoped>
.wmband {
  padding: var(--wm-top, calc(40.65 * var(--sx))) 0 var(--wm-bottom, calc(5.19 * var(--sx)));   /* 585 to the words / 75 */
  overflow: hidden;
}
/* The tilted brand wash lives in base.css, beside the grey one. */
/* The tilted wash and its continuation into the next section live in base.css,
   because they have to be painted on a sibling this component cannot reach. */
/* 252px Lora on a 252px line, white at 50%, each line centred on the page even
   where it runs wider than the screen. */
.wmband__word {
  width: max-content;
  margin: 0 0 0 50%;
  translate: -50% 0;
  /* Sized to the word as well as the viewport, so a longer translation is
     cut in the same proportion the English is rather than vanishing. */
  font-size: min(calc(17.5 * var(--sx)), calc(252vw / var(--wm-chars, 12) * 0.0694 * 12));
  line-height: 1;
  text-align: center;
  white-space: pre-line;
  color: rgb(255 255 255 / 50%);
  user-select: none;
}

/* Phones: 62px words wrapped to the screen, 36px above the band below. */
@media (max-width: 720px) {
  .wmband { padding: var(--wm-top-m, 194px) 0 var(--wm-bottom-m, 36px); }
  /* The wash itself is in base.css: one measured ramp serves every width, and
     --wash-band-h there has to keep matching the height this block sets. */

  .wmband__word { width: auto; margin: 0; translate: none; font-size: min(15.9vw, calc(191vw / var(--wm-chars, 12))); white-space: normal; }

  /* Key figures is the only band in the space that fades to grey, and the phone
     frame sets its word half again as large, so it breaks over two lines of its
     own accord. Waitak: "could you adjust the font bigger so it stacks under
     each other". Measured off clinical-application-mobile y6123-y6329: "figures"
     is 265 ink wide of the 390 frame, the ascender 62 above the baseline and
     82 between the two baselines, which is 81.7px Lora on a 1 line-height. The
     167 above its ink is the frame's too, and leaves 159 of padding. */
  .wmband--fade-to-grey { --wm-top-m: 159px; }
  .wmband--fade-to-grey .wmband__word { font-size: min(20.95vw, calc(251vw / var(--wm-chars, 12))); }
}
</style>
