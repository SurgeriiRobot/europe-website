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
  // An in-page anchor ("#intended-use") stays on the current page.
  if (raw.startsWith('#')) return raw

  // `home` is the root story, everything else keeps its full slug.
  const path = '/' + raw.replace(/^\/+/, '').replace(/^home$/, '')
  return link.anchor ? `${path}#${link.anchor}` : path
}

export const isExternal = (href: string) => /^https?:\/\//.test(href)

/**
 * Storyblok image CDN URL. `size` is "WxH" (0 = keep aspect). When the asset has
 * an editor-set focal point and both dimensions are fixed, the crop is centred on
 * it — that is how the design's art-directed crops are reproduced.
 */
export function sbImage(asset?: { filename?: string, focus?: string } | null, transform = ''): string {
  const file = asset?.filename
  if (!file) return ''
  return transform ? `${file}/m/${transform}` : file
}

/**
 * The asset's own pixel width. Storyblok puts it in the path
 * (/f/<space>/<W>x<H>/), and the image service clamps any larger request back
 * to it. So a srcset candidate written wider than the file silently promises
 * pixels that never arrive, and the browser picks it over a smaller one that
 * would have looked the same. Build candidates against this instead.
 */
export function sbWidth(asset: { filename?: string } | null | undefined): number {
  return Number(asset?.filename?.match(/\/f\/\d+\/(\d+)x\d+\//)?.[1]) || 0
}

export function sbCrop(
  asset: { filename?: string, focus?: string } | null | undefined,
  width: number,
  height = 0,
  quality = 80,
): string {
  if (!asset?.filename) return ''
  const filters = [`format(webp)`, `quality(${quality})`]
  if (asset.focus && height) filters.push(`focal(${asset.focus})`)
  return `${asset.filename}/m/${width}x${height}/filters:${filters.join(':')}`
}
