<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const sbHref = useSbUrl()
const href = computed(() => (props.blok.link ? sbHref(props.blok.link) : null))
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section quote" :data-theme="blok.theme || 'dark'">
    <div class="container quote__inner">
      <figure class="quote__figure">
        <blockquote class="quote__text">“{{ blok.quote }}”</blockquote>
        <figcaption class="quote__author">
          <span class="quote__name">{{ blok.author }}</span>
          <span v-if="blok.role" class="quote__role caption">{{ blok.role }}</span>
          <NuxtLink v-if="href" :to="href" class="quote__link caption">Read more</NuxtLink>
        </figcaption>
      </figure>
      <img v-if="blok.portrait?.filename" :src="blok.portrait.filename" :alt="blok.author || ''" class="quote__portrait" loading="lazy">
    </div>
  </section>
</template>

<style scoped>
.quote__inner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: var(--space-6);
  align-items: center;
}
.quote__figure { margin: 0; }
.quote__text { margin: 0 0 var(--space-5); font-size: var(--t-h5); line-height: 1.5; }
.quote__author { display: grid; gap: var(--space-1); }
.quote__name { font-weight: var(--w-semibold); }
.quote__role { color: var(--ink-muted); }
.quote__portrait { border-radius: var(--radius); width: 100%; object-fit: cover; }
</style>
