<script setup lang="ts">
// Figma home banner (`991:18637`): 1440x800 full-bleed photograph, content
// anchored bottom-left in a 339px column — 60px top / 100px bottom padding, 32px
// between heading, body and button. Heading Inter 600 48/58, body Inter 300 18/29.
const props = defineProps<{ blok: any }>()

const WIDTHS = [768, 1440, 2160, 2880]
const bg = computed(() => props.blok.background)

// An explicit height is in design px at 1440, so it scales with --sx like every
// other measurement. Left empty, an opening banner fills the screen instead.
const heightVar = computed(() => {
  const h = Number(props.blok.height)
  const m = Number(props.blok.measure)
  return {
    ...(h > 0 ? { '--hero-h': `calc(${(h / 14.4).toFixed(2)} * var(--sx))` } : {}),
    // The column the copy wraps in, in design px. Banners are drawn to very
    // different measures: home fits 339, Contact 520, the library 528.
    ...(m > 0 ? { '--hero-measure': `${m}px` } : {}),
    // How far the copy sits off the banner's foot, in design px. Frames draw
    // this at 100 or 80 depending on the page.
    ...(Number(props.blok.copy_inset) > 0 ? { '--hero-inset': `${Number(props.blok.copy_inset)}px` } : {}),
  }
})

// Storyblok's image service resizes and re-encodes on the fly; the hero is the
// largest paint on the page, so ship WebP at the width the viewport needs.
const src = computed(() => bg.value?.filename ? sbImage(bg.value, '1440x0/filters:format(webp):quality(80)') : '')

// Background video is progressive enhancement: the poster image is server
// rendered (it's the page's largest paint), and the video mounts over it only in
// the browser — never for people who prefer reduced motion or save data.
const video = computed(() => props.blok.video?.filename || '')
const videoType = computed(() => (/\.webm($|\?)/i.test(video.value) ? 'video/webm' : 'video/mp4'))
const videoEl = ref<HTMLVideoElement>()
const useVideo = ref(false)
const ready = ref(false)

onMounted(() => {
  if (!video.value) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const saveData = (navigator as any).connection?.saveData === true
  useVideo.value = !reduce && !saveData
})

// The video loops continuously with no visitor control (people who prefer
// reduced motion get the still poster instead). It still pauses off-screen and
// on a hidden tab so nobody decodes video they can't see.
onMounted(() => {
  const resume = () => { if (videoEl.value?.paused) videoEl.value.play() }
  const suspend = () => { if (!videoEl.value?.paused) videoEl.value?.pause() }

  const io = new IntersectionObserver(entries => (entries[0]?.isIntersecting ? resume() : suspend()), { threshold: 0.1 })
  watchEffect(() => { if (videoEl.value) io.observe(videoEl.value) })

  const onVisibility = () => (document.hidden ? suspend() : resume())
  document.addEventListener('visibilitychange', onVisibility)
  onBeforeUnmount(() => { io.disconnect(); document.removeEventListener('visibilitychange', onVisibility) })
})
// An editor-set focal point positions the photo (and the video over it) when the
// frame crops it — e.g. SP Robot's console lights stay centred on phones.
// Storyblok asset URLs carry the pixel size: /f/<space>/<W>x<H>/...
const focusPosition = computed(() => {
  const focus = bg.value?.focus
  const size = bg.value?.filename?.match(/\/(\d+)x(\d+)\//)
  const pt = focus?.match(/^(\d+)x(\d+):(\d+)x(\d+)$/)
  if (!size || !pt) return undefined
  const x = (Number(pt[1]) + Number(pt[3])) / 2 / Number(size[1]) * 100
  const y = (Number(pt[2]) + Number(pt[4])) / 2 / Number(size[2]) * 100
  return { objectPosition: `${x.toFixed(1)}% ${y.toFixed(1)}%` }
})
const srcset = computed(() =>
  bg.value?.filename
    ? WIDTHS.map(w => `${sbImage(bg.value, `${w}x0/filters:format(webp):quality(80)`)} ${w}w`).join(', ')
    : '',
)
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="hero-full"
    :class="[`hero-full--overlay-${blok.overlay || 'none'}`, `hero-full--ink-${blok.ink || 'white'}`]"
    :style="heightVar"
  >
    <img
      v-if="src"
      :src="src"
      :srcset="srcset"
      sizes="100vw"
      :alt="bg.alt || ''"
      class="hero-full__bg"
      :style="focusPosition"
      loading="eager"
      fetchpriority="high"
    >

    <video
      v-if="useVideo"
      ref="videoEl"
      class="hero-full__bg hero-full__video"
      :style="focusPosition"
      :class="{ 'is-ready': ready }"
      :poster="src"
      autoplay
      muted
      loop
      playsinline
      preload="auto"
      aria-hidden="true"
      @canplay="ready = true"
    >
      <source :src="video" :type="videoType">
    </video>

    <div class="hero-full__inner">
      <div class="hero-full__content">
        <h1 class="hero-full__headline"><BrandText :text="blok.headline" /></h1>
        <p v-if="blok.body" class="hero-full__body" :class="{ 'hero-full__body--small': blok.body_size === 'small' }">
          <BrandText :text="blok.body" :nowrap="false" />
        </p>
        <div v-if="blok.buttons?.length" class="hero-full__actions">
          <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-full {
  position: relative;
  isolation: isolate;
  display: flex;
  min-height: var(--hero-h, clamp(560px, 55.56vw, 800px));   /* 800/1440 */
  overflow: hidden;
  background: var(--c-neutral-1000);
  color: var(--c-white);
}
.hero-full--ink-navy { color: var(--c-darkblue); }

/* As the page's opening section it starts at y=0 behind the header, exactly as
   in Figma (hero 0-800, header overlaid on the top 80px). */
.hero-full:first-child { margin-top: calc(-1 * var(--header-h)); }
.hero-full:first-child .hero-full__inner { padding-top: calc(var(--header-h) + 60px); }

/* On desktop an opening banner with no height of its own fills the screen.
   Because it already starts at y=0 behind the header, a full viewport height
   leaves the video alone on the first screenful rather than showing the top of
   the next section under it. A banner that sets a height keeps it: the Contact
   page draws an 800px one. Phones keep the height their design gives them. */
@media (min-width: 721px) {
  .hero-full:first-child { min-height: var(--hero-h, max(560px, 100svh)); }
}

.hero-full__bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* The video fades in over the poster once it can actually play, so a slow
   connection never shows a blank frame. */
.hero-full__video { opacity: 0; transition: opacity 600ms ease; }
.hero-full__video.is-ready { opacity: 1; }

/* The design's photograph is already dark where the text sits, so it ships with
   no overlay; editors can add one for lighter images. */
.hero-full::after { content: ''; position: absolute; inset: 0; z-index: -1; }
.hero-full--overlay-left::after { background: linear-gradient(90deg, rgb(0 0 0 / 65%) 0%, transparent 60%); }
/* A tighter version of the same wash, clearing at 42% rather than 60%, for the
   frames that keep more of the photograph visible beside the copy. */
.hero-full--overlay-left-narrow::after { background: linear-gradient(90deg, rgb(0 0 0 / 65%) 0%, transparent 42%); }
.hero-full--overlay-bottom::after { background: linear-gradient(0deg, rgb(0 0 0 / 70%) 0%, transparent 65%); }
.hero-full--overlay-full::after { background: rgb(0 0 0 / 45%); }
/* A white wash for the banners drawn light, where the copy is navy on a pale
   photograph rather than white on a dark one. */
.hero-full--overlay-wash::after {
  background: linear-gradient(90deg, rgb(255 255 255 / 90%) 0%, rgb(255 255 255 / 49%) 33%, rgb(255 255 255 / 9%) 58%, rgb(255 255 255 / 7%) 100%);
}

.hero-full__inner {
  display: flex;
  align-items: flex-end;
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding: 60px clamp(16px, 5.2vw, 75px) var(--hero-inset, 100px);
}

.hero-full__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  max-width: var(--hero-measure, 380px);   /* home's lines fit 339; SP Robot's title needs 375 */
}

.hero-full__headline {
  margin: 0;
  font-size: clamp(2.25rem, 3.33vw, 3rem);    /* 48px at 1440 */
  font-weight: 600;
  line-height: 1.2083;                         /* 58/48 */
  color: inherit;
}

.hero-full__body {
  margin: 0;
  /* Honour the line breaks an editor types. Several banners are drawn with
     explicit breaks that no single measure reproduces, and a body without any
     is unaffected. */
  white-space: pre-line;
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;                         /* 29/18 */
}
/* The SP Robot hero sets its body a size down (16/26), unlike the other pages. */
.hero-full__body--small { font-size: 1rem; line-height: 1.625; }

.hero-full__actions { display: flex; flex-wrap: wrap; gap: 16px; }

/* Phone design (390 wide): a 780px hero under the transparent header, copy at
   the 16px gutter — Inter 600 34/41 title, 300 16/26 body — 48px above the edge. */
@media (max-width: 720px) {
  .hero-full { min-height: clamp(560px, 200vw, 780px); }
  .hero-full__inner { padding: calc(var(--header-h) + 60px) 16px 48px; }
  .hero-full__content { gap: 24px; max-width: none; }   /* phones use the full gutter-to-gutter measure */
  /* The phone design runs the call to action edge to edge. */
  .hero-full__actions { width: 100%; }
  .hero-full__actions > :deep(.btn) { flex: 1 1 100%; justify-content: center; }
  .hero-full__headline { max-width: 310px; font-size: clamp(1.75rem, 8.72vw, 2.125rem); line-height: 1.206; }
  .hero-full__body { font-size: 1rem; line-height: 1.625; }
  .hero-full__bg { object-position: 24% center; }
  .hero-full__video { object-position: center; }
}
</style>
