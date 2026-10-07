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
    // The query and the fragment are kept out of the resolve and put back after
    // it: the "Contact our team" buttons carry a fragment so they land on the
    // form, and the library and evidence links carry a filter.
    const cut = href.search(/[?#]/)
    return cut === -1 ? localePath(href) : localePath(href.slice(0, cut)) + href.slice(cut)
  }
}
