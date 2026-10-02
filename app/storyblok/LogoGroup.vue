<script setup lang="ts">
// "row": centred, 100px apart. "marquee": a continuous scroll (the design shows
// the row overflowing both edges); the list is doubled so the loop is seamless.
// Phones: both layouts scroll by themselves, in 87px slots 38px apart. They
// used to be a swipeable row with page dots, but the dots read as a progress
// bar rather than a control, so the row now animates like the desktop marquee.
const props = defineProps<{ blok: any }>()
const logos = computed<any[]>(() => props.blok.logos || [])
const marquee = computed(() => props.blok.layout === 'marquee')
</script>

<template>
  <div v-editable="blok" class="group" :class="{ 'group--marquee': marquee }">
    <p v-if="blok.title" class="group__title">{{ blok.title }}</p>

    <div v-if="marquee" class="group__viewport">
      <ul class="group__track">
        <li v-for="logo in logos" :key="logo._uid"><StoryblokComponent :blok="logo" eager /></li>
        <li v-for="logo in logos" :key="`dup-${logo._uid}`" aria-hidden="true"><StoryblokComponent :blok="logo" eager /></li>
      </ul>
    </div>
    <ul v-else class="group__row">
      <li v-for="logo in logos" :key="logo._uid"><StoryblokComponent :blok="logo" /></li>
    </ul>

    <div class="group__mobile">
      <div class="group__viewport">
        <ul class="group__track">
          <li v-for="logo in logos" :key="`m-${logo._uid}`"><StoryblokComponent :blok="logo" eager /></li>
          <li v-for="logo in logos" :key="`md-${logo._uid}`" aria-hidden="true"><StoryblokComponent :blok="logo" eager /></li>
        </ul>
      </div>
    </div>
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
.group { --logo-gap: 90px; }
.group__row, .group__track { display: flex; align-items: center; margin: 0; padding: 0; list-style: none; }
.group__row { flex-wrap: wrap; justify-content: center; gap: 40px 100px; padding-inline: var(--gutter); }

.group__viewport { overflow: hidden; }
.group__track { gap: var(--logo-gap); width: max-content; animation: marquee 45s linear infinite; }
.group__track li { flex: none; }
/* flex items, so no inline line box adds height under the 86px logos */
.group__row li, .group__track li { display: flex; }
.group__viewport:hover .group__track { animation-play-state: paused; }
@keyframes marquee {
  to { transform: translateX(calc(-50% - var(--logo-gap) / 2)); }   /* one full copy + half a gap */
}
@media (prefers-reduced-motion: reduce) {
  .group__track { animation: none; flex-wrap: wrap; justify-content: center; width: auto; gap: 40px 90px; padding-inline: var(--gutter); }
  .group__track li[aria-hidden='true'] { display: none; }
}

.group__mobile { display: none; }

@media (max-width: 720px) {
  .group { padding-bottom: 112px; }
  .group:last-child { padding-bottom: 189px; }
  .group__title { margin-bottom: 80px; padding-inline: 16px; }
  /* Only the desktop row and marquee, which are direct children. The phone's
     own marquee lives inside .group__mobile and must stay visible. */
  .group > .group__viewport, .group > .group__row { display: none; }
  .group__mobile { display: block; }

  /* 87x73 slots, 38px apart, scrolling on their own. */
  .group { --logo-gap: 38px; }
  .group__slides li, .group__track li { display: flex; flex: none; justify-content: center; width: 87px; }
  .group__track :deep(.logo) { min-width: 0; height: 73px; }
  .group__track :deep(.logo img) { height: auto; max-width: 87px; max-height: 73px; }
}
</style>
