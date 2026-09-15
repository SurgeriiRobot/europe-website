// Contact form endpoint. Validates, then hands off to whatever the business
// uses for leads (CRM, transactional email). The hand-off is intentionally not
// implemented — wire it to the real destination before launch.
export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)

  const email = String(body?.email ?? body?.professional_email ?? '')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw createError({ statusCode: 422, statusMessage: 'A valid e-mail address is required' })
  }

  if (!body?.consent) {
    throw createError({ statusCode: 422, statusMessage: 'Consent is required before we can contact you' })
  }

  console.info('[contact] submission received', { email, keys: Object.keys(body) })

  return { ok: true }
})
