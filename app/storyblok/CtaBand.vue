<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const bg = computed(() => props.blok.background?.filename)
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section cta"
    :data-theme="blok.theme || 'dark'"
    :class="{ 'cta--has-bg': bg }"
  >
    <img v-if="bg" :src="bg" :alt="blok.background.alt || ''" class="cta__bg" loading="lazy">
    <div class="container cta__inner stack">
      <h2 class="cta__headline">{{ blok.headline }}</h2>
      <p v-if="blok.body" class="cta__body">{{ blok.body }}</p>
      <div v-if="blok.buttons?.length" class="cta__actions">
        <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta { position: relative; isolation: isolate; }
.cta--has-bg { min-height: clamp(18rem, 34vw, 28rem); display: grid; align-items: center; }
.cta__bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2; }
.cta--has-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, rgb(3 4 94 / 78%) 0%, rgb(3 4 94 / 15%) 65%, transparent 100%);
}
.cta__inner { max-width: 40ch; }
.cta__headline { font-size: var(--t-h2); }
.cta__actions { display: flex; flex-wrap: wrap; gap: var(--space-3); }
</style>
