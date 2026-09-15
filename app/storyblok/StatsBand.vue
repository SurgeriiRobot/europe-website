<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section stats" :data-theme="blok.theme || 'brand'">
    <div class="container stats__inner">
      <h2 v-if="blok.headline" class="stats__headline">{{ blok.headline }}</h2>
      <p v-if="blok.intro" class="stats__intro">{{ blok.intro }}</p>

      <div class="stats__grid">
        <StoryblokComponent v-for="item in blok.items || []" :key="item._uid" :blok="item" />
      </div>

      <div v-if="blok.buttons?.length" class="stats__actions">
        <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats__inner { display: grid; justify-items: center; gap: var(--space-5); text-align: center; }
.stats__headline { font-size: var(--t-h2); }
.stats__intro { max-width: 62ch; color: var(--ink-muted); }
.stats__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: var(--space-6);
  width: 100%;
  margin-block: var(--space-4);
}
.stats__actions { display: flex; flex-wrap: wrap; gap: var(--space-3); }
</style>
