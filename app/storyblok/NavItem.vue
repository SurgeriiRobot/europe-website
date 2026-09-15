<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const sbHref = useSbUrl()
const open = ref(false)
const hasMenu = computed(() => (props.blok.columns || []).length > 0)
const href = computed(() => sbHref(props.blok.link))
</script>

<template>
  <li v-editable="blok" class="nav-item" @mouseenter="open = true" @mouseleave="open = false">
    <button v-if="hasMenu" class="nav-item__trigger" :aria-expanded="open" @click="open = !open">
      {{ blok.label }}
    </button>
    <NuxtLink v-else :to="href" class="nav-item__trigger">{{ blok.label }}</NuxtLink>

    <div v-if="hasMenu" v-show="open" class="nav-item__menu">
      <div class="container nav-item__menu-inner">
        <StoryblokComponent v-for="column in blok.columns" :key="column._uid" :blok="column" />
      </div>
    </div>
  </li>
</template>

<style scoped>
.nav-item { position: relative; }
.nav-item__trigger {
  background: none;
  border: 0;
  padding: var(--space-3) 0;
  font-size: var(--t-body-sm);
  text-decoration: none;
  cursor: pointer;
}
.nav-item__menu {
  position: absolute;
  inset-inline: 0;
  top: 100%;
  z-index: 40;
  background: var(--c-white);
  border-top: 1px solid var(--c-neutral-400);
  box-shadow: 0 12px 32px rgb(3 4 94 / 8%);
}
.nav-item__menu-inner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: var(--space-6);
  padding-block: var(--space-6);
}
@media (max-width: 900px) {
  .nav-item__menu { position: static; box-shadow: none; }
}
</style>
