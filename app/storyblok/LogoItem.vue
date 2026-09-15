<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const sbHref = useSbUrl()
const href = computed(() => (props.blok.link ? sbHref(props.blok.link) : null))
</script>

<template>
  <component :is="href ? 'a' : 'span'" v-editable="blok" :href="href || undefined" :target="href ? '_blank' : undefined" rel="noopener" class="logo">
    <img v-if="blok.logo?.filename" :src="blok.logo.filename" :alt="blok.name || ''" loading="lazy" height="48">
  </component>
</template>

<style scoped>
.logo { display: inline-flex; align-items: center; }
.logo img { max-height: 48px; width: auto; object-fit: contain; }
</style>
