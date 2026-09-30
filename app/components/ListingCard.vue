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

const localePath = useLocalePath()
const { locale, locales } = useI18n()

const content = computed(() => props.story.content || {})
const href = computed(() => localePath(`/${props.story.full_slug}`))

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
</script>

<template>
  <NuxtLink :to="href" class="lcard">
    <div class="lcard__text">
      <p class="lcard__meta">
        <span class="lcard__date">{{ date }}</span>
        <span v-if="tags.length" class="lcard__tags">
          <span v-for="tag in tags" :key="tag" class="lcard__tag">{{ tag }}</span>
        </span>
      </p>
      <h3 class="lcard__title">{{ content.title || story.name }}</h3>
      <p class="lcard__excerpt">{{ content.excerpt }}</p>
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
  </NuxtLink>
</template>

<style scoped>
.lcard {
  display: flex;
  flex-direction: column;
  height: 398px;
  background: #f4f4f4;                 /* the design's card grey */
  color: var(--c-darkblue);
  text-decoration: none;
}
/* 210px of text: 21 above the meta row, 23 to the title, 22 to the excerpt and
   20 left under it before the photograph. */
.lcard__text {
  flex: none;
  height: 210px;
  padding: 21px 20px 20px;
}

/* Date and chips share one 28px row: the chip height sets it, and centring both
   puts the 12px date's baseline within a pixel of the 13px chip label's. */
.lcard__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 28px;
  margin: 0;
}
.lcard__date { font-size: 0.75rem; font-weight: 400; line-height: 1.2; white-space: nowrap; }
.lcard__tags { display: flex; gap: 6px; }
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
.lcard__title {
  display: -webkit-box;
  height: 58px;
  margin: 23px 0 0;
  overflow: hidden;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 29px;
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

.lcard__media {
  flex: none;
  width: 100%;
  height: 188px;
  object-fit: cover;
}
.lcard__media--empty { display: block; background: var(--c-neutral-400); }

.lcard:hover .lcard__title { text-decoration: underline; }
.lcard:hover { background: #ededed; }
.lcard:focus-visible { outline: 2px solid var(--c-blue); outline-offset: 2px; }
</style>
