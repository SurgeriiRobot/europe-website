/**
 * Locale-aware wrapper around `sbUrl`. Storyblok slugs are identical across
 * locales under field-level translation, so the locale prefix is applied on the
 * Nuxt side rather than stored in the link.
 */
export function useSbUrl() {
  const localePath = useLocalePath()

  return (link?: SbLink | null): string => {
    const href = sbUrl(link)
    if (!href.startsWith('/')) return href
    // The fragment is kept out of the resolve and put back after it: the
    // "Contact our team" buttons now carry one, so that every page's invitation
    // to get in touch lands on the form rather than the top of the page.
    const hash = href.indexOf('#')
    return hash === -1 ? localePath(href) : localePath(href.slice(0, hash)) + href.slice(hash)
  }
}
