import type { Ref } from 'vue'

/** Calls `handler` on any pointerdown outside `target`. Client-only by nature. */
export function useClickOutside(target: Ref<HTMLElement | undefined>, handler: () => void) {
  const listener = (event: PointerEvent) => {
    const el = target.value
    if (el && !el.contains(event.target as Node)) handler()
  }

  onMounted(() => document.addEventListener('pointerdown', listener))
  onBeforeUnmount(() => document.removeEventListener('pointerdown', listener))
}
