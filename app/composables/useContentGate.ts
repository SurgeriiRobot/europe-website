/**
 * The contact gate the Clinical Library and News & events share.
 *
 * Waitak asked for it twice: on the library, "can we already have that pop-up and
 * form pop-up", and on news, "it should open the mandatory contact pop up and then
 * link to the event or news outside website". The frame promises "leave your
 * contact details once and get access to all our content", so the grant is per
 * visitor rather than per item: whoever has given details already goes straight
 * through on both pages.
 *
 * The grant is kept in localStorage, which is this browser only. The record that
 * matters is whatever /api/library-access hands the CRM.
 */
const GRANT = 'shurui.library.access'

export function useContentGate() {
  const granted = useState('content-gate-granted', () => false)
  const state = ref<'form' | 'sending' | 'thanks' | 'open'>('form')
  const error = ref('')
  const lead = reactive({ name: '', email: '', country: '' })

  onMounted(() => {
    try { granted.value = localStorage.getItem(GRANT) === '1' } catch { /* private mode */ }
  })

  // The address needs a real top level domain: wai@hot and wai@h.c both passed
  // the looser test, which Waitak found while testing the pop-up.
  const valid = computed(() => lead.name.trim().length > 1
    && /^[^@\s]+@[^@\s.]+(\.[^@\s.]+)*\.[A-Za-z]{2,}$/.test(lead.email.trim())
    && Boolean(lead.country))

  /** Open the gate for an item, skipping it if this visitor is already through. */
  function begin() {
    state.value = granted.value ? 'open' : 'form'
    error.value = ''
    return state.value
  }

  /**
   * Hand the details over. `onOpen` runs once the thank-you has had its moment,
   * which is where the caller sends the visitor on.
   */
  async function submit(item?: string, onOpen?: () => void) {
    if (!valid.value) return
    state.value = 'sending'
    error.value = ''
    try {
      await $fetch('/api/library-access', { method: 'POST', body: { ...lead, item } })
      granted.value = true
      try { localStorage.setItem(GRANT, '1') } catch { /* private mode */ }
      state.value = 'thanks'
      // The frame says the content "will be available in a few seconds", so the
      // thank-you holds the floor before anything else happens.
      setTimeout(() => {
        if (state.value !== 'thanks') return
        state.value = 'open'
        onOpen?.()
      }, 2200)
    } catch (e: any) {
      state.value = 'form'
      error.value = e?.data?.statusMessage || e?.data?.message || 'Something went wrong. Please try again.'
    }
  }

  return { granted, state, error, lead, valid, begin, submit }
}

/** The country list the rest of the site already uses, so the options cannot drift. */
export function useGateCountries() {
  return useAsyncData('gate-countries', async () => {
    const api = useStoryblokApi()
    const { data } = await api.get('cdn/datasource_entries', {
      datasource: 'countries',
      per_page: 250,
      version: useStoryblokVersion(),
    })
    return (data.datasource_entries || []) as { name: string, value: string }[]
  }, { default: () => [] })
}
