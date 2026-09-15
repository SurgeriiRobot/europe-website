<script setup lang="ts">
defineProps<{ blok: any }>()
const mobileOpen = ref(false)
</script>

<template>
  <header v-editable="blok" class="header">
    <div class="container header__inner">
      <NuxtLink to="/" class="header__logo">
        <img v-if="blok.logo?.filename" :src="blok.logo.filename" :alt="blok.logo.alt || 'SHURUI'" height="28">
        <span v-else>SHURUI</span>
      </NuxtLink>

      <nav class="header__nav" :class="{ 'is-open': mobileOpen }" aria-label="Main">
        <ul class="header__nav-list">
          <StoryblokComponent v-for="item in blok.nav || []" :key="item._uid" :blok="item" />
        </ul>
      </nav>

      <div class="header__actions">
        <StoryblokComponent v-for="cta in blok.cta || []" :key="cta._uid" :blok="cta" />
        <LanguageSwitcher v-if="blok.show_language_switcher" />
        <button v-if="blok.show_search" class="header__icon" aria-label="Search">⌕</button>
        <button class="header__burger" :aria-expanded="mobileOpen" aria-label="Menu" @click="mobileOpen = !mobileOpen">
          ☰
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--c-white) 92%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--c-neutral-300);
}
.header__inner { display: flex; align-items: center; gap: var(--space-6); min-height: 64px; }
.header__logo { font-weight: var(--w-semibold); text-decoration: none; }
.header__nav { margin-inline-start: auto; }
.header__nav-list { display: flex; gap: var(--space-5); list-style: none; margin: 0; padding: 0; }
.header__actions { display: flex; align-items: center; gap: var(--space-3); }
.header__icon, .header__burger {
  background: none; border: 0; cursor: pointer; font-size: 1.25rem; line-height: 1;
}
.header__burger { display: none; }

@media (max-width: 900px) {
  .header__burger { display: block; }
  .header__nav { position: absolute; inset-inline: 0; top: 100%; background: var(--c-white); display: none; }
  .header__nav.is-open { display: block; }
  .header__nav-list { flex-direction: column; padding: var(--space-4) var(--gutter); }
}
</style>
