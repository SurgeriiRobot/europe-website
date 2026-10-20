/**
 * A link to the page you are already on takes you back to the top of it.
 *
 * Waitak, global feedback: "Links to ABOUT, Clinical Applications, News &
 * Events, Contact don't work if you are already on that specific page. You
 * should move to the top of the page although you are already on that page.
 * Otherwise it looks like the links don't work."
 *
 * The router is right to do nothing — the route has not changed — so nothing
 * scrolls and the click reads as broken. One delegated listener covers the
 * header, the footer and anything else that links to a page rather than to a
 * place inside one.
 */
export default defineNuxtPlugin({
  name: 'same-page-link',
  enforce: 'post',
  setup() {
    if (import.meta.server) return
    const router = useRouter()

    // Capture, not bubble: NuxtLink's own handler calls preventDefault() and
    // hands the click to the router, which correctly does nothing when the
    // route has not changed. This has to get there first.
    document.addEventListener('click', (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return
      if (link.origin !== location.origin) return
      // A link carrying a fragment or a query is asking for somewhere specific;
      // only a bare link to this same page is the one that looks broken.
      // Dropping a query is a real move too: the pager's "page 1" is a bare
      // link to this same path from ?page=2, and the router handles it
      // properly. Swallowing it left every listing stuck off page one.
      if (link.hash || link.search || location.search) return
      const here = location.pathname.replace(/\/$/, '')
      const there = link.pathname.replace(/\/$/, '')
      if (here !== there) return

      e.preventDefault()
      e.stopPropagation()
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
      // Keep the address bar honest when the link came from a locale prefix or
      // a trailing slash that differs from what is in the bar.
      if (link.pathname !== location.pathname) router.replace(link.pathname)
    }, { capture: true })
  },
})
