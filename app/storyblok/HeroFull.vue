<script setup lang="ts">
// Figma home banner (`991:18637`): 1440x800 full-bleed photograph, content
// anchored bottom-left in a 339px column — 60px top / 100px bottom padding, 32px
// between heading, body and button. Heading Inter 600 48/58, body Inter 300 18/29.
const props = defineProps<{ blok: any }>()

const WIDTHS = [768, 1440, 2160, 2880]
const bg = computed(() => props.blok.background)

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
const playing = ref(true)

onMounted(() => {
  if (!video.value) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const saveData = (navigator as any).connection?.saveData === true
  useVideo.value = !reduce && !saveData
})

// Moving content that runs longer than five seconds needs a pause control (WCAG 2.2.2).
const userPaused = ref(false)
function togglePlayback() {
  const el = videoEl.value
  if (!el) return
  if (el.paused) { el.play(); playing.value = true; userPaused.value = false }
  else { el.pause(); playing.value = false; userPaused.value = true }
}

// Don't decode video nobody can see: pause off-screen and on a hidden tab, and
// resume only if the visitor didn't pause it themselves.
onMounted(() => {
  const resume = () => { if (!userPaused.value && videoEl.value?.paused) { videoEl.value.play(); playing.value = true } }
  const suspend = () => { if (!videoEl.value?.paused) { videoEl.value?.pause(); playing.value = false } }

  const io = new IntersectionObserver(entries => (entries[0]?.isIntersecting ? resume() : suspend()), { threshold: 0.1 })
  watchEffect(() => { if (videoEl.value) io.observe(videoEl.value) })

  const onVisibility = () => (document.hidden ? suspend() : resume())
  document.addEventListener('visibilitychange', onVisibility)
  onBeforeUnmount(() => { io.disconnect(); document.removeEventListener('visibilitychange', onVisibility) })
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
    :class="`hero-full--overlay-${blok.overlay || 'none'}`"
  >
    <img
      v-if="src"
      :src="src"
      :srcset="srcset"
      sizes="100vw"
      :alt="bg.alt || ''"
      class="hero-full__bg"
      loading="eager"
      fetchpriority="high"
    >

    <video
      v-if="useVideo"
      ref="videoEl"
      class="hero-full__bg hero-full__video"
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

    <button
      v-if="useVideo && ready"
      type="button"
      class="hero-full__toggle"
      :aria-label="playing ? 'Pause background video' : 'Play background video'"
      @click="togglePlayback"
    >
      <svg v-if="playing" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
      <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z" /></svg>
    </button>

    <div class="hero-full__inner">
      <div class="hero-full__content">
        <h1 class="hero-full__headline"><BrandText :text="blok.headline" /></h1>
        <p v-if="blok.body" class="hero-full__body">{{ blok.body }}</p>
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
  min-height: clamp(560px, 55.56vw, 800px);   /* 800/1440 */
  overflow: hidden;
  background: var(--c-neutral-1000);
  color: var(--c-white);
}

/* As the page's opening section it starts at y=0 behind the header, exactly as
   in Figma (hero 0-800, header overlaid on the top 80px). */
.hero-full:first-child { margin-top: calc(-1 * var(--header-h)); }
.hero-full:first-child .hero-full__inner { padding-top: calc(var(--header-h) + 60px); }

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

.hero-full__toggle {
  position: absolute;
  inset-inline-end: clamp(16px, 5.2vw, 75px);
  bottom: 32px;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid rgb(255 255 255 / 45%);
  border-radius: 50%;
  background: rgb(0 0 0 / 35%);
  color: var(--c-white);
  cursor: pointer;
}
.hero-full__toggle:hover { background: rgb(0 0 0 / 55%); }

/* The design's photograph is already dark where the text sits, so it ships with
   no overlay; editors can add one for lighter images. */
.hero-full::after { content: ''; position: absolute; inset: 0; z-index: -1; }
.hero-full--overlay-left::after { background: linear-gradient(90deg, rgb(0 0 0 / 65%) 0%, transparent 60%); }
.hero-full--overlay-bottom::after { background: linear-gradient(0deg, rgb(0 0 0 / 70%) 0%, transparent 65%); }
.hero-full--overlay-full::after { background: rgb(0 0 0 / 45%); }

.hero-full__inner {
  display: flex;
  align-items: flex-end;
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding: 60px clamp(16px, 5.2vw, 75px) 100px;
}

.hero-full__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  max-width: 339px;
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
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;                         /* 29/18 */
}

.hero-full__actions { display: flex; flex-wrap: wrap; gap: 16px; }

@media (max-width: 720px) {
  .hero-full__inner { padding-bottom: 56px; }
  /* As the page's opening section it starts at y=0 behind the header, exactly as
   in Figma (hero 0-800, header overlaid on the top 80px). */
.hero-full:first-child { margin-top: calc(-1 * var(--header-h)); }
.hero-full:first-child .hero-full__inner { padding-top: calc(var(--header-h) + 60px); }

.hero-full__bg { object-position: 70% center; }   /* keep the instrument in frame */
}
</style>
