<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const bg = computed(() => props.blok.background?.filename)
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section section--flush hero-full"
    :data-theme="blok.theme || 'dark'"
    :class="`hero-full--${blok.overlay || 'left'}`"
  >
    <img v-if="bg" :src="bg" :alt="blok.background.alt || ''" class="hero-full__bg" loading="eager">
    <div class="container hero-full__inner">
      <div class="hero-full__text stack">
        <h1>{{ blok.headline }}</h1>
        <p v-if="blok.body" class="hero-full__body">{{ blok.body }}</p>
        <div v-if="blok.buttons?.length" class="hero-full__actions">
          <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-full { position: relative; display: grid; min-height: clamp(20rem, 46vw, 34rem); isolation: isolate; }
.hero-full__bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2; }
.hero-full::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
}
.hero-full--left::after { background: linear-gradient(90deg, rgb(3 4 94 / 75%) 0%, rgb(3 4 94 / 10%) 60%, transparent 100%); }
.hero-full--bottom::after { background: linear-gradient(0deg, rgb(3 4 94 / 80%) 0%, transparent 70%); }
.hero-full--full::after { background: rgb(3 4 94 / 55%); }
.hero-full--none::after { background: none; }
.hero-full__inner { display: flex; align-items: flex-end; padding-block: var(--space-8); }
.hero-full__text { max-width: 34ch; }
.hero-full__body { max-width: 46ch; }
.hero-full__actions { display: flex; flex-wrap: wrap; gap: var(--space-3); }
</style>
