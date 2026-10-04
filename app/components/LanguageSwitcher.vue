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
const trigger = ref<HTMLButtonElement>()

useClickOutside(root, () => (open.value = false))

// The card is role="menu" with role="menuitem" children, which asks for the
// menu-button keyboard contract and had none of it: the arrow keys did nothing,
// and @keydown.esc sat on the trigger alone, so Escape from inside an open menu
// never reached it. The options carry tabindex="-1" and are reached with the
// arrows, as that role expects; Tab leaves the menu and closes it.
const options = () => Array.from(root.value?.querySelectorAll<HTMLElement>('.lang__option') || [])

async function openMenu(at: number) {
  open.value = true
  await nextTick()
  const els = options()
  if (!els.length) return
  ;(at < 0 ? els[els.length - 1] : els[at])?.focus()
}

function closeMenu(returnFocus = true) {
  if (!open.value) return
  open.value = false
  // Escape and a chosen option both hand focus back to the code that opened the
  // menu; without this it fell to <body>.
  if (returnFocus) trigger.value?.focus()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (!open.value) return
    e.preventDefault()
    e.stopPropagation()
    closeMenu()
    return
  }
  const onTrigger = document.activeElement === trigger.value
  if (!open.value) {
    if (onTrigger && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      openMenu(e.key === 'ArrowDown' ? 0 : -1)
    }
    return
  }
  if (e.key === 'Tab') { closeMenu(false); return }
  const els = options()
  if (!els.length) return
  const at = els.indexOf(document.activeElement as HTMLElement)
  if (e.key === 'ArrowDown') { e.preventDefault(); els[at < 0 ? 0 : (at + 1) % els.length]?.focus() }
  else if (e.key === 'ArrowUp') { e.preventDefault(); els[at < 0 ? els.length - 1 : (at - 1 + els.length) % els.length]?.focus() }
  else if (e.key === 'Home') { e.preventDefault(); els[0]?.focus() }
  else if (e.key === 'End') { e.preventDefault(); els[els.length - 1]?.focus() }
}
</script>

<template>
  <div ref="root" class="lang" @keydown="onKeydown">
    <button
      v-if="others.length"
      ref="trigger"
      class="lang__trigger"
      :class="{ 'is-open': open }"
      type="button"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="open ? closeMenu() : openMenu(0)"
    >
      {{ locale.toUpperCase() }}
    </button>
    <span v-else class="lang__trigger lang__trigger--static">{{ locale.toUpperCase() }}</span>

    <Transition name="lang-pop">
      <ul v-if="open" class="lang__menu" role="menu">
        <li v-for="option in others" :key="option.code" role="none">
          <NuxtLink
            role="menuitem"
            tabindex="-1"
            :to="switchLocalePath(option.code)"
            class="lang__option"
            @click="closeMenu(false)"
          >
            {{ option.code.toUpperCase() }}
          </NuxtLink>
        </li>
      </ul>
    </Transition>
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
  transition: color 150ms ease;
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
  transform-origin: top center;
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
.lang__option { transition: color 150ms ease; }
.lang__option:hover { color: var(--c-blue); }

/* Drops in from just above its resting place; `translate` stays free for the
   centring offset, so the motion uses `transform`. */
.lang-pop-enter-active { transition: opacity 180ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1); }
.lang-pop-leave-active { transition: opacity 120ms ease, transform 120ms ease; }
.lang-pop-enter-from, .lang-pop-leave-to { opacity: 0; transform: translateY(-6px) scale(0.97); }
</style>
