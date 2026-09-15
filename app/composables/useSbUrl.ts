/**
 * Locale-aware wrapper around `sbUrl`. Storyblok slugs are identical across
 * locales under field-level translation, so the locale prefix is applied on the
 * Nuxt side rather than stored in the link.
 */
export function useSbUrl() {
  const localePath = useLocalePath()

  return (link?: SbLink | null): string => {
    const href = sbUrl(link)
    return href.startsWith('/') ? localePath(href) : href
  }
}
