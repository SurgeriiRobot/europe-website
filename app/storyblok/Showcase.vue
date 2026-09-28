<script setup lang="ts">
// Figma 991:18641-43 + "Desktop Shurui Carousel": a centre-axis lead line, the
// active product as a cut-out over its watermark word in 220px Lora (#f4f4f4,
// behind the image), the other two slides as side navigation (chevron + name, a
// hairline toward the product on each side), then a centred title.
const props = defineProps<{ blok: any }>()

const items = computed<any[]>(() => props.blok.items || [])
const index = ref(Math.min(Math.max(Number(props.blok.start) || 0, 0), Math.max(items.value.length - 1, 0)))
const current = computed(() => items.value[index.value])

// The side navigation offers the two other slides in list order — the nearest
// window of three around the current one. With Console / Instruments / Patient
// cart that gives exactly the design's three states:
//   Console      -> ‹ Instruments       Patient cart ›
//   Instruments  -> ‹ Surgeon Console   Patient cart ›
//   Patient cart -> ‹ Surgeon Console   Instruments ›
const neighbours = computed(() => {
  const n = items.value.length
  const i = index.value
  if (n < 2) return [] as number[]
  if (n === 2) return [1 - i]
  const lo = Math.min(Math.max(i - 1, 0), n - 3)
  return [lo, lo + 1, lo + 2].filter(j => j !== i)
})
// Two neighbours fill both sides; a lone one (two-slide showcase) sits on the
// side it lies in the list.
const leftIndex = computed(() => {
  const [a, b] = neighbours.value
  if (b !== undefined) return a
  return a !== undefined && a < index.value ? a : undefined
})
const rightIndex = computed(() => {
  const [a, b] = neighbours.value
  if (b !== undefined) return b
  return a !== undefined && a > index.value ? a : undefined
})
const prev = computed(() => (leftIndex.value === undefined ? undefined : items.value[leftIndex.value]))
const next = computed(() => (rightIndex.value === undefined ? undefined : items.value[rightIndex.value]))

const sbHref = useSbUrl()

// Product shots: one srcset for the visible slide and the preloads, so the
// browser picks the same file for both.
const srcset = (image: any) => `${sbCrop(image, 1440)} 1440w, ${sbCrop(image, 2280)} 2280w`
const SIZES = '(max-width: 720px) 128vw, min(76vw, 1094px)'

// Once the page is idle, fetch the other slides' images so switching is instant.
onMounted(() => {
  const idle = (window as any).requestIdleCallback || ((cb: () => void) => window.setTimeout(cb, 1500))
  idle(() => items.value.forEach((item, i) => {
    if (i === index.value || !item.image?.filename) return
    const img = new Image()
    img.sizes = SIZES
    img.srcset = srcset(item.image)
  }))
})

// Slides travel the way you navigate: the right-hand link brings its product in
// from the right, the left-hand one from the left.
const direction = ref<'next' | 'prev'>('next')
const go = (i: number | undefined, from: 'next' | 'prev') => {
  if (i === undefined || i < 0 || i >= items.value.length || i === index.value) return
  direction.value = from
  index.value = i
}
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section showcase"
    :data-theme="blok.theme || 'light'"
    aria-roledescription="carousel"
    :aria-label="current?.name"
    @keydown.left="go(leftIndex, 'prev')"
    @keydown.right="go(rightIndex, 'next')"
  >
    <SectionConnector :connector="blok.connector" />
    <span class="showcase__lead" aria-hidden="true" />

    <div v-if="current" class="showcase__stage">
      <Transition :name="`showcase-${direction}`">
        <div :key="current._uid" v-editable="current" class="showcase__slide">
          <p
            class="showcase__word display-word"
            :style="{ '--chars': (current.watermark || current.name || '').length }"
            aria-hidden="true"
          >
            {{ current.watermark || current.name }}
          </p>
          <img
            v-if="current.image?.filename"
            :src="sbCrop(current.image, 2280)"
            :srcset="srcset(current.image)"
            :sizes="SIZES"
            :alt="current.image.alt || current.name"
            class="showcase__image"
            loading="lazy"
          >
        </div>
      </Transition>

      <button v-if="prev" type="button" class="showcase__nav showcase__nav--prev" @click="go(leftIndex, 'prev')">
        <Icon name="chevron-left" :size="20" />
        <span>{{ prev.name }}</span>
      </button>
      <span v-if="prev" class="showcase__rule showcase__rule--prev" aria-hidden="true" />
      <span v-if="next" class="showcase__rule showcase__rule--next" aria-hidden="true" />
      <button v-if="next" type="button" class="showcase__nav showcase__nav--next" @click="go(rightIndex, 'next')">
        <span>{{ next.name }}</span>
        <Icon name="chevron-right" :size="20" />
      </button>
    </div>

    <div v-if="current" class="container showcase__text" aria-live="polite">
      <!-- Every slide's copy is stacked invisibly in the same cell, so the area
           keeps the tallest slide's height and the page never jumps on switch. -->
      <div class="showcase__copies">
        <div v-for="item in items" :key="`size-${item._uid}`" class="showcase__copy showcase__copy--sizer" aria-hidden="true">
          <SectionTitle :headline="item.headline" :body="item.body" />
          <span v-if="item.link?.cached_url || item.link?.url" class="showcase__more">Learn more</span>
        </div>
        <Transition name="showcase-text" mode="out-in">
          <div :key="current._uid" class="showcase__copy">
            <SectionTitle :headline="current.headline" :body="current.body" />
            <NuxtLink v-if="current.link?.cached_url || current.link?.url" :to="sbHref(current.link)" class="showcase__more">
              Learn more
            </NuxtLink>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.showcase { padding: clamp(140px, calc(20.8 * var(--sx)), 300px) 0 clamp(140px, calc(21.5 * var(--sx)), 310px); overflow: hidden; }

/* The 100px line on the centre axis, 101px into the lead-in space. */
.showcase__lead {
  position: absolute;
  left: 50%;
  top: 101px;
  height: 100px;
  border-left: var(--line-w) solid var(--line);
}

.showcase__stage {
  position: relative;
  height: calc(42.43 * var(--sx));                 /* 611/1440 */
}
.showcase__slide { position: absolute; inset: 0; }

.showcase__word {
  position: absolute;
  left: 50%;
  top: 51.9%;                      /* 317 of the 611 stage */
  margin: 0;
  translate: -50% 0;
  font-size: calc(15.28 * var(--sx));              /* 220/1440 */
  line-height: 1.2;
  color: #f4f4f4;
  pointer-events: none;
  user-select: none;
}
/* Every slide's cut-out is 1089px wide (the design frame) at its natural height,
   standing on a line 44px above the stage bottom, just over the side navigation.
   Where the product sits inside that frame is part of the image itself (console,
   instruments and patient cart were prepared that way from the carousel design),
   so any product shot drops in without per-slide settings. */
.showcase__image {
  position: absolute;
  left: 50%;
  bottom: calc(3.04 * var(--sx));
  width: calc(75.63 * var(--sx));
  max-width: none;
  height: auto;
  translate: -50% 0;
  /* Figma lays a soft shadow under the product (~16px, grey to white). */
  filter: drop-shadow(0 6px 9px rgb(0 0 0 / 32%));
}

/* Chevron + name. The left chevron's ink starts on the 75px gutter; both sit
   16px from their label (Figma ink: 75 / 106-220 and 1221-1364 / 1389). */
.showcase__nav {
  position: absolute;
  bottom: calc(0.97 * var(--sx));
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
  border: 0;
  background: none;
  font-size: clamp(1rem, calc(1.39 * var(--sx)), 1.25rem);
  font-weight: 600;
  line-height: 1.2;
  color: var(--c-blue);
  cursor: pointer;
  transition: color 150ms ease;
}
.showcase__nav:hover span { text-decoration: underline; }
.showcase__nav .icon { transition: translate 200ms ease; }
.showcase__nav--prev:hover .icon { translate: -3px 0; }
.showcase__nav--next:hover .icon { translate: 3px 0; }
/* Offsets are from the centred 1440 frame, so wide screens keep the layout. */
.showcase__nav--prev { left: calc(var(--frame-x) + 4.74 * var(--sx)); }
.showcase__nav--next { right: calc(var(--frame-x) + 2.65 * var(--sx)); }
/* A hairline on each side, running from the label toward the product. */
.showcase__rule {
  position: absolute;
  top: calc(40.07 * var(--sx));                    /* y3107, 577 into the stage */
  border-top: var(--line-w) solid var(--line);
  pointer-events: none;
}
.showcase__rule--prev { left: calc(var(--frame-x) + 19.31 * var(--sx)); width: calc(10.9 * var(--sx)); }    /* 278-435 */
.showcase__rule--next { left: calc(var(--frame-x) + 70.42 * var(--sx)); width: calc(12.22 * var(--sx)); }   /* 1014-1190 */

.showcase__text { padding-top: 120px; }
.showcase__copies { display: grid; }
.showcase__copies > * { grid-area: 1 / 1; }
.showcase__copy { display: grid; align-content: start; justify-items: center; gap: 24px; }
.showcase__copy--sizer { visibility: hidden; }
.showcase-text-enter-active { transition: opacity 280ms ease, transform 360ms cubic-bezier(0.22, 1, 0.36, 1); }
.showcase-text-leave-active { transition: opacity 160ms ease; }
.showcase-text-enter-from { opacity: 0; transform: translateY(8px); }
.showcase-text-leave-to { opacity: 0; }
.showcase__text :deep(.sec-title) { max-width: 453px; }
.showcase__more { color: var(--c-blue); font-weight: 500; }

/* Outgoing and incoming slides overlap (both are absolutely placed), so the
   stage never goes blank between products. */
.showcase-next-enter-active, .showcase-prev-enter-active {
  transition: opacity 420ms ease 80ms, transform 560ms cubic-bezier(0.22, 1, 0.36, 1);
}
.showcase-next-leave-active, .showcase-prev-leave-active {
  transition: opacity 260ms ease, transform 420ms cubic-bezier(0.4, 0, 1, 1);
}
.showcase-next-enter-from, .showcase-prev-leave-to { opacity: 0; transform: translateX(8%); }
.showcase-next-leave-to, .showcase-prev-enter-from { opacity: 0; transform: translateX(-8%); }

/* Phone (Figma "Mobile Shurui Landingpage", 390 wide; vw = px / 3.9): the lead
   line runs straight on from the statement above, the product bleeds past both
   edges at 497px, a 100px watermark, 18px side links without hairlines. */
@media (max-width: 720px) {
  .showcase { padding: 0 0 50.5vw; }                          /* 197 */
  .showcase__lead { top: 0; height: 80px; }
  .showcase__stage { height: 118.1vw; }                       /* 461: lead to side links */
  /* 100px, but a long word shrinks to fit the width (Lora runs ~0.54em a letter),
     as the phone carousel design does with "Instruments". */
  .showcase__word { top: auto; bottom: 15vw; font-size: min(25.64vw, calc(97vw / (0.54 * var(--chars, 7)))); }
  .showcase__image { bottom: 18.2vw; width: 127.4vw; }        /* 497 wide */
  .showcase__nav { bottom: 0; font-size: 1.125rem; }
  .showcase__nav--prev { left: 12px; }
  .showcase__nav--next { right: 12px; }
  .showcase__rule { display: none; }
  .showcase__text { padding-top: 36px; }
}
</style>
