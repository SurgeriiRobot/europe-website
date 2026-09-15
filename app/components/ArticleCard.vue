<script setup lang="ts">
const props = defineProps<{ story: any }>()
const localePath = useLocalePath()
const content = computed(() => props.story.content || {})
const date = computed(() => {
  const raw = content.value.date
  if (!raw) return ''
  return new Date(raw).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
})
</script>

<template>
  <NuxtLink :to="localePath(`/${story.full_slug}`)" class="article-card">
    <p class="article-card__meta caption">
      <span>{{ date }}</span>
      <span v-if="content.article_type" class="article-card__tag">{{ content.article_type }}</span>
      <span v-for="tag in content.specialties || []" :key="tag" class="article-card__tag">{{ tag }}</span>
    </p>
    <h3 class="article-card__title">{{ content.title || story.name }}</h3>
    <p v-if="content.excerpt" class="article-card__excerpt">{{ content.excerpt }}</p>
    <img v-if="content.image?.filename" :src="content.image.filename" :alt="content.image.alt || ''" class="article-card__image" loading="lazy">
  </NuxtLink>
</template>

<style scoped>
.article-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  text-decoration: none;
  color: inherit;
}
.article-card__meta { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); color: var(--ink-muted); }
.article-card__tag { border: 1px solid var(--border); border-radius: 4px; padding: 0 var(--space-2); text-transform: capitalize; }
.article-card__title { font-size: var(--t-h6); }
.article-card__excerpt { font-size: var(--t-body-sm); color: var(--ink-muted); }
.article-card__image { margin-top: auto; aspect-ratio: 4 / 3; object-fit: cover; width: 100%; border-radius: var(--radius); }
</style>
