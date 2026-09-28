<script setup lang="ts">
// "row": centred, 100px apart. "marquee": a continuous scroll (the design shows
// the row overflowing both edges); the list is doubled so the loop is seamless.
// Phones (both layouts, Figma "Mobile Shurui Landingpage"): a swipeable row of
// 87px slots 38px apart, two logos to a page, with page dots underneath.
const props = defineProps<{ blok: any }>()
const logos = computed<any[]>(() => props.blok.logos || [])
const marquee = computed(() => props.blok.layout === 'marquee')

const PAGE = 250                     // two 87px slots and two 38px gaps
const pages = computed(() => Math.ceil(logos.value.length / 2))
const slider = ref<HTMLElement>()
const page = ref(0)
const onSlide = () => { if (slider.value) page.value = Math.round(slider.value.scrollLeft / PAGE) }
const goTo = (p: number) => slider.value?.scrollTo({ left: p * PAGE, behavior: 'smooth' })
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
      <div ref="slider" class="group__slider" @scroll.passive="onSlide">
        <ul class="group__slides">
          <li v-for="logo in logos" :key="`m-${logo._uid}`"><StoryblokComponent :blok="logo" /></li>
        </ul>
      </div>
      <div v-if="pages > 1" class="group__dots" role="tablist" :aria-label="blok.title || 'Logos'">
        <button
          v-for="p in pages"
          :key="p"
          type="button"
          role="tab"
          class="group__dot"
          :class="{ 'is-active': page === p - 1 }"
          :aria-selected="page === p - 1"
          :aria-label="`Page ${p}`"
          @click="goTo(p - 1)"
        />
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

.group__mobile { display: none; }

@media (max-width: 720px) {
  .group { padding-bottom: 112px; }
  .group:last-child { padding-bottom: 189px; }
  .group__title { margin-bottom: 80px; padding-inline: 16px; }
  .group__viewport, .group__row { display: none; }
  .group__mobile { display: block; }

  /* The first two logos sit centred; each swipe moves on by a page of two. */
  .group__slider {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: calc(50% - 106px);
    scrollbar-width: none;
  }
  .group__slider::-webkit-scrollbar { display: none; }
  .group__slides {
    display: flex;
    gap: 38px;
    width: max-content;
    margin: 0;
    padding: 0 calc(50vw - 106px);
    list-style: none;
  }
  .group__slides li { display: flex; flex: none; justify-content: center; width: 87px; }
  .group__slides li:nth-child(odd) { scroll-snap-align: start; }
  /* Phones fit every logo inside an 87x73 box (the per-logo desktop size is off). */
  .group__slides :deep(.logo) { min-width: 0; height: 73px; }
  .group__slides :deep(.logo img) { height: auto; max-width: 87px; max-height: 73px; }

  .group__dots { display: flex; justify-content: center; gap: 6px; margin-top: 55px; }
  .group__dot {
    width: 30px;
    height: 5px;
    padding: 0;
    border: 0;
    border-radius: 1px;
    background: rgb(3 4 94 / 30%);
    cursor: pointer;
    transition: width 200ms ease, background-color 200ms ease;
  }
  .group__dot.is-active { width: 44px; background: var(--c-blue); }
}
</style>
