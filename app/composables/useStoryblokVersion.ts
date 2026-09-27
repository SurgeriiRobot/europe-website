/**
 * Which Storyblok content version to read. Dev always reads drafts; a build
 * reads published content unless NUXT_PUBLIC_STORYBLOK_VERSION=draft, which the
 * test site uses so editors can review work before it is published.
 */
export function useStoryblokVersion(): 'draft' | 'published' {
  if (import.meta.dev) return 'draft'
  return useRuntimeConfig().public.storyblokVersion === 'draft' ? 'draft' : 'published'
}
