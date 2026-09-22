<script setup lang="ts">
// Figma 991:18641-43: a centre-axis lead line, the active product as a cut-out
// over its own name in 220px Lora (#f5f5f5, behind the image), neighbours as the
// side navigation, then a centred title. Instruments <- Console -> Surgical trolley.
const props = defineProps<{ blok: any }>()

const items = computed<any[]>(() => props.blok.items || [])
const index = ref(Math.min(Math.max(Number(props.blok.start ?? 1) || 0, 0), Math.max(items.value.length - 1, 0)))
const current = computed(() => items.value[index.value])
const prev = computed(() => items.value[index.value - 1])
const next = computed(() => items.value[index.value + 1])

const sbHref = useSbUrl()
const go = (i: number) => { if (i >= 0 && i < items.value.length) index.value = i }
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section showcase"
    :data-theme="blok.theme || 'light'"
    aria-roledescription="carousel"
    :aria-label="current?.name"
    @keydown.left="go(index - 1)"
    @keydown.right="go(index + 1)"
  >
    <SectionConnector :connector="blok.connector" />
    <span class="showcase__lead" aria-hidden="true" />

    <div v-if="current" class="showcase__stage">
      <Transition name="showcase-fade" mode="out-in">
        <div :key="current._uid" v-editable="current" class="showcase__slide">
          <p class="showcase__word display-word" aria-hidden="true">{{ current.name }}</p>
          <img
            v-if="current.image?.filename"
            :src="sbCrop(current.image, 2280)"
            :srcset="`${sbCrop(current.image, 1440)} 1440w, ${sbCrop(current.image, 2280)} 2280w`"
            sizes="76vw"
            :alt="current.image.alt || current.name"
            class="showcase__image"
            loading="lazy"
          >
        </div>
      </Transition>

      <button v-if="prev" type="button" class="showcase__nav showcase__nav--prev" @click="go(index - 1)">
        {{ prev.name }}
      </button>
      <button v-if="next" type="button" class="showcase__nav showcase__nav--next" @click="go(index + 1)">
        {{ next.name }}
      </button>
    </div>

    <div v-if="current" class="container showcase__text" aria-live="polite">
      <SectionTitle :headline="current.headline" :body="current.body" />
      <NuxtLink v-if="current.link?.cached_url || current.link?.url" :to="sbHref(current.link)" class="showcase__more">
        Learn more
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.showcase { padding: clamp(140px, 20.8vw, 300px) 0 clamp(140px, 21.5vw, 310px); overflow: hidden; }

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
  height: 42.43vw;                 /* 611/1440 */
}
.showcase__slide { position: absolute; inset: 0; }

.showcase__word {
  position: absolute;
  left: 50%;
  top: 22vw;                       /* 317/1440 */
  margin: 0;
  translate: -50% 0;
  font-size: 15.28vw;              /* 220/1440 */
  line-height: 1.2;
  color: var(--c-leather-200);
  pointer-events: none;
  user-select: none;
}
/* Figma shows the cut-out 1089px wide with its top 26% cropped away. */
.showcase__image {
  position: absolute;
  left: 50%;
  top: -13.3vw;
  width: 75.6vw;
  max-width: none;
  height: auto;
  translate: -50% 0;
}

.showcase__nav {
  position: absolute;
  bottom: 0.97vw;
  z-index: 2;
  padding: 8px;
  border: 0;
  background: none;
  font-size: clamp(1rem, 1.39vw, 1.25rem);
  font-weight: 600;
  line-height: 1.2;
  color: var(--c-blue);
  cursor: pointer;
}
.showcase__nav:hover { text-decoration: underline; }
.showcase__nav--prev { left: 3.9vw; text-align: left; }
.showcase__nav--next { right: 1.8vw; text-align: right; }
/* Hairline running from the previous-item label toward the product. */
.showcase__nav--prev::after {
  content: '';
  position: absolute;
  top: 50%;
  left: calc(100% + 3.1vw);
  width: 10.9vw;                   /* 157/1440 */
  border-top: var(--line-w) solid var(--line);
}

.showcase__text { display: grid; justify-items: center; gap: 24px; padding-top: 120px; }
.showcase__text :deep(.sec-title) { max-width: 453px; }
.showcase__more { color: var(--c-blue); font-weight: 500; }

.showcase-fade-enter-active, .showcase-fade-leave-active { transition: opacity 250ms ease; }
.showcase-fade-enter-from, .showcase-fade-leave-to { opacity: 0; }

@media (max-width: 720px) {
  .showcase { padding-top: 160px; }
  /* The watermark would run into the side labels at phone width: drop them below. */
  .showcase__stage { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; height: auto; min-height: 42.43vw; padding-top: 42.43vw; }
  .showcase__nav { position: static; padding-inline: var(--gutter); }
  .showcase__lead { top: 40px; height: 80px; }
  .showcase__nav--prev::after { display: none; }
}
</style>
