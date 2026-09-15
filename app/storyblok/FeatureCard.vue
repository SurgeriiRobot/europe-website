<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const sbHref = useSbUrl()
const href = computed(() => (props.blok.link ? sbHref(props.blok.link) : null))
</script>

<template>
  <component
    :is="href ? 'NuxtLink' : 'article'"
    v-editable="blok"
    :to="href || undefined"
    class="card"
    :data-theme="blok.theme || 'light'"
  >
    <img v-if="blok.media?.filename" :src="blok.media.filename" :alt="blok.media.alt || ''" class="card__media" loading="lazy">
    <div class="card__body">
      <h3 class="card__title">{{ blok.title }}</h3>
      <p v-if="blok.body" class="card__text">{{ blok.body }}</p>
    </div>
  </component>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  color: var(--ink);
  border-radius: var(--radius);
  overflow: hidden;
  text-decoration: none;
  min-height: 18rem;
}
.card__media { width: 100%; height: 100%; object-fit: cover; flex: 1; }
.card__body { padding: var(--space-5); }
.card__title { font-size: var(--t-h4); margin-bottom: var(--space-2); }
.card__text { font-size: var(--t-body-sm); color: var(--ink-muted); }
</style>
