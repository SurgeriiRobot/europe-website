/**
 * Cookie consent, as the approved banner works it.
 *
 * Plausible is cookieless and needs no consent, so it loads for everyone. The
 * two scripts that do need it are HubSpot's tracking code and the LinkedIn
 * Insight Tag, and neither is injected until this says accepted. Merel, on
 * 15 October: "Visitors should also be able to change their consent preferences
 * afterwards", so the choice can be reopened from the footer at any time.
 *
 * The choice is per browser, which is all a cookie banner can be: it never
 * leaves the device and the server never reads it back.
 */
const KEY = 'shurui-cookie-consent'

export type Consent = 'accepted' | 'rejected' | null

export function useConsent() {
  const consent = useState<Consent>('consent', () => null)
  // Nothing is drawn until the stored choice has been read, or the banner
  // flashes up on every page for someone who decided months ago.
  const ready = useState('consent-ready', () => false)
  const open = useState('consent-open', () => false)

  onMounted(() => {
    if (!ready.value) {
      try {
        const v = localStorage.getItem(KEY)
        consent.value = v === 'accepted' || v === 'rejected' ? v : null
      } catch {
        consent.value = null
      }
      ready.value = true
      open.value = consent.value === null
    }
  })

  function decide(value: Exclude<Consent, null>, close = true) {
    consent.value = value
    try {
      localStorage.setItem(KEY, value)
    } catch {
      // Private mode or blocked storage: the banner simply asks again.
    }
    if (close) open.value = false
  }

  return {
    consent,
    ready,
    open,
    accept: () => decide('accepted'),
    reject: () => decide('rejected'),
    // Saving from the preferences panel keeps the card up for a moment so the
    // choice is visibly confirmed. Waitak: "when pressing Save preferences you
    // lose the cookies window. It feels like you lose the window and not
    // accepted the cookie policies."
    save: (marketing: boolean) => decide(marketing ? 'accepted' : 'rejected', false),
    close: () => { open.value = false },
    reopen: () => { open.value = true },
  }
}
