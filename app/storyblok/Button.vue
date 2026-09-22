<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const sbHref = useSbUrl()
const href = computed(() => sbHref(props.blok.link))
const external = computed(() => isExternal(href.value))
const icon = computed(() => (props.blok.icon && props.blok.icon !== 'none' ? props.blok.icon : null))
const classes = computed(() => ['btn', `btn--${props.blok.variant || 'primary'}`, `btn--${props.blok.size || 'md'}`])
</script>

<template>
  <a v-if="external" v-editable="blok" :href="href" :class="classes" target="_blank" rel="noopener">
    <span>{{ blok.label }}</span>
    <Icon v-if="icon" :name="icon" :size="22" />
  </a>
  <NuxtLink v-else v-editable="blok" :to="href" :class="classes">
    <span>{{ blok.label }}</span>
    <Icon v-if="icon" :name="icon" :size="22" />
  </NuxtLink>
</template>

<style scoped>
/* Figma `<Button>` (MUI contained, large): Inter 500 15/26, +0.46px tracking,
   8px 22px padding, 4px radius, 8px gap to the icon, elevation-2 shadow. */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.625rem;
  letter-spacing: 0.46px;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
.btn--md { padding: 7px 21px; }          /* 8/22 minus the 1px border */
.btn--lg { padding: 10px 27px; font-size: 1rem; }

.btn--primary {
  background: var(--c-blue);
  color: var(--c-white);
  box-shadow:
    0 3px 1px -2px rgb(0 0 0 / 20%),
    0 2px 2px 0 rgb(0 0 0 / 14%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
}
.btn--primary:hover {
  background: var(--c-blue-500);
  box-shadow:
    0 2px 4px -1px rgb(0 0 0 / 20%),
    0 4px 5px 0 rgb(0 0 0 / 14%),
    0 1px 10px 0 rgb(0 0 0 / 12%);
}

.btn--accent {
  background: var(--c-sky);
  color: var(--c-white);
  box-shadow:
    0 3px 1px -2px rgb(0 0 0 / 20%),
    0 2px 2px 0 rgb(0 0 0 / 14%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
}
.btn--accent:hover { background: color-mix(in srgb, var(--c-sky) 85%, #000); }

.btn--secondary { background: transparent; color: var(--ink); border-color: currentColor; }
.btn--secondary:hover { background: color-mix(in srgb, currentColor 8%, transparent); }

.btn--ghost { background: transparent; color: var(--ink); padding-inline: 0; border-color: transparent; }
.btn--ghost:hover { text-decoration: underline; }
</style>
