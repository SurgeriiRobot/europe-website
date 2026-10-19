/**
 * Submitting the site's own forms to HubSpot.
 *
 * The client asked, on 19 October, to keep the forms exactly as designed while
 * having every submission land in HubSpot. So the markup stays ours and this
 * posts to HubSpot's Forms API behind it. That also means the forms work on the
 * static test site, which has no server of its own.
 *
 * Field names are not guessed. These are the ones HubSpot itself reports as
 * belonging to each form; anything not on a form makes it reject the whole
 * submission, so nothing speculative is ever sent.
 */
type Field = { name: string, value: string }

export type HubspotResult = { ok: true } | { ok: false, message: string }

/** Reads the HubSpot tracking cookie, which only exists once consent is given. */
function hutk(): string | undefined {
  if (import.meta.server) return undefined
  const m = document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/)
  return m?.[1]
}

export function useHubspotForm() {
  const config = useRuntimeConfig().public as Record<string, string>

  /**
   * `consent` is the data processing consent, which is required, and
   * `marketing` the optional communications opt-in the client wants kept
   * separate. The communications entry needs a subscription type id from the
   * HubSpot form settings; until that arrives the processing consent is sent on
   * its own rather than guessed at.
   */
  async function submit(formId: string, fields: Record<string, string | undefined>, opts: {
    consent?: boolean
    marketing?: boolean
    consentText?: string
    marketingText?: string
  } = {}): Promise<HubspotResult> {
    const portalId = config.hubspotPortalId
    if (!portalId || !formId) return { ok: false, message: 'not-configured' }

    const list: Field[] = Object.entries(fields)
      .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
      .map(([name, value]) => ({ name, value: String(value) }))

    const communications = []
    const subscriptionTypeId = Number(config.hubspotMarketingSubscriptionId)
    if (opts.marketing !== undefined && subscriptionTypeId > 0) {
      communications.push({
        value: Boolean(opts.marketing),
        subscriptionTypeId,
        text: opts.marketingText || 'I would like to receive marketing communications.',
      })
    }

    const body: Record<string, unknown> = {
      fields: list,
      context: {
        pageUri: import.meta.client ? window.location.href : undefined,
        pageName: import.meta.client ? document.title : undefined,
        hutk: hutk(),
      },
    }
    if (opts.consent !== undefined) {
      body.legalConsentOptions = {
        consent: {
          consentToProcess: Boolean(opts.consent),
          text: opts.consentText || 'I agree to the processing of my personal data.',
          ...(communications.length ? { communications } : {}),
        },
      }
    }

    try {
      const res = await fetch(`https://api-eu1.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) return { ok: true }
      // HubSpot answers a rejected submission with a list of what it did not
      // like. Worth surfacing in the console: it names the field.
      const detail = await res.json().catch(() => null)
      console.error('[hubspot] submission rejected', detail)
      return { ok: false, message: detail?.errors?.[0]?.message || `HTTP ${res.status}` }
    } catch (e: any) {
      console.error('[hubspot] submission failed', e)
      return { ok: false, message: String(e?.message || e) }
    }
  }

  return { submit, configured: Boolean(config.hubspotPortalId) }
}
