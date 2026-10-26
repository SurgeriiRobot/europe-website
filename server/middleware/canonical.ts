/**
 * One URL per page.
 *
 * Without this every page answers on two addresses, `/about` and `/about/`,
 * each claiming to be canonical, which splits a page between two entries in a
 * search index. Storyblok's `global/` folder holds the header, footer and
 * cookie notice; those are configuration, not pages, and were being served and
 * indexed as if they were.
 *
 * The same went for the hostname. `www` used to redirect from
 * `public/.htaccess`, which only Apache reads, and Apache stopped serving the
 * site the moment it moved to the Node backend. Both names then answered 200
 * and the whole site was published twice over.
 */
export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Behind Combell's nginx the original hostname arrives forwarded, and the
  // `host` header is the proxy's own. Reading the forwarded one first means
  // this still works if the site is ever put behind anything else.
  const host = getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host') || ''
  // Certificate renewal is answered over http on the name being validated, so
  // that one path has to stay where it is or the renewal fails.
  if (host.startsWith('www.') && !path.startsWith('/.well-known/')) {
    return sendRedirect(event, `https://${host.slice(4)}${path}${url.search}`, 301)
  }

  if (/(^|\/)global(\/|$)/.test(path)) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  if (path.length > 1 && path.endsWith('/')) {
    return sendRedirect(event, path.replace(/\/+$/, '') + url.search, 301)
  }
})
