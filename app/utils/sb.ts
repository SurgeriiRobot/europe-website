export interface SbLink {
  linktype?: 'story' | 'url' | 'email' | 'asset'
  url?: string
  cached_url?: string
  email?: string
  anchor?: string
  target?: string
  story?: { full_slug?: string }
}

/** Storyblok multilink -> href. Story links become root-relative paths. */
export function sbUrl(link?: SbLink | null): string {
  if (!link) return '#'
  if (link.linktype === 'email') return link.email ? `mailto:${link.email}` : '#'

  const raw = link.linktype === 'story'
    ? (link.story?.full_slug ?? link.cached_url)
    : (link.url || link.cached_url)

  if (!raw) return '#'
  if (/^(https?:)?\/\//.test(raw) || /^(mailto:|tel:)/.test(raw)) return raw

  // `home` is the root story, everything else keeps its full slug.
  const path = '/' + raw.replace(/^\/+/, '').replace(/^home$/, '')
  return link.anchor ? `${path}#${link.anchor}` : path
}

export const isExternal = (href: string) => /^https?:\/\//.test(href)

/** Storyblok assets are served from a CDN that supports /m/ transforms. */
export function sbImage(asset?: { filename?: string } | null, transform = ''): string {
  const file = asset?.filename
  if (!file) return ''
  return transform ? `${file}/m/${transform}` : file
}
