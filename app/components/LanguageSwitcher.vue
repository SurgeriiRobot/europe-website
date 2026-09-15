<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const available = computed(() =>
  (locales.value as any[]).map(l => (typeof l === 'string' ? { code: l, name: l } : l)),
)
const open = ref(false)
const current = computed(() => available.value.find(l => l.code === locale.value))
</script>

<template>
  <div v-if="available.length > 1" class="lang" @mouseleave="open = false">
    <button class="lang__trigger" :aria-expanded="open" @click="open = !open">
      {{ (current?.code || locale).toUpperCase() }}
    </button>
    <ul v-show="open" class="lang__menu">
      <li v-for="option in available" :key="option.code">
        <NuxtLink :to="switchLocalePath(option.code)" class="lang__option" @click="open = false">
          {{ option.name || option.code }}
        </NuxtLink>
      </li>
    </ul>
  </div>
  <span v-else class="lang__single">{{ locale.toUpperCase() }}</span>
</template>

<style scoped>
.lang { position: relative; }
.lang__trigger { background: none; border: 0; cursor: pointer; font-size: var(--t-body-sm); }
.lang__single { font-size: var(--t-body-sm); color: var(--ink-muted); }
.lang__menu {
  position: absolute;
  inset-inline-end: 0;
  top: 100%;
  z-index: 40;
  min-width: 8rem;
  list-style: none;
  margin: 0;
  padding: var(--space-2);
  background: var(--c-white);
  border: 1px solid var(--c-neutral-400);
  border-radius: var(--radius);
  box-shadow: 0 12px 32px rgb(3 4 94 / 10%);
}
.lang__option { display: block; padding: var(--space-2); text-decoration: none; font-size: var(--t-body-sm); }
.lang__option:hover { background: var(--c-neutral-300); }
</style>
