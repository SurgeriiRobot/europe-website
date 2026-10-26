import { createHash } from 'node:crypto'

/**
 * Draft content for the Storyblok Visual Editor, and only for it.
 *
 * The site renders published content with a public token, which is what every
 * visitor's browser carries. Draft content needs a preview token, and a
 * preview token in the browser means anyone can read unpublished work, so it
 * stays here on the server and is never put into runtime config's `public`.
 *
 * Storyblok signs the editor's iframe URL. Checking that signature is what
 * separates "the editor asked" from "someone added a query string": the token
 * is sha1 of space id, preview token and timestamp, so only a request that
 * came from the editor of this space can produce it.
 */
const MAX_AGE_SECONDS = 3600

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const previewToken = config.storyblokPreviewToken as string
  if (!previewToken) {
    throw createError({ statusCode: 503, statusMessage: 'Preview is not configured' })
  }

  const q = getQuery(event)
  const spaceId = String(q['_storyblok_tk[space_id]'] ?? '')
  const timestamp = String(q['_storyblok_tk[timestamp]'] ?? '')
  const token = String(q['_storyblok_tk[token]'] ?? '')
  if (!spaceId || !timestamp || !token) {
    throw createError({ statusCode: 403, statusMessage: 'Not an editor request' })
  }

  // A signature stays valid for an hour, which is Storyblok's own window. It
  // stops a URL copied out of the editor from working as a permanent key to
  // unpublished content.
  const age = Math.floor(Date.now() / 1000) - Number(timestamp)
  if (!Number.isFinite(age) || age > MAX_AGE_SECONDS || age < -MAX_AGE_SECONDS) {
    throw createError({ statusCode: 403, statusMessage: 'Editor signature has expired' })
  }

  const expected = createHash('sha1').update(`${spaceId}:${previewToken}:${timestamp}`).digest('hex')
  if (expected !== token) {
    throw createError({ statusCode: 403, statusMessage: 'Editor signature does not match' })
  }

  const region = config.storyblokRegion as string
  const host = region === 'eu' ? 'api.storyblok.com' : `api-${region}.storyblok.com`
  const slug = String(q.slug || 'home').replace(/^\/+|\/+$/g, '')
  const language = String(q.language || 'default')

  // `cv` defeats Storyblok's own CDN cache, which otherwise serves an editor
  // the draft as it stood a few minutes ago.
  return await $fetch(`https://${host}/v2/cdn/stories/${slug}`, {
    query: {
      token: previewToken,
      version: 'draft',
      language,
      resolve_links: 'url',
      cv: Date.now(),
    },
  })
})
