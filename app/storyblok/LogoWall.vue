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
.logos { --connector-len: max(60px, calc(6.94 * var(--sx))); padding: clamp(140px, calc(23.75 * var(--sx)), 342px) 0 0; }   /* 100px lead line; title 342px down */
.logos :deep(.sec-title) { max-width: 746px; margin-bottom: 24px; }
/* Phone design: a 40px lead line, the title 111px down, 25px to the first caption. */
@media (max-width: 720px) {
  .logos { --connector-len: 40px; padding-top: 111px; }
  .logos :deep(.sec-title) { margin-bottom: 25px; }
  /* The design leaves 97px under the first caption and 64px under the next. */
  .logos :deep(.group__title) { margin-bottom: 64px; }
  .logos :deep(.container + .group .group__title) { margin-bottom: 97px; }
}
</style>
