/**
 * Maps the active i18n locale onto the Storyblok `language` parameter.
 *
 * Field-level translation expects `default` for the source language and the
 * locale code for every other one. The mapping lives on each locale object in
 * nuxt.config (`storyblok: 'de'`) so the two never drift apart.
 */
export function useStoryblokLanguage() {
  const { locale, locales } = useI18n()

  return computed(() => {
    const active = (locales.value as any[]).find(l => (typeof l === 'string' ? l : l.code) === locale.value)
    return (active && typeof active !== 'string' && active.storyblok) || 'default'
  })
}
