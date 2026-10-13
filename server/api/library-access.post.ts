// Clinical Library gate. The design asks for the contact details once and then
// opens every piece of content ("leave your contact details once and get access
// to all our content"), so this is a lead capture, not a per-file licence.
//
// Like /api/contact, the hand-off to the CRM is intentionally not implemented:
// wire it to HubSpot before launch.
export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)

  const name = String(body?.name ?? '').trim()
  const email = String(body?.email ?? '').trim()
  const country = String(body?.country ?? '').trim()

  if (name.length < 2) {
    throw createError({ statusCode: 422, statusMessage: 'A name is required' })
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw createError({ statusCode: 422, statusMessage: 'A valid e-mail address is required' })
  }
  if (!country) {
    throw createError({ statusCode: 422, statusMessage: 'A country is required' })
  }

  console.info('[library] access requested', { email, country, item: body?.item })

  return { ok: true }
})
