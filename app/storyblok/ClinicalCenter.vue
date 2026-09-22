<script setup lang="ts">
// A clinical centre is mostly data for the contact page's country list and map;
// this gives it a readable page of its own and something to edit against.
const props = defineProps<{ blok: any }>()
const sbHref = useSbUrl()
const website = computed(() => (props.blok.website?.url || props.blok.website?.cached_url ? sbHref(props.blok.website) : null))
</script>

<template>
  <article v-editable="blok" class="section centre" data-theme="light">
    <div class="container container--narrow centre__inner">
      <img v-if="blok.logo?.filename" :src="sbCrop(blok.logo, 0, 160)" :alt="blok.name" class="centre__logo" height="80">
      <h1 class="centre__name">{{ blok.name }}</h1>
      <p class="centre__place">
        <span v-if="blok.city">{{ blok.city }}</span>
        <span v-if="blok.city && blok.country"> · </span>
        <span v-if="blok.country">{{ blok.country }}</span>
      </p>
      <ul v-if="blok.specialties?.length" class="centre__tags">
        <li v-for="tag in blok.specialties" :key="tag">{{ tag }}</li>
      </ul>
      <a v-if="website" :href="website" class="centre__link" target="_blank" rel="noopener">Visit website</a>
    </div>
  </article>
</template>

<style scoped>
.centre { padding-block: var(--space-9); }
.centre__inner { display: grid; justify-items: center; gap: var(--space-3); text-align: center; }
.centre__logo { object-fit: contain; }
.centre__name { font-size: var(--t-h3); }
.centre__place { color: var(--ink-muted); }
.centre__tags { display: flex; flex-wrap: wrap; gap: var(--space-2); margin: 0; padding: 0; list-style: none; }
.centre__tags li { border: 1px solid var(--border); border-radius: 4px; padding: 0 var(--space-2); font-size: var(--t-caption); text-transform: capitalize; }
.centre__link { color: var(--accent); font-weight: 500; }
</style>
