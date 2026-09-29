<script setup lang="ts">
// layout "bands" (home, Figma 991:18647-49): full-width rows (760 / 800 / 760px),
// image half and text half, alternating sides.
// layout "bands-stagger" (SHURUI SP Robot page): 800px photos, the first rising
// 40px above its panel and the last panel running 40px past its photo; panel
// colours and hairlines follow the band order.
// layout "grid": the original card grid.
const props = defineProps<{ blok: any }>()
const columns = computed(() => Number(props.blok.columns) || 2)
const stagger = computed(() => props.blok.layout === 'bands-stagger')
const bands = computed(() => props.blok.layout === 'bands' || stagger.value)
const items = computed<any[]>(() => props.blok.items || [])
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section features"
    :class="{ 'features--bands': bands, 'features--stagger': stagger }"
    :data-theme="blok.theme || 'dark'"
  >
    <SectionConnector :connector="blok.connector" />
    <p v-if="blok.watermark" class="features__watermark display-word" aria-hidden="true">{{ blok.watermark }}</p>

    <template v-if="bands">
      <StoryblokComponent
        v-for="(item, i) in items"
        :key="item._uid"
        :blok="item"
        layout="band"
        :variant="stagger ? 'stagger' : 'classic'"
        :flip="i % 2 === 1"
        :decor="stagger ? i % 4 : i % 3"
        :first="i === 0"
        :last="i === items.length - 1"
      />
    </template>

    <div v-else class="container">
      <SectionTitle :headline="blok.headline" />
      <div class="features__grid" :style="{ '--cols': columns }">
        <StoryblokComponent v-for="item in items" :key="item._uid" :blok="item" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.features { overflow: hidden; }
/* Bands paint their own panels; the first band's photo also rises into the
   section above, so this one must not clip. */
.features--bands { padding: 0; overflow: visible; }
/* Staggered bands leave a 40px strip under the last photo: the page shows there.
   They open with 298px of white above the first photo (Figma 2716-3014), which
   the section carries itself since that photo rises 40px out of its band. */
.features--stagger { padding-top: calc(18.06 * var(--sx)); background: none; }   /* 260 + 40 */
@media (max-width: 720px) { .features--stagger { padding-top: 118px; } }         /* 146 above the first photo */
.features__watermark {
  margin: 0 0 var(--space-5);
  font-size: clamp(2.5rem, 9vw, 7rem);
  color: color-mix(in srgb, currentColor 14%, transparent);
  user-select: none;
}
.features__grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-6);
}
@media (max-width: 860px) { .features__grid { grid-template-columns: 1fr; } }
</style>
