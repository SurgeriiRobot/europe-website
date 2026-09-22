<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const sbHref = useSbUrl()
const href = computed(() => (props.blok.link?.cached_url || props.blok.link?.url ? sbHref(props.blok.link) : null))
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
      :src="sbCrop(blok.logo, 0, 172, 90)"
      :alt="blok.name || blok.logo.alt || ''"
      height="86"
      loading="lazy"
    >
  </component>
</template>

<style scoped>
.logo { display: inline-flex; align-items: center; height: 86px; }
.logo img { height: 86px; width: auto; max-width: 200px; object-fit: contain; }
</style>
