/**
 * A horizontal swipe on a touch screen, for the carousels that only had arrows.
 *
 * Waitak asked for it on the home showcase and on Our journey. Deliberately
 * small: a touch that travels far enough sideways, and not mostly downwards,
 * counts as a swipe. Anything else is left alone so the page still scrolls
 * normally under a finger.
 */
export function useSwipe(el: Ref<HTMLElement | undefined>, handlers: { prev: () => void, next: () => void }) {
  const THRESHOLD = 48          // px before a drag counts
  let x = 0
  let y = 0
  let tracking = false

  const start = (e: TouchEvent) => {
    if (e.touches.length !== 1) return
    x = e.touches[0].clientX
    y = e.touches[0].clientY
    tracking = true
  }
  const end = (e: TouchEvent) => {
    if (!tracking) return
    tracking = false
    const touch = e.changedTouches[0]
    if (!touch) return
    const dx = touch.clientX - x
    const dy = touch.clientY - y
    // A mostly vertical movement is the page being scrolled, not a swipe.
    if (Math.abs(dx) < THRESHOLD || Math.abs(dx) < Math.abs(dy)) return
    dx < 0 ? handlers.next() : handlers.prev()
  }

  onMounted(() => {
    const node = el.value
    if (!node) return
    node.addEventListener('touchstart', start, { passive: true })
    node.addEventListener('touchend', end, { passive: true })
    onBeforeUnmount(() => {
      node.removeEventListener('touchstart', start)
      node.removeEventListener('touchend', end)
    })
  })
}
