<script setup lang="ts">
// `eager`: set by marquee rows. A lazy image clipped by the marquee's overflow
// never counts as visible, so it would only start loading as it slides into
// view and the row would show empty slots.
const props = defineProps<{ blok: any, eager?: boolean }>()
const sbHref = useSbUrl()
const href = computed(() => (props.blok.link?.cached_url || props.blok.link?.url ? sbHref(props.blok.link) : null))
// Figma sizes a few logos individually inside the 86px slot (ircad 89, München 64).
const height = computed(() => Number(props.blok.height) || 86)
</script>

<template>
  <component
    :is="href ? 'a' : 'span'"
    v-editable="blok"
    :href="href || undefined"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener' : undefined"
    class="logo"
  >
    <img
      v-if="blok.logo?.filename"
      :src="sbCrop(blok.logo, 0, height * 2, 90)"
      :alt="blok.name || blok.logo.alt || ''"
      :height="height"
      :style="{ '--logo-h': `${height}px` }"
      :loading="eager ? 'eager' : 'lazy'"
    >
  </component>
</template>

<style scoped>
.logo { display: inline-flex; align-items: center; justify-content: center; min-width: 86px; height: 86px; }
/* Height comes in as a variable so a phone layout can swap it for a fit-box. */
.logo img { width: auto; height: var(--logo-h, 86px); max-width: 200px; object-fit: contain; }
</style>
