<script setup lang="ts">
// Figma "Menu Search Input": the icon expands in place into a 237x38 #f9fafc field
// with a #c7c9ce border and a blue glyph inside; the nav shifts left to make room.
const props = withDefaults(defineProps<{ tone?: 'dark' | 'light' }>(), { tone: 'dark' })
const emit = defineEmits<{ searched: [] }>()

const open = ref(false)
const term = ref('')
const input = ref<HTMLInputElement>()
const localePath = useLocalePath()

async function expand() {
  open.value = true
  await nextTick()
  input.value?.focus()
}

function collapse() {
  if (!term.value) open.value = false
}

async function submit() {
  const q = term.value.trim()
  if (!q) return
  await navigateTo({ path: localePath('/search'), query: { q } })
  term.value = ''
  open.value = false
  emit('searched')
}
</script>

<template>
  <form v-if="open" class="search search--open" role="search" @submit.prevent="submit">
    <input
      ref="input"
      v-model="term"
      class="search__input"
      type="search"
      name="q"
      placeholder="Search input"
      aria-label="Search"
      @blur="collapse"
      @keydown.esc="term = ''; open = false"
    >
    <button class="search__submit" type="submit" aria-label="Submit search">
      <Icon name="search" :size="18" />
    </button>
  </form>

  <button
    v-else
    class="search search__toggle"
    :class="`search--${props.tone}`"
    type="button"
    aria-label="Open search"
    @click="expand"
  >
    <Icon name="search" :size="18" />
  </button>
</template>

<style scoped>
.search__toggle {
  display: inline-flex;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}
.search--dark { color: var(--c-darkblue); }
.search--light { color: var(--c-white); }
.search__toggle:hover { color: var(--c-blue); }

.search--open {
  position: relative;
  display: flex;
  align-items: center;
  width: 237px;
  height: 38px;
  /* The field sits 23px from the language button, not the row's usual 40px. */
  margin-inline-start: -17px;
}
.search__input {
  width: 100%;
  height: 100%;
  padding: 0 40px 0 12px;
  border: 1px solid var(--c-black-100);
  border-radius: 4px;
  background: var(--c-neutral-200);
  font-size: 0.875rem;
  color: var(--c-black);
}
/* The field only exists once search is activated and carries a caret, so it is
   its own focus indicator — matching the design's plain grey border. */
.search__input:focus-visible { outline: none; }
.search__input::placeholder { color: var(--c-black-200); }
/* Native clear button fights the custom icon. */
.search__input::-webkit-search-cancel-button { display: none; }
.search__submit {
  position: absolute;
  inset-inline-end: 10px;
  display: inline-flex;
  padding: 0;
  border: 0;
  background: none;
  color: var(--c-blue);
  cursor: pointer;
}
</style>
