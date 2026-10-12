<script setup lang="ts">
// SP Robot "System purpose & intended use" (Figma 800-2283): an oversized two-line
// heading on a centred 1203px measure — line 1 flush left, line 2 flush right with
// a pale accent word before it at 1.4x — each line trailing a hairline to the page
// edge at its x-height, then a product shot bleeding off the right edge.
const props = defineProps<{ blok: any }>()
const media = computed(() => props.blok.media)

// The picture is drawn 140 design units wide, which is 2017px at the design
// width and never more, so a 2x screen wants about 4034. The srcset stopped at
// 2560 while the file itself holds 4034, which is what Waitak saw as "the image
// of the machine is bad quality": the pixels were there, we were not asking for
// them. Candidates are capped at the file's own width so none of them overstates
// what the image service can return.
// Waitak, SP Robot 2: "This is actually a video, with a scroll animation."
// The frame follows how far the section has travelled through the viewport, so
// scrolling fast runs it fast and scrolling back up runs it backwards, which is
// what playbackRate alone cannot do. Every frame is a keyframe in the encode, so
// a seek lands exactly rather than snapping to the nearest one.
//
// It only runs where it is wanted: the still stays put for anyone who prefers
// reduced motion, on touch (his item is tagged desktop), and until the file has
// decoded enough to seek. The picture underneath is never removed, so there is
// always something to fall back to and no gap if the video never loads.
const video = computed(() => props.blok.video)
const root = ref<HTMLElement>()
const player = ref<HTMLVideoElement>()
const scrubbing = ref(false)

onMounted(() => {
  if (!video.value?.filename || !root.value || !player.value) return
  // Excluding a coarse pointer rather than demanding a fine one: a device with
  // no pointer at all reports neither, and requiring "fine" shut those out.
  const allowed = window.matchMedia('(min-width: 721px)').matches
    && !window.matchMedia('(pointer: coarse)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!allowed) return

  const el = root.value
  const vid = player.value
  let frame = 0
  let want = 0

  // The section runs from entering the bottom of the viewport to leaving the top.
  const progress = () => {
    const r = el.getBoundingClientRect()
    const travel = window.innerHeight + r.height
    return Math.min(1, Math.max(0, (window.innerHeight - r.top) / travel))
  }
  const draw = () => {
    frame = 0
    const d = vid.duration
    if (!d || !Number.isFinite(d)) return
    const t = want * d
    // Below a quarter of a frame the seek is invisible and only costs a decode.
    if (Math.abs(vid.currentTime - t) < d / 77 / 4) return
    if (typeof vid.fastSeek === 'function') vid.fastSeek(t)
    else vid.currentTime = t
  }
  const onScroll = () => {
    want = progress()
    if (!frame) frame = requestAnimationFrame(draw)
  }

  const start = () => {
    scrubbing.value = true
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
  }
  const io = new IntersectionObserver(([e]) => {
    if (!e) return
    if (e.isIntersecting) { if (vid.readyState >= 2) start(); else vid.addEventListener('loadeddata', start, { once: true }) }
    else { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, { rootMargin: '200px 0px' })
  io.observe(el)

  onBeforeUnmount(() => {
    io.disconnect()
    if (frame) cancelAnimationFrame(frame)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  })
})

const srcset = computed(() => {
  const full = sbWidth(media.value)
  const widths = [1280, 2560].filter(w => !full || w < full)
  if (full) widths.push(full)
  return widths.map(w => `${sbCrop(media.value, w)} ${w}w`).join(', ')
})
// An ampersand read aloud as "and"; anything else the CMS puts here is already
// a word, so it goes through unchanged.
// The spaces are inside the string, not text nodes of their own: the span is
// out of flow, so nothing it contains can touch the visible line. Line 1 and
// line 2 are adjacent inline spans with no whitespace between them, and without
// a leading space the name came out as "System purposeand intended use".
const accentWord = computed(() => ` ${String(props.blok.accent || '').trim() === '&' ? 'and' : props.blok.accent} `)
</script>

<template>
  <section ref="root" v-editable="blok" :id="blok.anchor || undefined" class="section display" :data-theme="blok.theme || 'light'">
    <SectionConnector :connector="blok.connector" />
    <h2 class="display__heading">
      <span class="display__line display__line--1"><span class="display__text"><BrandText :text="blok.line_1" /></span></span>
      <span v-if="blok.line_2 || blok.accent" class="display__line display__line--2">
        <!-- The accent is the heading's conjunction set at 1.4x in #e2e2e2,
             which measures 1.30:1 on the white band: a flourish, not something
             anyone reads. Legible would mean a 140px grey ampersand heavier
             than the words either side of it, so it stays as drawn, is marked
             decorative, and the heading's accessible text carries the word
             instead: "System purpose and intended use" rather than the two
             halves run together. -->
        <span v-if="blok.accent" class="display__accent" aria-hidden="true">{{ blok.accent }}</span>
        <span v-if="blok.accent" class="visually-hidden">{{ accentWord }}</span>
        {{ ' ' }}<span class="display__text"><BrandText :text="blok.line_2" /></span>
      </span>
    </h2>
    <div v-if="media?.filename || video?.filename" class="display__figure">
      <img
        v-if="media?.filename"
        :src="sbCrop(media, 2560)"
        :srcset="srcset"
        sizes="(max-width: 720px) 170vw, calc(140 * min(1vw, 14.4px))"
        :alt="media.alt || ''"
        class="display__media"
        loading="lazy"
      >
      <video
        v-if="video?.filename"
        ref="player"
        class="display__video"
        :class="{ 'is-on': scrubbing }"
        :src="video.filename"
        preload="auto"
        muted
        playsinline
        disablepictureinpicture
        aria-hidden="true"
        tabindex="-1"
      />
    </div>
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
/* The conjunction is set in Lora at both sizes, not just on phones: it is the
   display face, and the sans ampersand reads as a different mark entirely. */
.display__accent { font-family: var(--font-display); font-size: 1.4em; line-height: 0; color: var(--c-leather); }

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
/* The figure carries the picture's box, so the video can simply fill it. The
   still used to own those offsets, but it overflows the container, which left
   an absolutely placed video sized to the container instead of to the picture. */
.display__figure {
  position: relative;
  width: calc(140.07 * var(--sx));
  margin: calc(-1.49 * var(--sx)) 0 calc(-1.25 * var(--sx)) calc(var(--frame-x) + 3.33 * var(--sx));
}
.display__media { display: block; width: 100%; max-width: none; height: auto; margin: 0; }
/* Laid exactly over the still, and only shown once it can actually seek, so the
   still is what anyone sees until the scrub is running. The clip is framed a
   touch differently from the stills, so it covers rather than letterboxes. */
.display__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 240ms ease;
  pointer-events: none;
}
.display__video.is-on { opacity: 1; }

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
  .display__figure { width: 170vw; margin: 23px 0 -15px -11.08vw; }
}
</style>
