<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const sbHref = useSbUrl()
const href = computed(() => sbHref(props.blok.link))
</script>

<template>
  <NuxtLink v-editable="blok" :to="href" class="nav-link">
    <img v-if="blok.icon?.filename" :src="blok.icon.filename" :alt="''" class="nav-link__icon" width="24" height="24">
    <span>
      <span class="nav-link__label">{{ blok.label }}</span>
      <span v-if="blok.description" class="nav-link__desc">{{ blok.description }}</span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.nav-link { display: flex; gap: var(--space-3); text-decoration: none; padding: var(--space-2) 0; }
.nav-link__icon { flex: none; }
.nav-link__label { display: block; font-size: var(--t-body-sm); }
.nav-link__desc { display: block; font-size: var(--t-caption); color: var(--ink-muted); }
.nav-link:hover .nav-link__label { text-decoration: underline; }
</style>
