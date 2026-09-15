<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const language = useStoryblokLanguage()

const { data: centers } = await useAsyncData(
  () => `centers-${language.value}-${props.blok.source}-${props.blok.region || 'all'}`,
  async () => {
    const api = useStoryblokApi()
    const { data } = await api.get('cdn/stories', {
      content_type: 'clinical_center',
      version: import.meta.dev ? 'draft' : 'published',
      language: language.value,
      per_page: 100,
      ...(props.blok.source === 'by-region' && props.blok.region
        ? { search_term: props.blok.region }
        : {}),
    })
    return data.stories.map((s: any) => ({ id: s.id, ...s.content }))
  },
)

const byCountry = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const center of centers.value || []) {
    const key = center.country || 'Other'
    ;(groups[key] ||= []).push(center)
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
})
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section map" :data-theme="blok.theme || 'light'">
    <div class="container">
      <h2 v-if="blok.headline" class="map__headline">{{ blok.headline }}</h2>

      <ul class="map__countries">
        <li v-for="[country, list] in byCountry" :key="country">
          <span class="map__country">{{ country }}</span>
          <span class="map__count">({{ list.length }})</span>
        </li>
      </ul>

      <!-- Map canvas: pins are positioned from each center's `coordinates`.
           Rendering a real basemap needs a map library — wire one here. -->
      <div class="map__canvas" role="img" :aria-label="`${centers?.length || 0} clinical centers worldwide`" />
    </div>
  </section>
</template>

<style scoped>
.map__headline { font-size: var(--t-h3); text-align: center; margin-bottom: var(--space-6); }
.map__countries { display: grid; gap: var(--space-3); list-style: none; margin: 0 0 var(--space-6); padding: 0; }
.map__countries li { display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: var(--space-3); }
.map__country { color: var(--accent); font-weight: var(--w-semibold); }
.map__count { color: var(--ink-muted); }
.map__canvas { aspect-ratio: 2.4 / 1; background: var(--surface-muted); border-radius: var(--radius); }
</style>
