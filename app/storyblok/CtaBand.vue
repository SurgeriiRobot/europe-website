<script setup lang="ts">
// style "display" (Figma 991:18683): 810px photo under a 35% black wash, one
//   centred Lora 600 140/168 headline.
// style "standard" (Figma 991:18687): 700px photo under the Figma gradient (solid
//   #1f2739 to 20%, half at 44%, clear by 66%, all at 80% opacity), content at the
//   left gutter — Inter 600 34/41 headline 399 wide, body, button, 24px apart.
// style "inset" (SP Robot "Designed for clinical versatility", 10553-11353): the
//   standard look at 800px, the copy 186px in on a 280px measure.
// `tint`: a 14% brand-blue wash over the whole band (the SP Robot photo band).
const props = defineProps<{ blok: any }>()
const bg = computed(() => props.blok.background)
const display = computed(() => props.blok.style === 'display')
const inset = computed(() => props.blok.style === 'inset')
const bgH = computed(() => (display.value ? 810 : inset.value ? 800 : 700))
// Phones can take their own crop (the SP Robot band frames its photo taller there).
const bgMobile = computed(() => (props.blok.background_mobile?.filename ? props.blok.background_mobile : null))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section cta"
    :class="[display ? 'cta--display' : 'cta--standard', { 'cta--inset': inset, 'cta--tint': blok.tint }]"
    :data-theme="blok.theme || 'dark'"
  >
    <span v-if="display && (blok.connector === 'top' || blok.connector === 'both')" class="cta__lead" aria-hidden="true" />
    <SectionConnector v-else :connector="blok.connector" />
    <picture v-if="bg?.filename && bgMobile">
      <source media="(max-width: 720px)" :srcset="sbCrop(bgMobile, 780, 1600)">
      <img
        :src="sbCrop(bg, 2880, bgH * 2)"
        :srcset="`${sbCrop(bg, 1440, bgH)} 1440w, ${sbCrop(bg, 2880, bgH * 2)} 2880w`"
        sizes="100vw"
        :alt="bg.alt || ''"
        class="cta__bg"
        loading="lazy"
      >
    </picture>
    <img
      v-else-if="bg?.filename"
      :src="sbCrop(bg, 2880, bgH * 2)"
      :srcset="`${sbCrop(bg, 1440, bgH)} 1440w, ${sbCrop(bg, 2880, bgH * 2)} 2880w`"
      sizes="100vw"
      :alt="bg.alt || ''"
      class="cta__bg"
      loading="lazy"
    >

    <h2 v-if="display" class="cta__display display-word"><BrandText :text="blok.headline" /></h2>

    <div v-else class="cta__inner">
      <div class="cta__content">
        <h2 class="cta__headline"><BrandText :text="blok.headline" /></h2>
        <p v-if="blok.body" class="cta__body"><BrandText :text="blok.body" :nowrap="false" /></p>
        <div v-if="blok.buttons?.length" class="cta__actions">
          <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta { isolation: isolate; overflow: hidden; color: var(--c-white); }
.cta__bg { position: absolute; inset: 0; z-index: -2; width: 100%; height: 100%; object-fit: cover; }
.cta::after { content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none; }

.cta--display {
  display: grid;
  place-items: center;
  min-height: clamp(420px, 56.25vw, 810px);   /* 810/1440 */
  padding: 0 var(--gutter);
}
.cta--display::after { background: rgb(0 0 0 / 35%); }
.cta__lead { position: absolute; left: 50%; top: 66px; z-index: 1; height: 50px; border-left: var(--line-w) solid var(--c-blue); }
.cta__display {
  margin: 0;
  font-size: clamp(3rem, 9.72vw, 8.75rem);      /* 140px */
  line-height: 1.2;
  color: var(--c-white);
  white-space: normal;
  text-align: center;
}

.cta--standard { padding: 0; }
.cta--standard::after {
  background: linear-gradient(90deg, rgb(31 39 57 / 80%) 20.5%, rgb(31 39 57 / 50%) 44.2%, rgb(102 102 102 / 0) 66.4%);
}
.cta__inner {
  display: flex;
  align-items: center;
  max-width: var(--container);
  min-height: clamp(520px, 48.6vw, 700px);
  margin-inline: auto;
  padding: clamp(96px, 13.9vw, 200px) clamp(16px, 5.2vw, 75px);
}
.cta__content { display: grid; gap: 24px; }
/* The headline's lines are set by explicit breaks; only the body keeps the 399px column. */
.cta__body { max-width: 399px; }
/* Keeps editor line breaks: Figma sets this box to fit its lines with zero slack,
   so letting the browser re-wrap it would drop a word onto a fourth line. */
.cta__headline { margin: 0; font-size: clamp(1.625rem, 2.36vw, 2.125rem); font-weight: 600; line-height: 1.206; color: inherit; white-space: pre-line; }
.cta__body { margin: 0; font-size: 1.125rem; font-weight: 300; line-height: 1.6111; }
.cta__actions { display: flex; flex-wrap: wrap; gap: 16px; }

.cta--inset .cta__inner {
  min-height: clamp(560px, calc(55.56 * var(--sx)), 800px);                 /* 800 */
  padding-inline: calc(var(--frame-x) + 12.92 * var(--sx));               /* x186 */
  max-width: none;
}
.cta--inset .cta__body { max-width: 280px; }
.cta--tint::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background: rgb(7 68 253 / 14%);
  pointer-events: none;
}
.cta--tint .cta__inner { position: relative; z-index: 1; }

/* Phone design (390 wide): both bands are 800px tall. The display headline runs
   at 100px Lora over three lines; its lead line moves above the photo (drawn by
   the section before). The standard band sets its copy at the bottom-left on a
   wash that is clear at the top and solid #1f2739 at the foot. */
@media (max-width: 720px) {
  .cta--display, .cta__inner { min-height: clamp(560px, 205vw, 800px); }
  .cta--display { padding-top: 26px; }                         /* text sits 13px below centre */
  .cta__display { font-size: 25.64vw; }                         /* 100px */
  .cta__lead { display: none; }
  .cta__inner { align-items: flex-end; padding: 0 16px 103px; }
  .cta__content { gap: 24px; }
  .cta__headline { margin-bottom: 12px; font-size: clamp(1.75rem, 8.72vw, 2.125rem); }
  .cta--standard .cta__bg { object-position: 83% center; }    /* keep the clinician in frame */
  /* Figma's wash clears by ~75% of the height; ours holds a little longer so a
     longer headline than the design's still sits on 3:1 or better. */
  .cta--standard::after {
    background: linear-gradient(0deg, #1f2739 0%, rgb(31 39 57 / 90%) 25%, rgb(31 39 57 / 72%) 65%, rgb(31 39 57 / 0) 95%);
  }
  /* Inset band (SP Robot mobile 9196-9996): no button, so the copy ends 130px up. */
  .cta--inset .cta__inner { min-height: clamp(560px, 205vw, 800px); padding: 0 16px 130px; }
  .cta--inset .cta__body { max-width: none; }
  .cta--inset .cta__headline { margin-bottom: 0; }
  .cta--inset .cta__bg { object-position: 41% center; }
}
</style>
