<script setup lang="ts">
// One row of a media_rows section: a 410px text column set 125px off the centre
// line, vertically centred on a 765px-wide image that sits centred in the other
// half. Phones stack the copy over the image (media_mobile when set).
const props = withDefaults(defineProps<{ blok: any, side?: 'left' | 'right', tone?: 'default' | 'accent' }>(), { side: 'right', tone: 'default' })
const media = computed(() => props.blok.media)
const mediaMobile = computed(() => (props.blok.media_mobile?.filename ? props.blok.media_mobile : null))

// Art in these rows ranges from a 765px photograph to a 311px icon. Pinning it
// at 765 pushed the smaller ones off both edges of the page.
const widthPx = computed(() => Number(props.blok.media_width) || 765)

// Waitak, System Principles 10: "Visualization and control interface: both
// videos don't work." They were never videos: the schema had nowhere to put one,
// so both blocks were stills. The clip plays muted and looping once the row
// scrolls into view, and never at all for anyone who prefers reduced motion or
// is saving data. The still stays underneath as the poster, so a row renders
// correctly with no JavaScript and there is no gap if the file never arrives.
const video = computed(() => props.blok.video)
const row = ref<HTMLElement>()
const player = ref<HTMLVideoElement>()
const playing = ref(false)

onMounted(() => {
  if (!video.value?.filename || !row.value || !player.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if ((navigator as any).connection?.saveData) return

  const vid = player.value
  const io = new IntersectionObserver(([e]) => {
    if (!e) return
    if (e.isIntersecting) vid.play().then(() => { playing.value = true }).catch(() => {})
    else vid.pause()
  }, { rootMargin: '150px 0px' })
  io.observe(row.value)
  onBeforeUnmount(() => io.disconnect())
})
const mediaWidth = computed(() => `calc(${(widthPx.value / 14.4).toFixed(2)} * min(1vw, 14.4px))`)
</script>

<template>
  <div
    ref="row"
    v-editable="blok"
    class="mrow"
    :class="[`mrow--media-${side}`, `mrow--${tone}`]"
    :style="{ '--mrow-media-w': mediaWidth }"
  >
    <div class="mrow__text">
      <h3 v-if="blok.headline" class="mrow__title"><BrandText :text="blok.headline" /></h3>
      <p v-if="blok.subtitle" class="mrow__subtitle">{{ blok.subtitle }}</p>
      <!-- StoryblokRichText renders bare paragraphs, so it needs a wrapper to style. -->
      <div v-if="blok.body" class="mrow__body"><StoryblokRichText :document="blok.body" /></div>
      <!-- The list and its heading were in the schema and in the content, but
           nothing output them, so every row lost its procedures. -->
      <template v-if="blok.list_items?.length">
        <p v-if="blok.list_title" class="mrow__list-title">{{ blok.list_title }}</p>
        <ul class="mrow__list">
          <li v-for="item in blok.list_items" :key="item._uid">
            <StoryblokComponent :blok="item" />
          </li>
        </ul>
      </template>
      <div v-if="blok.buttons?.length" class="mrow__actions">
        <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
      </div>
    </div>
    <div v-if="media?.filename || video?.filename" class="mrow__media">
      <picture v-if="media?.filename" class="mrow__picture">
      <source v-if="mediaMobile" media="(max-width: 720px)" :srcset="sbCrop(mediaMobile, 714)">
      <img
        :src="sbCrop(media, 1530)"
        :srcset="`${sbCrop(media, 765)} 765w, ${sbCrop(media, 1530)} 1530w`"
        :sizes="`(max-width: 720px) 92vw, ${mediaWidth}`"
        :alt="media.alt || ''"
        loading="lazy"
      >
      </picture>
      <video
        v-if="video?.filename"
        ref="player"
        class="mrow__video"
        :class="{ 'is-on': playing }"
        :src="video.filename"
        preload="metadata"
        muted
        loop
        playsinline
        disablepictureinpicture
        aria-hidden="true"
        tabindex="-1"
      />
    </div>
  </div>
</template>

<style scoped>
/* Laid out on the 1440 frame so wide screens keep the design's positions. */
.mrow { display: grid; grid-template-columns: 1fr 1fr; align-items: center; max-width: var(--container); margin-inline: auto; }
.mrow__text { width: calc(28.47 * var(--sx)); }                            /* 410 */
.mrow--media-right .mrow__text { grid-column: 1; grid-row: 1; justify-self: start; margin-left: calc(12.85 * var(--sx)); }  /* x185 */
.mrow--media-left .mrow__text { grid-column: 2; grid-row: 1; justify-self: start; margin-left: calc(8.68 * var(--sx)); }   /* x845 */
.mrow--media-right .mrow__media { grid-column: 2; grid-row: 1; }
.mrow--media-left .mrow__media { grid-column: 1; grid-row: 1; }
/* The 765px image is wider than its 720px half: a flex row centres it with the
   overflow split evenly (a grid item that overflows would not stay centred). */
.mrow__media { display: flex; justify-content: center; min-width: 0; position: relative; }
.mrow__picture { display: block; flex: none; }
/* The drawn width wins: several rows are designed to run wider than their own
   column and bleed toward the page edge, so this must not be clamped to 100%. */
.mrow__media img { display: block; flex: none; width: var(--mrow-media-w, calc(53.13 * var(--sx))); max-width: none; height: auto; }
/* Laid over the still, which stays as the poster and as the fallback. It only
   fades in once it is actually playing, so a blocked or failed load simply
   leaves the picture showing. */
.mrow__video {
  position: absolute;
  top: 0;
  left: 50%;
  translate: -50% 0;
  width: var(--mrow-media-w, calc(53.13 * var(--sx)));
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 320ms ease;
  pointer-events: none;
}
.mrow__video.is-on { opacity: 1; }

.mrow__title { margin: 0; font-size: clamp(2rem, 3.33vw, 3rem); font-weight: 600; line-height: 1.2083; color: var(--ink); }
.mrow--accent .mrow__title { color: var(--c-blue); }
.mrow__body { margin-top: 24px; font-size: 1.125rem; font-weight: 300; line-height: 1.6111; color: var(--ink-muted); }
.mrow__body :deep(p) { margin: 0; }
.mrow__body :deep(p + p) { margin-top: 29px; }
.mrow__body :deep(b), .mrow__body :deep(strong) { font-weight: 600; }
/* The subtitle is the schema's "short semibold lead between the title and the
   text" (Instruments Ecosystem, "Seamlessly switch between Cobra and Reverse
   Cobra"). It had markup but no styles, so it rendered as a browser-default
   paragraph. The design sets it at 16/30 semibold, not at the body's 18/29:
   instruments-ecosystem-desktop draws it on two lines at y3912 and y3942, and
   at 18 it took three and pushed the body down. */
.mrow__subtitle { margin: 24px 0 0; font-size: 1rem; font-weight: 600; line-height: 1.875; color: var(--ink); }
/* The subtitle's own 30px line already carries the air under it: the design
   starts the body where the subtitle's last line box ends (y3968 against a box
   running to 3972), so the body's usual 24px does not apply after one. */
.mrow__subtitle + .mrow__body { margin-top: 0; }

/* Clinical Applications draws the procedure list in the title's semibold at
   20/32, each entry behind a 7px dot: the dot's left edge 11.5px in from the
   copy column and the words 30px in (design row 1: title y2041, entries 2073 /
   2105 / 2137, dot x748-754). These also had markup but no styles, so the list
   fell back to the browser's 16px bulleted 40px indent. */
.mrow__list-title { margin: 25px 0 0; font-size: 1.25rem; font-weight: 600; line-height: 1.6; color: var(--ink); }
.mrow__list { margin: 0; padding: 0; list-style: none; }
.mrow__list li { position: relative; padding-left: 30px; line-height: 1.6; }
.mrow__list li::before {
  content: '';
  position: absolute;
  left: 11.5px;
  top: 12.5px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentcolor;
}
/* `nav_link` is the header's own component; inside a row it is a plain entry,
   so its padding and small-label step aside. */
.mrow__list :deep(.nav-link) { display: block; padding: 0; color: var(--ink); }
.mrow__list :deep(.nav-link__label) { font-size: 1.25rem; font-weight: 600; line-height: 1.6; }

.mrow__actions { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 32px; }
/* The design leaves 34px between the last entry and the link under it. */
.mrow__list + .mrow__actions { margin-top: 34px; }

/* Clinical Applications draws its rows in from the page edges rather than
   filling the halves: the copy column and the picture each sit 300px in from
   their own side of the page, so they meet near the centre line (design: the
   picture's outer edge at x300 on the left rows and x1140 on the right ones,
   the copy at x300 when it is on the left and x736.5 when it is on the right).
   Without this the row shrink-wraps its content and the positions follow the
   width of whatever is in it. */
.rows--compact .mrow { width: 100%; }
.rows--compact .mrow--media-right .mrow__text { margin-left: calc(20.83 * var(--sx)); }   /* x300 */
.rows--compact .mrow--media-left .mrow__text { margin-left: calc(1.15 * var(--sx)); }     /* x736.5 */
.rows--compact .mrow--media-left .mrow__media { justify-content: flex-start; padding-left: calc(20.83 * var(--sx)); }
.rows--compact .mrow--media-right .mrow__media { justify-content: flex-end; padding-right: calc(20.83 * var(--sx)); }

/* Phones: copy then image, 16px gutters, 48px titles kept. */
@media (max-width: 720px) {
  .mrow { grid-template-columns: minmax(0, 1fr); gap: 24px; padding-inline: 16px; }
  .mrow--media-right .mrow__text, .mrow--media-left .mrow__text { grid-column: 1; grid-row: auto; justify-self: stretch; width: auto; margin: 0; }
  .mrow--media-right .mrow__media, .mrow--media-left .mrow__media { grid-column: 1; grid-row: auto; }
  /* The compact offsets above are three classes deep, so they outranked the
     phone rule and kept placing the copy at the desktop x300/x736.5. On a 390px
     phone that left the alternating rows starting 20px and 97px in. Waitak:
     "All the blocks are not really well aligned." Every row now sits on the
     16px gutter whichever side its picture is on. */
  .rows--compact .mrow--media-right .mrow__text,
  .rows--compact .mrow--media-left .mrow__text { margin-left: 0; }
  .rows--compact .mrow--media-left .mrow__media,
  .rows--compact .mrow--media-right .mrow__media { justify-content: center; padding-inline: 0; }
  .mrow__picture { flex: auto; width: 100%; }
  .mrow__media img { flex: auto; width: 100%; }
  .mrow__video { width: 100%; }
  .mrow__title { font-size: clamp(2.25rem, 12.3vw, 3rem); }
  /* `phone_layout` has been in the schema and in the content since these pages
     were built but nothing read it. `media-first` puts the picture above the
     copy, which is the order the phone frames draw (System Principles shows the
     heading, then the tube, then the text); `-centred` also centres the copy
     and its button, as those frames do. Lists keep their left edge so the
     bullets line up. */
  .rows--phone-media-first .mrow__media,
  .rows--phone-media-first-centred .mrow__media { order: -1; }
  .rows--phone-media-first-centred .mrow__text { text-align: center; }
  .rows--phone-media-first-centred .mrow__actions { justify-content: center; }
  .rows--phone-media-first-centred .mrow__list { text-align: left; }
}
</style>
