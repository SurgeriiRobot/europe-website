<script setup lang="ts">
// Figma "News & events" listing card (news-and-events-desktop.png, 300x398 at
// 1440): a square-cornered #f4f4f4 tile — 210px of text over a 188px photo.
// Inside the text block the date sits opposite up to two right-aligned tag
// chips (28px tall, 4px radius, 1px #03045e), then a two-line 18/29 title and a
// two-line 16/19 excerpt. Both text blocks are fixed height, which is what keeps
// the photos of a row on one line whatever the copy runs to.
// The phone modules (extra-modules-mobile) use the same card full-bleed between
// the 16px gutters, with the same vertical rhythm.
const props = defineProps<{
  story: any
  /** datasource value -> display name, so tags read "General surgery", not "general-surgery" */
  labels?: Record<string, string>
}>()

const emit = defineEmits<{ gated: [story: any] }>()
const sbHref = useSbUrl()
const localePath = useLocalePath()
const { locale, locales } = useI18n()

const content = computed(() => props.story.content || {})
// An article that lives somewhere else goes through the contact gate first, so
// the card stops being a plain link and asks the listing to open it.
const external = computed(() => {
  const l = props.story.content?.external_url
  return l && (l.cached_url || l.url) ? sbHref(l) : ''
})
const href = computed(() => (external.value ? external.value : localePath(`/${props.story.full_slug}`)))

// The design writes the date out in full ("9 june 2026"). Month names follow the
// reader's language, so the format comes from the locale's BCP-47 tag rather
// than a hardcoded pattern — "9 June 2026" in en-GB, "9. Juni 2026" in de-DE.
const language = computed(() => {
  const active = (locales.value as any[]).find(l => (typeof l === 'string' ? l : l.code) === locale.value)
  return (active && typeof active !== 'string' && active.language) || 'en-GB'
})
const date = computed(() => {
  const raw = content.value.date
  if (!raw) return ''
  const parsed = new Date(String(raw).replace(' ', 'T'))
  return Number.isNaN(parsed.getTime())
    ? ''
    : parsed.toLocaleDateString(language.value, { day: 'numeric', month: 'long', year: 'numeric' })
})

const label = (value: string) =>
  props.labels?.[value] || value.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase())

// The design never shows more than two chips: the article type and one
// specialty. A third would push the row into the date on a 300px card.
const tags = computed(() =>
  [content.value.article_type, (content.value.specialties || [])[0]]
    .filter(Boolean)
    .slice(0, 2)
    .map(label),
)

// Waitak, on the card link: "client will need to be able to checkmark which CTA
// they will need for what content". The wording is picked from a vocabulary, so
// it arrives already translated and the card itself stays the click target: the
// label is a cue rather than a second link.
const ctaWord = useVocabulary(['card-ctas'])
const ctaLabel = computed(() => (content.value?.cta ? ctaWord(content.value.cta) : ''))
</script>

<template>
  <component
    :is="external ? 'a' : 'NuxtLink'"
    :to="external ? undefined : href"
    :href="external ? href : undefined"
    class="lcard"
    @click="external ? ($event.preventDefault(), emit('gated', story)) : null"
  >
    <div class="lcard__text">
      <p class="lcard__meta">
        <span class="lcard__date">{{ date }}</span>
        <span v-if="tags.length" class="lcard__tags">
          <span v-for="tag in tags" :key="tag" class="lcard__tag">{{ tag }}</span>
        </span>
      </p>
      <h2 class="lcard__title">{{ content.title || story.name }}</h2>
      <p class="lcard__excerpt">{{ content.excerpt }}</p>
      <span v-if="ctaLabel" class="lcard__more">{{ ctaLabel }}<span aria-hidden="true"> →</span></span>
    </div>
    <img
      v-if="content.image?.filename"
      :src="sbCrop(content.image, 600, 376)"
      :srcset="`${sbCrop(content.image, 300, 188)} 300w, ${sbCrop(content.image, 600, 376)} 600w, ${sbCrop(content.image, 760, 476)} 760w`"
      sizes="(max-width: 720px) calc(100vw - 32px), (max-width: 1180px) 45vw, 300px"
      :alt="content.image.alt || ''"
      class="lcard__media"
      loading="lazy"
    >
    <span v-else class="lcard__media lcard__media--empty" aria-hidden="true" />
  </component>
</template>

<style scoped>
.lcard {
  display: flex;
  flex-direction: column;
  min-height: 398px;
  background: #f4f4f4;                 /* the design's card grey */
  color: var(--c-darkblue);
  text-decoration: none;
}
/* 210px of text: 21 above the meta row, 23 to the title, 22 to the excerpt and
   20 left under it before the photograph. A card that carries a link needs one
   more line than the frame drew, so the block is a minimum rather than a fixed
   height and the picture is pushed to the foot. Waitak: "the CTA is too big, we
   will need to adjust the CTA or the card to make everything fit." */
.lcard__text {
  flex: none;
  min-height: 210px;
  padding: 21px 20px 20px;
}

/* The chip height sets the row, and centring both puts the 12px date's
   baseline within a pixel of the 13px chip label's.
   The date opposite its chips, as the design draws it, but the translated
   words are longer than the English: "14. Oktober 2026" beside "Veranstaltung"
   and a specialty will not sit on one 256px line. It wraps rather than running
   out of the card. */
.lcard__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  min-height: 28px;
  margin: 0;
}
.lcard__date { font-size: 0.75rem; font-weight: 400; line-height: 1.2; white-space: nowrap; }
.lcard__tags { display: flex; flex-wrap: wrap; gap: 6px; }
.lcard__tag {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding-inline: 9px;                 /* 10px to the text, the border included */
  border: 1px solid var(--c-darkblue);
  border-radius: 4px;
  font-size: 0.8125rem;                /* 13px */
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.46px;              /* the MUI tracking the design's chips carry */
  white-space: nowrap;
}

/* Fixed two-line blocks: a one-line title still leaves the excerpt and the photo
   where the design puts them. */
/* The client, on the news headlines: "the line spacing is larger than in the
   Clinical Library articles, let's keep it consistent". The library sets 19 on
   16; the same ratio on this card's 18px gives the two lines a tighter set. */
.lcard__title {
  display: -webkit-box;
  height: 2.375em;                  /* two lines at 1.1875 */
  margin: 23px 0 0;
  overflow: hidden;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.1875;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.lcard__excerpt {
  display: -webkit-box;
  height: 38px;
  margin: 22px 0 0;
  overflow: hidden;
  font-size: 1rem;
  font-weight: 300;
  line-height: 19px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
/* The card's own link, picked from the vocabulary. Part of the card rather than
   part of the copy, so it lines up whatever the excerpt does. */
.lcard__more { display: block; margin-top: 10px; font-weight: 600; color: var(--c-blue); }

.lcard__media {
  flex: none;
  width: 100%;
  margin-top: auto;              /* sits at the foot however tall the copy runs */
  /* The design's 300x188 picture, kept as a ratio rather than a fixed height.
     At 188px tall a card stretched to a 358px phone became 1.90:1 against the
     1.57:1 artwork, so `cover` ate the bottom of every image. */
  aspect-ratio: 300 / 188;
  height: auto;
  object-fit: cover;
}
.lcard__media--empty { display: block; background: var(--c-neutral-400); }

.lcard:hover .lcard__title { text-decoration: underline; }
.lcard:hover { background: #ededed; }
.lcard:focus-visible { outline: 2px solid var(--c-blue); outline-offset: 2px; }
</style>
