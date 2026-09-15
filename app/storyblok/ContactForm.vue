<script setup lang="ts">
const props = defineProps<{ blok: any }>()

const fields = computed(() => props.blok.fields || [])
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
  <section v-editable="blok" :id="blok.anchor || undefined" class="section form" :data-theme="blok.theme || 'brand'">
    <div class="container container--narrow">
      <h2 v-if="blok.headline" class="form__headline display-2">{{ blok.headline }}</h2>

      <p v-if="state === 'sent'" class="form__success">
        {{ blok.success_message || 'Thank you — we will be in touch shortly.' }}
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
.form__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4); }
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
</style>
