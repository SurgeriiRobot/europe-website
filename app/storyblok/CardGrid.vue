<script setup lang="ts">
// SP Robot "System composition" (variant "info", Figma 6254-7665) and "Go deeper"
// (variant "link", 11353-12523): a centred title, then three 335px cards 32px
// apart. Phones: info cards become a swipeable row with page dots above it;
// link cards stack, centred.
const props = defineProps<{ blok: any }>()
const items = computed<any[]>(() => props.blok.items || [])
const variant = computed<'info' | 'link'>(() => (props.blok.variant === 'link' ? 'link' : 'info'))

const track = ref<HTMLElement>()
const active = ref(0)
function onScroll() {
  const el = track.value
  if (!el) return
  const cards = Array.from(el.children) as HTMLElement[]
  let best = 0
  let bestDist = Infinity
  cards.forEach((card, i) => {
    const d = Math.abs(card.offsetLeft - el.scrollLeft - 16)
    if (d < bestDist) { bestDist = d; best = i }
  })
  active.value = best
}
function goTo(i: number) {
  const card = track.value?.children[i] as HTMLElement | undefined
  if (card && track.value) track.value.scrollTo({ left: card.offsetLeft - 16, behavior: 'smooth' })
}
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section cards"
    :class="`cards--${variant}`"
    :data-theme="blok.theme || 'light'"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="container">
      <SectionTitle :headline="blok.headline" :lines="blok.title_lines" />
    </div>
    <div v-if="variant === 'info' && items.length > 1" class="cards__dots" role="tablist" :aria-label="blok.headline || 'Cards'">
      <button
        v-for="(item, i) in items"
        :key="item._uid"
        type="button"
        role="tab"
        class="cards__dot"
        :class="{ 'is-active': active === i }"
        :aria-selected="active === i"
        :aria-label="item.title"
        @click="goTo(i)"
      />
    </div>
    <div ref="track" class="cards__grid" @scroll.passive="onScroll">
      <StoryblokComponent v-for="item in items" :key="item._uid" :blok="item" :variant="variant" />
    </div>
  </section>
</template>

<style scoped>
.cards { overflow: hidden; }
.cards--info { padding: calc(24.93 * var(--sx)) 0 calc(10.76 * var(--sx)); }   /* 359 / 155 */
.cards--link { padding: calc(16.67 * var(--sx)) 0 calc(20.76 * var(--sx)); }   /* 240 / 299 */
.cards :deep(.sec-title) { max-width: 746px; }

.cards__grid {
  display: grid;
  grid-template-columns: repeat(3, calc(23.26 * var(--sx)));                  /* 335 */
  justify-content: center;
  align-items: start;
  gap: calc(2.22 * var(--sx));                                                /* 32 */
  margin-top: calc(4.86 * var(--sx));                                         /* 70 to the images */
}
.cards--link .cards__grid { margin-top: calc(5.69 * var(--sx)); }             /* 82: SP Robot 81, System Principles 82, Instruments Ecosystem 83 */
.cards__dots { display: none; }

@media (max-width: 720px) {
  .cards--info { padding: 158px 0 78px; }
  .cards--link { padding: 197px 0; }
  .cards--info .cards__dots { display: flex; justify-content: center; gap: 6px; margin-top: 83px; }
  .cards__dot {
    width: 30px;
    height: 5px;
    padding: 0;
    border: 0;
    border-radius: 1px;
    background: rgb(3 4 94 / 30%);
    cursor: pointer;
    transition: width 200ms ease, background-color 200ms ease;
  }
  .cards__dot.is-active { width: 44px; background: var(--c-blue); }
  /* Composition: a row of 321px cards 16px apart, snapping to the gutter. */
  .cards--info .cards__grid {
    display: flex;
    justify-content: flex-start;              /* centred overflow could not be scrolled back to */
    gap: 16px;
    margin-top: 32px;
    padding: 0 16px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 16px;
    scrollbar-width: none;
  }
  .cards--info .cards__grid::-webkit-scrollbar { display: none; }
  .cards--info .cards__grid > * { flex: 0 0 82.3vw; scroll-snap-align: start; }
  /* Go deeper: one card to a row, 358 wide, 60px apart. */
  .cards--link .cards__grid { grid-template-columns: minmax(0, 358px); gap: 60px; margin-top: 60px; padding-inline: 16px; }
}
</style>
