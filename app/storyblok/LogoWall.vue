<script setup lang="ts">
// Figma 991:18650-51, 994:16146/16505 on the #e2e2e2 field: 300px lead-in, title
// with hairlines, then each group — an Inter 600 20/24 caption, 80px, an 86px
// logo row, 240px.
defineProps<{ blok: any }>()
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section logos" :data-theme="blok.theme || 'muted'">
    <SectionConnector :connector="blok.connector" />
    <div class="container">
      <SectionTitle :headline="blok.headline" :lines="blok.title_lines" />
    </div>
    <StoryblokComponent v-for="group in blok.groups || []" :key="group._uid" :blok="group" />
  </section>
</template>

<style scoped>
.logos { padding: clamp(120px, 20.8vw, 300px) 0 0; }
.logos :deep(.sec-title) { max-width: 746px; margin-bottom: 24px; }
</style>
