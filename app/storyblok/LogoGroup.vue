<script setup lang="ts">
// "row": centred, 100px apart. "marquee": a continuous scroll (the design shows
// the row overflowing both edges); the list is doubled so the loop is seamless.
const props = defineProps<{ blok: any }>()
const logos = computed<any[]>(() => props.blok.logos || [])
const marquee = computed(() => props.blok.layout === 'marquee')
</script>

<template>
  <div v-editable="blok" class="group" :class="{ 'group--marquee': marquee }">
    <p v-if="blok.title" class="group__title">{{ blok.title }}</p>

    <div v-if="marquee" class="group__viewport">
      <ul class="group__track">
        <li v-for="logo in logos" :key="logo._uid"><StoryblokComponent :blok="logo" /></li>
        <li v-for="logo in logos" :key="`dup-${logo._uid}`" aria-hidden="true"><StoryblokComponent :blok="logo" /></li>
      </ul>
    </div>
    <ul v-else class="group__row">
      <li v-for="logo in logos" :key="logo._uid"><StoryblokComponent :blok="logo" /></li>
    </ul>
  </div>
</template>

<style scoped>
.group { padding-bottom: clamp(96px, 16.7vw, 240px); }
.group__title {
  margin: 0 0 clamp(40px, 5.6vw, 80px);
  padding-inline: var(--gutter);
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  text-transform: uppercase;
  color: var(--ink);
}
.group__row, .group__track { display: flex; align-items: center; margin: 0; padding: 0; list-style: none; }
.group__row { flex-wrap: wrap; justify-content: center; gap: 40px 100px; padding-inline: var(--gutter); }

.group__viewport { overflow: hidden; }
.group__track { gap: 90px; width: max-content; animation: marquee 45s linear infinite; }
.group__track li { flex: none; }
/* flex items, so no inline line box adds height under the 86px logos */
.group__row li, .group__track li { display: flex; }
.group__viewport:hover .group__track { animation-play-state: paused; }
@keyframes marquee {
  to { transform: translateX(calc(-50% - 45px)); }   /* one full copy + half a gap */
}
@media (prefers-reduced-motion: reduce) {
  .group__track { animation: none; flex-wrap: wrap; justify-content: center; width: auto; gap: 40px 90px; padding-inline: var(--gutter); }
  .group__track li[aria-hidden='true'] { display: none; }
}
</style>
