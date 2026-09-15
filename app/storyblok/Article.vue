<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const date = computed(() => {
  if (!props.blok.date) return ''
  return new Date(props.blok.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
})
</script>

<template>
  <article v-editable="blok">
    <header class="section article-head" data-theme="light">
      <div class="container container--narrow stack">
        <p class="article-head__meta caption">
          <span v-if="date">{{ date }}</span>
          <span v-if="blok.article_type" class="article-head__tag">{{ blok.article_type }}</span>
          <span v-if="blok.location">{{ blok.location }}</span>
        </p>
        <h1>{{ blok.title }}</h1>
        <p v-if="blok.excerpt" class="article-head__excerpt">{{ blok.excerpt }}</p>
      </div>
      <img
        v-if="blok.image?.filename"
        :src="blok.image.filename"
        :alt="blok.image.alt || ''"
        class="article-head__image container"
      >
    </header>

    <StoryblokComponent v-for="section in blok.body || []" :key="section._uid" :blok="section" />
  </article>
</template>

<style scoped>
.article-head__meta { display: flex; flex-wrap: wrap; gap: var(--space-3); color: var(--ink-muted); text-transform: capitalize; }
.article-head__tag { border: 1px solid var(--border); border-radius: 4px; padding: 0 var(--space-2); }
.article-head__excerpt { font-size: var(--t-h6); color: var(--ink-muted); }
.article-head__image { margin-top: var(--space-6); border-radius: var(--radius); }
</style>
