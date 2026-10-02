/**
 * One URL per page.
 *
 * Without this every page answers on two addresses, `/about` and `/about/`,
 * each claiming to be canonical, which splits a page between two entries in a
 * search index. Storyblok's `global/` folder holds the header, footer and
 * cookie notice; those are configuration, not pages, and were being served and
 * indexed as if they were.
 */
export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  if (/(^|\/)global(\/|$)/.test(path)) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  if (path.length > 1 && path.endsWith('/')) {
    return sendRedirect(event, path.replace(/\/+$/, '') + url.search, 301)
  }
})
