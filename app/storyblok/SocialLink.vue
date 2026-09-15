<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const sbHref = useSbUrl()
const href = computed(() => sbHref(props.blok.url))
</script>

<template>
  <a v-editable="blok" :href="href" class="social" target="_blank" rel="noopener" :aria-label="blok.platform">
    <span aria-hidden="true">{{ blok.platform }}</span>
  </a>
</template>

<style scoped>
.social {
  display: inline-flex;
  text-decoration: none;
  font-size: var(--t-caption);
  text-transform: capitalize;
}
</style>
