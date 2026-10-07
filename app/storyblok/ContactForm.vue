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
const state = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const error = ref('')

async function submit() {
  state.value = 'sending'
  error.value = ''
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

      <form v-else class="form__grid" @submit.prevent="submit">
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

        <p v-if="error" class="form__error" role="alert">{{ error }}</p>

        <button type="submit" class="form__submit" :disabled="state === 'sending'">
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
