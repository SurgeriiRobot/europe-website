<script setup lang="ts">
// SP Robot "System purpose & intended use" (Figma 800-2283): an oversized two-line
// heading on a centred 1203px measure — line 1 flush left, line 2 flush right with
// a pale accent word before it at 1.4x — each line trailing a hairline to the page
// edge at its x-height, then a product shot bleeding off the right edge.
const props = defineProps<{ blok: any }>()
const media = computed(() => props.blok.media)
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section display" :data-theme="blok.theme || 'light'">
    <SectionConnector :connector="blok.connector" />
    <h2 class="display__heading">
      <span class="display__line display__line--1"><span class="display__text"><BrandText :text="blok.line_1" /></span></span>
      <span v-if="blok.line_2 || blok.accent" class="display__line display__line--2">
        <span v-if="blok.accent" class="display__accent">{{ blok.accent }}</span>
        {{ ' ' }}<span class="display__text"><BrandText :text="blok.line_2" /></span>
      </span>
    </h2>
    <img
      v-if="media?.filename"
      :src="sbCrop(media, 2560)"
      :srcset="`${sbCrop(media, 1280)} 1280w, ${sbCrop(media, 2560)} 2560w`"
      sizes="(max-width: 720px) 170vw, calc(140 * min(1vw, 14.4px))"
      :alt="media.alt || ''"
      class="display__media"
      loading="lazy"
    >
  </section>
</template>

<style scoped>
/* Line 1's box starts 100px into the section (Figma's glyphs at 897 sit 3px
   lower in their box than Inter's do in ours). */
.display { padding: calc(6.94 * var(--sx)) 0 0; overflow: hidden; }

.display__heading {
  position: relative;
  display: grid;
  width: calc(83.54 * var(--sx));                  /* 1203: x118 to x1321 */
  margin: 0 auto;
  font-size: calc(6.94 * var(--sx));               /* 100px */
  font-weight: 600;
  line-height: 1.2;
  color: var(--ink);
}
.display__line--1 { justify-self: start; }
/* Baselines 140px apart (993.9 / 1133.9): line 2 sits in a 140px line box. */
.display__line--2 { justify-self: end; margin-top: calc(0.69 * var(--sx)); line-height: calc(9.72 * var(--sx)); }
.display__text, .display__accent { position: relative; }
.display__accent { font-size: 1.4em; line-height: 0; color: var(--c-leather); }

/* Hairlines at each line's x-height (Figma 969 and 1107): from 184px after
   line 1 to the right edge, and from the left edge to 103px before the accent. */
.display__line--1 .display__text::after,
.display__accent::before {
  content: '';
  position: absolute;
  width: 100vw;
  border-top: var(--line-w) solid var(--line);
  pointer-events: none;
}
.display__line--1 .display__text::after { top: 0.72em; left: calc(100% + 12.78 * var(--sx)); }
.display__accent::before { top: 0.776em; right: calc(100% + 7.15 * var(--sx)); }

/* The product shot: 2017px wide from x48, rising 18px into the heading's last
   line box and running 18px under the next section's top (white on white). */
.display__media {
  display: block;
  width: calc(140.07 * var(--sx));
  max-width: none;
  height: auto;
  margin: calc(-1.49 * var(--sx)) 0 calc(-1.25 * var(--sx)) calc(var(--frame-x) + 3.33 * var(--sx));
}

/* Phone design (390 wide): one word to a line on a 230px measure, 52/52 and
   centred, the accent on its own line in Lora; short edge hairlines at the
   second and fifth lines; the shot 663px wide from x-43. */
@media (max-width: 720px) {
  .display { padding-top: 73px; }
  .display__heading { width: 59vw; font-size: clamp(2.5rem, 13.33vw, 3.25rem); line-height: 1; text-align: center; }
  .display__line--1, .display__line--2 { justify-self: center; }
  .display__line--2 { margin-top: 0; line-height: 1; }
  .display__accent { display: block; font-family: var(--font-display); font-size: 1em; line-height: 1; }
  .display__line--1 .display__text::after, .display__accent::before { display: none; }
  .display__heading::before,
  .display__heading::after {
    content: '';
    position: absolute;
    width: 11.8vw;
    border-top: var(--line-w) solid var(--line);
  }
  .display__heading::before { top: 1em; right: calc(100% + 20.5vw - 11.8vw); }   /* x0-46 at 899 */
  .display__heading::after { top: 4.25em; left: calc(100% + 20.5vw - 11.8vw); }  /* x345-390 at 1068 */
  .display__media { width: 170vw; margin: 23px 0 -15px -11.08vw; }
}
</style>
