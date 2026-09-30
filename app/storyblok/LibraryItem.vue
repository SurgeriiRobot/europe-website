<script setup lang="ts">
// One Clinical Library card (Figma clinical-library-desktop, 960-1358 and the
// phone modules in extra-modules-mobile 3522-3950): a 212px #f4f4f4 panel —
// 20px padding, a 30px meta row of the date and up to two outlined tags, the
// title 22px under it on a fixed 80px block, then the excerpt — over a 186px
// image. The phone card keeps every one of those measurements and only widens.
//
// A card carrying a `video_id` is a click-to-load facade: the poster and play
// mark are ours, nothing is requested from YouTube until someone presses it.
const props = defineProps<{ blok: any }>()
const emit = defineEmits<{ play: [blok: any] }>()

const sbHref = useSbUrl()
const { locale, locales } = useI18n()
const bcp47 = computed(() => {
  const active = (locales.value as any[]).find(l => (typeof l === 'string' ? l : l.code) === locale.value)
  return (active && typeof active !== 'string' && active.language) || locale.value
})

const isVideo = computed(() => Boolean(props.blok.video_id))
const href = computed(() => {
  const l = props.blok.link
  return l && (l.cached_url || l.url || l.story?.full_slug) ? sbHref(l) : null
})
const date = computed(() => {
  const raw = props.blok.date
  if (!raw) return ''
  const d = new Date(String(raw).replace(' ', 'T'))
  if (Number.isNaN(d.valueOf())) return String(raw)
  return d.toLocaleDateString(bcp47.value, { day: 'numeric', month: 'long', year: 'numeric' })
})
// Datasource values are slugs; the chip shows the reading form ("general-surgery"
// -> "General surgery"), which is how the design writes them.
const label = (v: string) => (v ? v.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase()) : '')
const tags = computed(() => [props.blok.kind, props.blok.specialty].filter(Boolean).map(label))
const image = computed(() => props.blok.image)
</script>

<template>
  <article v-editable="blok" class="lcard" :class="{ 'lcard--video': isVideo }">
    <div class="lcard__text">
      <p class="lcard__meta">
        <span class="lcard__date">{{ date }}</span>
        <span class="lcard__tags">
          <span v-for="tag in tags" :key="tag" class="lcard__tag">{{ tag }}</span>
        </span>
      </p>
      <h3 class="lcard__title">
        <button v-if="isVideo" type="button" class="lcard__link lcard__link--btn" @click="emit('play', blok)">
          <BrandText :text="blok.title" :nowrap="false" />
        </button>
        <NuxtLink v-else-if="href" :to="href" class="lcard__link"><BrandText :text="blok.title" :nowrap="false" /></NuxtLink>
        <BrandText v-else :text="blok.title" :nowrap="false" />
      </h3>
      <p v-if="blok.excerpt" class="lcard__excerpt"><BrandText :text="blok.excerpt" :nowrap="false" /></p>
    </div>

    <button
      v-if="isVideo"
      type="button"
      class="lcard__media lcard__media--play"
      :aria-label="`Play video: ${blok.title}`"
      @click="emit('play', blok)"
    >
      <img
        v-if="image?.filename"
        :src="sbCrop(image, 600, 372)"
        :srcset="`${sbCrop(image, 600, 372)} 600w, ${sbCrop(image, 900, 558)} 900w`"
        sizes="(max-width: 720px) 358px, 300px"
        :alt="image.alt || ''"
        loading="lazy"
      >
      <span class="lcard__play" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false"><path d="M8 5.5v13l11-6.5z" /></svg>
      </span>
    </button>
    <component
      :is="href ? 'NuxtLink' : 'div'"
      v-else
      :to="href || undefined"
      class="lcard__media"
      :tabindex="href ? -1 : undefined"
      :aria-hidden="href ? 'true' : undefined"
    >
      <img
        v-if="image?.filename"
        :src="sbCrop(image, 600, 372)"
        :srcset="`${sbCrop(image, 600, 372)} 600w, ${sbCrop(image, 900, 558)} 900w`"
        sizes="(max-width: 720px) 358px, 300px"
        :alt="image.alt || ''"
        loading="lazy"
      >
    </component>
  </article>
</template>

<style scoped>
.lcard { display: flex; flex-direction: column; }

.lcard__text {
  flex: 1 1 auto;
  min-height: 212px;
  padding: 20px;
  background: var(--c-neutral-300);
  color: var(--c-darkblue);
  overflow: hidden;
}

.lcard__meta {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-height: 30px;
  margin: 0;
}
.lcard__date {
  /* Ranged against the tags, and free to fall onto a second line when they are
     wide — the design does exactly that on its "Publication / Gynecology" card. */
  flex: 0 1 auto;
  min-width: 0;
  align-self: center;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.2;
}
.lcard__tags { display: flex; flex: none; justify-content: flex-end; gap: 7px; margin-left: auto; }
.lcard__tag {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 9px;
  border: 1px solid var(--c-darkblue);
  border-radius: 4px;
  font-size: 0.8125rem;                 /* 13 */
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0.46px;               /* the MUI chip tracking the design is built on */
  white-space: nowrap;
}

/* The title block is a fixed 80px: four 16/19 lines, the excerpt always starting
   152px down the panel however short the heading is. */
.lcard__title {
  min-height: 80px;
  margin: 23px 0 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.1875;                  /* 19/16 */
  color: var(--c-darkblue);
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  line-clamp: 4;
}
.lcard__link { color: inherit; text-decoration: none; }
.lcard__link:hover { text-decoration: underline; text-underline-offset: 3px; }
.lcard__link--btn {
  display: inline;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.lcard__excerpt {
  margin: 0;
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.1875;                  /* 19/16 */
  color: var(--c-darkblue);
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.lcard__media {
  position: relative;
  flex: none;
  display: block;
  width: 100%;
  height: 186px;
  padding: 0;
  border: 0;
  background: var(--c-neutral-400);
  overflow: hidden;
}
.lcard__media img { width: 100%; height: 100%; object-fit: cover; }
.lcard__media--play { cursor: pointer; }

/* 56px translucent disc with a white play mark, centred — the design's overlay.
   The design only draws it over a dark still; the shadow and the solid mark keep
   it visible on a pale poster too, where 40% white on white would vanish. */
.lcard__play {
  position: absolute;
  inset: 50% auto auto 50%;
  translate: -50% -50%;
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgb(255 255 255 / 40%);
  box-shadow: 0 1px 12px rgb(16 20 30 / 38%);
  transition: background-color 200ms ease;
}
.lcard__play svg {
  width: 26px;
  height: 26px;
  fill: rgb(255 255 255 / 88%);
  filter: drop-shadow(0 1px 2px rgb(16 20 30 / 45%));
}
.lcard__media--play:hover .lcard__play { background: rgb(255 255 255 / 60%); }
.lcard__media--play:hover .lcard__play svg { fill: #fff; }
.lcard__media--play:focus-visible { outline: 2px solid var(--c-blue); outline-offset: -2px; }

/* Figma wraps the 300px card's text at 259px where the browser measures 260, and
   its text sets about 1% narrower than ours; 257px is the measure that
   reproduces every line break the design draws. It only applies where the grid
   actually runs four columns — narrower layouts give the card its full width. */
@media (min-width: 1181px) {
  .lcard__title, .lcard__excerpt { max-width: 257px; }
}

@media (max-width: 720px) {
  .lcard__play { width: 64px; height: 64px; }
  .lcard__play svg { width: 30px; height: 30px; }
}
</style>
