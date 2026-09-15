<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const sbHref = useSbUrl()
const href = computed(() => sbHref(props.blok.link))
const external = computed(() => isExternal(href.value))
const classes = computed(() => ['btn', `btn--${props.blok.variant || 'primary'}`, `btn--${props.blok.size || 'md'}`])
</script>

<template>
  <a v-if="external" v-editable="blok" :href="href" :class="classes" target="_blank" rel="noopener">
    {{ blok.label }}
  </a>
  <NuxtLink v-else v-editable="blok" :to="href" :class="classes">
    {{ blok.label }}
  </NuxtLink>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius);
  font-size: var(--t-body-sm);
  font-weight: var(--w-regular);
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}
.btn--md { padding: 0.75rem 1.25rem; }
.btn--lg { padding: 1rem 1.75rem; font-size: var(--t-body); }
.btn--primary { background: var(--c-blue); color: var(--c-white); }
.btn--primary:hover { background: var(--c-blue-500); }
.btn--secondary { background: transparent; color: var(--ink); border-color: currentColor; }
.btn--secondary:hover { background: color-mix(in srgb, currentColor 8%, transparent); }
.btn--ghost { background: transparent; color: var(--ink); padding-inline: 0; }
.btn--ghost:hover { text-decoration: underline; }
</style>
