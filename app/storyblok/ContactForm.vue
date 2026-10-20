<script setup lang="ts">
const props = defineProps<{ blok: any }>()

const fields = computed(() => props.blok.fields || [])

// The schema offers the usual section spacing, but nothing read it, so the band
// kept base.css's 96px block padding whatever the story said. Desktop values
// are authored as px at 1440 and scale with --sx; the phone ones are real px.
// undefined, not null: Vue's style binding rejects null.
const n = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : String(Number(v)))
const px = (v: unknown) => { const t = n(v); return t === undefined ? undefined : `${t}px` }
const spacing = computed(() => ({
  '--form-top': n(props.blok.space_top),
  '--form-bottom': n(props.blok.space_bottom),
  '--form-top-m': px(props.blok.space_top_mobile),
  '--form-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
const values = reactive<Record<string, any>>({})
// Waitak: "we might also need the send your message button to gray out until
// all the contact input is correct". The browser already knows whether the form
// is satisfiable, so the button follows its answer rather than a second set of
// rules written here.
const formEl = ref<HTMLFormElement>()
const formValid = ref(false)
const revalidate = () => { formValid.value = Boolean(formEl.value?.checkValidity()) }
onMounted(revalidate)
const state = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const error = ref('')

const language = useStoryblokLanguage()
const hubspot = useHubspotForm()
const formId = (useRuntimeConfig().public as Record<string, string>).hubspotContactFormId

// The site's own names on the left, HubSpot's on the right, taken from the
// published form definition rather than guessed. A field the form does not know
// makes it reject the whole submission.
const MAP: Record<string, string> = {
  first_name: 'firstname',
  last_name: 'lastname',
  email: 'email',
  country: 'contact_country',
  message: 'message',
  interest: 'website_interest',
}
// The country dropdown stores country names; the interest dropdown stores the
// same keys we use. So one is translated on the way out and the other is not.
const AS_NAME = new Set(['country'])

// `consent` is the data processing consent and is required; `marketing` is the
// optional communications opt-in, which the client wants recorded separately so
// they can tell who agreed to be marketed to.
function label(name: string) {
  return fields.value.find((f: any) => f.name === name)?.label || ''
}

// A select submits its datasource key, "DE" rather than "Germany". That is the
// right thing to carry around the site and the wrong thing to put in a CRM, so
// the readable name goes to HubSpot. FormField has already fetched each list
// under `ds-<datasource>`, so this reads that result rather than fetching again.
const nuxtApp = useNuxtApp()
function readable(fieldName: string, value: string) {
  const field = fields.value.find((f: any) => f.name === fieldName)
  if (!field?.options) return value
  const list = (nuxtApp.payload.data as Record<string, any>)?.[`ds-${field.options}`] as { name: string, value: string }[] | undefined
  return list?.find(e => e.value === value)?.name || value
}

async function submit() {
  state.value = 'sending'
  error.value = ''

  if (hubspot.configured && formId) {
    const payload: Record<string, string | undefined> = {}
    for (const [ours, theirs] of Object.entries(MAP)) {
      const v = values[ours]
      if (v === undefined || v === '' || typeof v === 'boolean') continue
      payload[theirs] = AS_NAME.has(ours)
        ? hubspotCountry(String(v), readable(ours, String(v)))
        : String(v)
    }
    // The three hidden properties the client added to both forms.
    payload.website_page_url = import.meta.client ? window.location.href : undefined
    payload.website_language = siteLanguage(language.value)
    payload.website_form_source = 'contact'
    const res = await hubspot.submit(formId, payload, {
      consent: Boolean(values.consent),
      marketing: 'marketing' in values ? Boolean(values.marketing) : undefined,
      consentText: label('consent'),
      marketingText: label('marketing'),
    })
    if (res.ok) { state.value = 'sent'; return }
    state.value = 'error'
    error.value = props.blok.error_message || 'Something went wrong. Please try again.'
    return
  }

  try {
    await $fetch('/api/contact', { method: 'POST', body: { ...values } })
    state.value = 'sent'
  } catch (e: any) {
    state.value = 'error'
    error.value = e?.data?.message || 'Something went wrong. Please try again.'
  }
}
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section form"
    :data-theme="blok.theme || 'brand'"
    :style="spacing"
  >
    <div class="form__inner">
      <h2 v-if="blok.headline" class="form__headline">{{ blok.headline }}</h2>

      <p v-if="state === 'sent'" class="form__success">
        {{ blok.success_message || 'Thank you, we will be in touch shortly.' }}
      </p>

      <form v-else ref="formEl" class="form__grid" @input="revalidate" @change="revalidate" @submit.prevent="submit">
        <StoryblokComponent
          v-for="field in fields"
          :key="field._uid"
          :blok="field"
          :model-value="values[field.name]"
          @update:model-value="values[field.name] = $event"
        />

        <div v-if="blok.consent_text" class="form__consent">
          <StoryblokRichText :document="blok.consent_text" />
        </div>

        <p class="form__mandatory caption">{{ props.blok.mandatory_note || '*Mandatory field' }}</p>

        <p v-if="error" class="form__error" role="alert">{{ error }}</p>

        <button type="submit" class="form__submit" :disabled="state === 'sending' || !formValid">
          {{ state === 'sending' ? 'Sending…' : (blok.submit_label || 'Send your message') }}
        </button>

        <div v-if="blok.privacy_note" class="form__note caption">
          <StoryblokRichText :document="blok.privacy_note" />
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.form__headline { text-align: center; margin-bottom: var(--space-6); }
/* Figma draws the grid 848 wide, centred: two 408px columns 32px apart. The
   shared narrow container is 760, which squeezed every field by 94px. */
.form {
  padding-top: calc(var(--form-top, 96) / 14.4 * var(--sx));
  padding-bottom: calc(var(--form-bottom, 96) / 14.4 * var(--sx));
}
@media (max-width: 720px) {
  .form {
    padding-top: var(--form-top-m, 96px);
    padding-bottom: var(--form-bottom-m, 96px);
  }
}
.form__inner {
  width: min(100% - 2 * clamp(16px, 5.2vw, 75px), calc(58.89 * var(--sx)));
  margin-inline: auto;
}
.form__headline {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 6.67vw, 6rem);   /* 96px */
  font-weight: 600;
  line-height: 1.198;
  text-align: center;
  color: var(--ink);
}
.form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px calc(2.22 * var(--sx));          /* 32px between the columns */
}
.form__consent, .form__note, .form__error, .form__submit { grid-column: 1 / -1; }
.form__submit {
  justify-self: start;
  padding: 0.75rem 1.5rem;
  border: 0;
  border-radius: var(--radius);
  background: var(--c-blue);
  color: var(--c-white);
  cursor: pointer;
}
.form__submit:disabled { opacity: 0.6; cursor: default; }
.form__error { color: var(--c-red); }
/* Waitak: "we will need a *mandatory indicator, also at the I agree". The
   asterisk is on every required field now, including the consent box, and this
   says what it means. */
.form__mandatory { grid-column: 1 / -1; margin: 0; }
/* Greyed until every required field is satisfied, so the button says whether
   the form is ready rather than only failing on press. */
.form__submit:disabled { background: var(--c-neutral-400, #d7d9e0); color: #6b7080; cursor: not-allowed; }
.form__success { text-align: center; font-size: var(--t-h5); }
@media (max-width: 640px) { .form__grid { grid-template-columns: 1fr; } }
/* The 848px desktop measure is held in --sx, which on a 390 phone collapses to
   230px and left the fields barely over half the screen. On phones the form
   takes the page gutter, the same 16px either side the banner CTA above it
   stands on. After `.form__inner` in the sheet, so it wins on source order. */
@media (max-width: 720px) {
  .form__inner { width: calc(100% - 32px); }
}
</style>
