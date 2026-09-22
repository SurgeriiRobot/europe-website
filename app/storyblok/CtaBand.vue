<script setup lang="ts">
// style "display" (Figma 991:18683): 810px photo under a 35% black wash, one
//   centred Lora 600 140/168 headline.
// style "standard" (Figma 991:18687): 700px photo under the Figma gradient (solid
//   #1f2739 to 20%, half at 44%, clear by 66%, all at 80% opacity), content at the
//   left gutter — Inter 600 34/41 headline 399 wide, body, button, 24px apart.
const props = defineProps<{ blok: any }>()
const bg = computed(() => props.blok.background)
const display = computed(() => props.blok.style === 'display')
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section cta"
    :class="display ? 'cta--display' : 'cta--standard'"
    :data-theme="blok.theme || 'dark'"
  >
    <span v-if="display && (blok.connector === 'top' || blok.connector === 'both')" class="cta__lead" aria-hidden="true" />
    <SectionConnector v-else :connector="blok.connector" />
    <img
      v-if="bg?.filename"
      :src="sbCrop(bg, 2880, display ? 1620 : 1400)"
      :srcset="`${sbCrop(bg, 1440, display ? 810 : 700)} 1440w, ${sbCrop(bg, 2880, display ? 1620 : 1400)} 2880w`"
      sizes="100vw"
      :alt="bg.alt || ''"
      class="cta__bg"
      loading="lazy"
    >

    <h2 v-if="display" class="cta__display display-word"><BrandText :text="blok.headline" /></h2>

    <div v-else class="cta__inner">
      <div class="cta__content">
        <h2 class="cta__headline"><BrandText :text="blok.headline" /></h2>
        <p v-if="blok.body" class="cta__body">{{ blok.body }}</p>
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

@media (max-width: 720px) {
  .cta--standard::after { background: linear-gradient(0deg, rgb(31 39 57 / 85%) 30%, rgb(31 39 57 / 45%) 100%); }
}
</style>
