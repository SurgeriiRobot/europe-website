<script setup lang="ts">
// Figma 991:18679 ("CE marked"): centred title and body 32px apart on the grey
// field, 226px above and 300px below.
defineProps<{ blok: any }>()
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section notice" :data-theme="blok.theme || 'muted'">
    <SectionConnector :connector="blok.connector" />
    <div class="container">
      <img v-if="blok.icon?.filename" :src="sbCrop(blok.icon, 0, 96)" alt="" class="notice__icon" height="48">
      <SectionTitle :headline="blok.headline" :body="blok.body" />
    </div>
  </section>
</template>

<style scoped>
.notice { padding: clamp(120px, 15.7vw, 226px) 0 clamp(140px, 20.8vw, 300px); }
.notice :deep(.sec-title) { gap: 32px; }
.notice__icon { display: block; margin: 0 auto 24px; }
</style>
