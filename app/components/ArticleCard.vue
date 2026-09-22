<script setup lang="ts">
// variant "slide" (Figma news cards): 630x400 image with 24px radius, then a row
// of title (Inter 600 24/29 blue) over location + excerpt (300 18/29), and an
// outlined button 34px to the right. variant "tile": the compact listing card.
const props = withDefaults(defineProps<{ story: any, variant?: 'tile' | 'slide' }>(), { variant: 'tile' })
const localePath = useLocalePath()
const content = computed(() => props.story.content || {})
const href = computed(() => localePath(`/${props.story.full_slug}`))
const date = computed(() => {
  const raw = content.value.date
  if (!raw) return ''
  return new Date(raw).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
})
// The design's button leads to the listing filtered to the card's type.
const more = computed(() => {
  const type = content.value.article_type
  if (type === 'event') return { label: 'All events', to: { path: localePath('/news-events'), query: { type: 'event' } } }
  if (type === 'news') return { label: 'All news', to: { path: localePath('/news-events'), query: { type: 'news' } } }
  return { label: 'Read more', to: href.value }
})
</script>

<template>
  <article v-if="variant === 'slide'" class="slide-card">
    <NuxtLink :to="href" class="slide-card__media" tabindex="-1" aria-hidden="true">
      <img
        v-if="content.image?.filename"
        :src="sbCrop(content.image, 1260, 800)"
        :srcset="`${sbCrop(content.image, 630, 400)} 630w, ${sbCrop(content.image, 1260, 800)} 1260w`"
        sizes="(max-width: 730px) 86vw, 630px"
        :alt="content.image.alt || ''"
        loading="lazy"
      >
    </NuxtLink>
    <div class="slide-card__row">
      <div class="slide-card__text">
        <h3 class="slide-card__title"><NuxtLink :to="href"><BrandText :text="content.title || story.name" /></NuxtLink></h3>
        <p class="slide-card__body">
          <template v-if="content.location">{{ content.location }}<br></template>
          {{ content.excerpt }}
        </p>
      </div>
      <NuxtLink :to="more.to" class="slide-card__more">{{ more.label }}</NuxtLink>
    </div>
  </article>

  <NuxtLink v-else :to="href" class="article-card">
    <p class="article-card__meta caption">
      <span>{{ date }}</span>
      <span v-if="content.article_type" class="article-card__tag">{{ content.article_type }}</span>
      <span v-for="tag in content.specialties || []" :key="tag" class="article-card__tag">{{ tag }}</span>
    </p>
    <h3 class="article-card__title">{{ content.title || story.name }}</h3>
    <p v-if="content.excerpt" class="article-card__excerpt">{{ content.excerpt }}</p>
    <img v-if="content.image?.filename" :src="sbCrop(content.image, 640, 480)" :alt="content.image.alt || ''" class="article-card__image" loading="lazy">
  </NuxtLink>
</template>

<style scoped>
.slide-card__media { display: block; aspect-ratio: 630 / 400; overflow: hidden; border-radius: 24px; background: var(--c-neutral-300); }
.slide-card__media img { width: 100%; height: 100%; object-fit: cover; }
.slide-card__row { display: flex; align-items: flex-start; justify-content: space-between; gap: 34px; margin-top: 32px; padding-inline: 34px 0; }
.slide-card__text { display: grid; gap: 24px; max-width: 403px; }
.slide-card__title { margin: 0; font-size: 1.5rem; font-weight: 600; line-height: 1.2083; }
.slide-card__title a { color: var(--c-blue); text-decoration: none; }
.slide-card__title a:hover { text-decoration: underline; }
.slide-card__body { margin: 0; font-size: 1.125rem; font-weight: 300; line-height: 1.6111; color: var(--c-darkblue); }
.slide-card__more {
  flex: none;
  padding: 7px 21px;
  border: 1px solid var(--c-blue);
  border-radius: 4px;
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.625rem;
  letter-spacing: 0.46px;
  color: var(--c-blue);
  text-decoration: none;
  white-space: nowrap;
}
.slide-card__more:hover { background: rgb(7 69 254 / 6%); }
@media (max-width: 640px) {
  .slide-card__row { flex-direction: column; gap: 20px; padding-inline: 0; }
}

.article-card { display: flex; flex-direction: column; gap: var(--space-2); text-decoration: none; color: inherit; }
.article-card__meta { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); color: var(--ink-muted); }
.article-card__tag { border: 1px solid var(--border); border-radius: 4px; padding: 0 var(--space-2); text-transform: capitalize; }
.article-card__title { font-size: var(--t-h6); }
.article-card__excerpt { font-size: var(--t-body-sm); color: var(--ink-muted); }
.article-card__image { margin-top: auto; aspect-ratio: 4 / 3; object-fit: cover; width: 100%; border-radius: var(--radius); }
</style>
