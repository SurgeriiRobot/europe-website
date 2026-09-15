/**
 * Global header/footer/cookie configuration, fetched once per request from the
 * `global/site-config` story. Returns null when the story does not exist yet so
 * the site still renders during content setup.
 */
export async function useSiteConfig() {
  const language = useStoryblokLanguage()

  const { data } = await useAsyncData(
    () => `site-config-${language.value}`,
    async () => {
      const api = useStoryblokApi()
      try {
        const { data } = await api.get('cdn/stories/global/site-config', {
          version: import.meta.dev ? 'draft' : 'published',
          language: language.value,
          resolve_links: 'url',
        })
        return data.story.content
      } catch {
        // No config story yet — header and footer simply don't render.
        return null
      }
    },
    { watch: [language] },
  )

  return data
}
