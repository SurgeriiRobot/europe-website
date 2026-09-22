<script setup lang="ts">
// Figma "Menu Language Dropdown": the code turns blue while open, and a small
// #f5f5f5 card centred under it lists the other locales in black.
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const available = computed(() =>
  (locales.value as any[]).map(l => (typeof l === 'string' ? { code: l, name: l } : l)),
)
const others = computed(() => available.value.filter(l => l.code !== locale.value))
const open = ref(false)
const root = ref<HTMLElement>()

useClickOutside(root, () => (open.value = false))
</script>

<template>
  <div ref="root" class="lang">
    <button
      v-if="others.length"
      class="lang__trigger"
      :class="{ 'is-open': open }"
      type="button"
      :aria-expanded="open"
      aria-haspopup="true"
      @click="open = !open"
      @keydown.esc="open = false"
    >
      {{ locale.toUpperCase() }}
    </button>
    <span v-else class="lang__trigger lang__trigger--static">{{ locale.toUpperCase() }}</span>

    <ul v-if="open" class="lang__menu" role="menu">
      <li v-for="option in others" :key="option.code" role="none">
        <NuxtLink role="menuitem" :to="switchLocalePath(option.code)" class="lang__option" @click="open = false">
          {{ option.code.toUpperCase() }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.lang { position: relative; }

.lang__trigger {
  padding: 4px 5px;
  border: 0;
  border-radius: 4px;
  background: none;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.375rem;
  letter-spacing: 0.46px;
  color: var(--c-darkblue);
  cursor: pointer;
}
.lang__trigger:hover,
.lang__trigger.is-open { color: var(--c-blue); }
.lang__trigger--static { cursor: default; }
.lang__trigger--static:hover { color: var(--c-darkblue); }

.lang__menu {
  position: absolute;
  top: calc(100% + 17px);        /* lands on the header's bottom edge */
  left: 50%;
  translate: -50% 0;
  z-index: 45;
  min-width: 42px;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background: var(--c-leather-200);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
}
.lang__option {
  display: block;
  padding: 3px 10px;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.375rem;
  letter-spacing: 0.46px;
  text-align: center;
  color: var(--c-neutral-1000);
  text-decoration: none;
}
.lang__option:hover { color: var(--c-blue); }
</style>
