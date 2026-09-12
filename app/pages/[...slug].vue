<script setup lang="ts">
const route = useRoute()

const slug = (Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug) || 'home'

const { story, error } = await useAsyncStoryblok(slug, {
  api: { version: import.meta.dev ? 'draft' : 'published' },
})

if (error.value || !story.value?.content) {
  throw createError({ statusCode: 404, statusMessage: `Story "${slug}" not found`, fatal: true })
}

useHead({ title: story.value.name })
</script>

<template>
  <StoryblokComponent v-if="story?.content" :blok="story.content" />
</template>
