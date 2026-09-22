/**
 * Scroll reveals. One IntersectionObserver tags elements as they come into view;
 * CSS does the rest. Elements are only hidden once this runs, so the page is
 * fully visible without JavaScript and there is no flash of blank content.
 *
 * Anyone who prefers reduced motion gets no observer and no transition at all.
 */
// Note: the news slider reveals as a whole, never per card — cards sitting
// outside the viewport horizontally would never intersect and would stay hidden.
const TARGETS = [
  '.sec-title', '.hero-full__content', '.wordmark__stage', '.showcase__text',
  '.band__text', '.group', '.quote__content', '.stat', '.stats__actions',
  '.slider', '.cta__content', '.cta__display', '.statement__actions',
].join(',')

export default defineNuxtPlugin({
  name: 'reveal',
  enforce: 'post',
  setup() {
    if (import.meta.server) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.documentElement
    let observer: IntersectionObserver | undefined

    const scan = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(TARGETS))
        .filter(el => !el.dataset.reveal)
      if (!els.length) return
      root.classList.add('reveal-ready')
      for (const el of els) {
        el.dataset.reveal = ''
        // Already on screen at load: show immediately, don't animate the fold.
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add('is-in')
        else observer?.observe(el)
      }
    }

    observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add('is-in')
        observer?.unobserve(e.target)
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 })

    const nuxt = useNuxtApp()
    nuxt.hook('page:finish', () => nextTick(scan))
    onNuxtReady(() => scan())
  },
})
