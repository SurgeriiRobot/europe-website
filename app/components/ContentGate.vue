<script setup lang="ts">
// The contact form the Clinical Library pop-up and the News & events cards both
// put in front of their content (Desktop Shurui Pop-up state & Active): a
// #f4f4f4 panel, the three fields on the left and the pitch, the mandatory-field
// note and the button on the right. Once the details are in it shows the
// thank-you, then hands back to whoever opened it.
defineProps<{
  state: 'form' | 'sending' | 'thanks' | 'open'
  error?: string
  valid: boolean
  countries: { name: string, value: string }[]
  labels?: Record<string, string>
}>()
const lead = defineModel<{ name: string, email: string, country: string, consent: boolean, marketing: boolean }>({ required: true })
const emit = defineEmits<{ submit: [] }>()
</script>

<template>
  <div class="gate">
    <form v-if="state !== 'thanks'" class="gate__form" @submit.prevent="emit('submit')">
      <div class="gate__fields">
        <label class="gate__field">
          <span class="gate__label">{{ labels?.name || 'Full Name' }}*</span>
          <input v-model="lead.name" type="text" name="name" autocomplete="name" required>
        </label>
        <label class="gate__field">
          <span class="gate__label">{{ labels?.email || 'Professional Email' }}*</span>
          <input v-model="lead.email" type="email" name="email" autocomplete="email" required>
        </label>
        <label class="gate__field">
          <span class="gate__label">{{ labels?.country || 'Country' }}*</span>
          <select v-model="lead.country" name="country" required>
            <option value="" disabled>{{ labels?.country || 'Country' }}</option>
            <option v-for="c in countries" :key="c.value" :value="c.value">{{ c.name }}</option>
          </select>
        </label>
        <label class="gate__check">
          <input v-model="lead.consent" type="checkbox" required>
          <span>{{ labels?.consent || GATE_CONSENT_TEXT }}*</span>
        </label>
        <label class="gate__check">
          <input v-model="lead.marketing" type="checkbox">
          <span>{{ labels?.marketing || GATE_MARKETING_TEXT }}</span>
        </label>
      </div>
      <div class="gate__aside">
        <p class="gate__pitch">{{ labels?.headline || 'Almost there!\nLeave your contact details once and get access to all our content.' }}</p>
        <p class="gate__note">*{{ labels?.note || 'Mandatory Field' }}</p>
        <p v-if="error" class="gate__error">{{ error }}</p>
        <button type="submit" class="gate__submit" :disabled="!valid || state === 'sending'">
          {{ state === 'sending' ? '…' : (labels?.submit || 'Get access') }}
        </button>
      </div>
    </form>
    <div v-else class="gate__thanks">
      <p class="gate__thanks-title">{{ labels?.thanksTitle || 'Thank you!' }}</p>
      <p class="gate__thanks-body">{{ labels?.thanksBody || 'Your content will be available in a few seconds.' }}</p>
    </div>
  </div>
</template>

<style scoped>
/* The client's HubSpot form carries a required processing consent and an
   optional marketing opt-in, and asked for both to be preserved, so the pop-up
   collects them rather than consenting on the visitor's behalf. */
.gate__check {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 0.75rem;
  line-height: 1.35;
}
.gate__check input { margin-top: 0.15em; accent-color: var(--c-blue); }

.gate { display: grid; background: var(--c-neutral-300); color: var(--c-darkblue); }
.gate__form { display: grid; grid-template-columns: minmax(0, 1fr) 245px; gap: 32px; padding: 24px; }
.gate__fields { display: grid; align-content: start; gap: 14px; }
.gate__field { display: grid; gap: 6px; }
.gate__label { font-size: 0.875rem; font-weight: 600; line-height: 1.2; }
.gate__field input,
.gate__field select {
  height: 42px;
  padding: 0 12px;
  border: 1px solid var(--c-neutral-500);
  border-radius: 4px;
  background: var(--c-white);
  font: inherit;
  font-size: 1rem;
  color: var(--c-darkblue);
}
.gate__field input:focus-visible,
.gate__field select:focus-visible { outline: 2px solid var(--c-blue); outline-offset: 1px; }
/* The frame marks a filled field with a green rule. */
.gate__field input:valid:not(:placeholder-shown),
.gate__field select:valid { border-color: var(--c-green); }
.gate__aside { display: grid; align-content: start; gap: 10px; }
.gate__pitch { margin: 0; white-space: pre-line; font-size: 1.125rem; font-weight: 600; line-height: 1.3; }
.gate__note { margin: 8px 0 0; font-size: 0.75rem; }
.gate__error { margin: 0; font-size: 0.8125rem; color: var(--c-red); }
.gate__submit {
  justify-self: start;
  height: 44px;
  padding: 0 24px;
  border: 0;
  border-radius: 4px;
  background: var(--c-blue);
  color: var(--c-white);
  font: inherit;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
}
.gate__submit:hover:not(:disabled) { background: var(--c-blue-500); }
.gate__submit:disabled { opacity: 0.45; cursor: default; }
.gate__thanks { display: grid; align-content: center; justify-items: center; gap: 12px; padding: 24px; text-align: center; }
.gate__thanks-title { margin: 0; font-size: 2rem; font-weight: 600; line-height: 1.2083; }
.gate__thanks-body { margin: 0; font-size: 1.125rem; font-weight: 300; line-height: 1.3; }

@media (max-width: 720px) {
  .gate__form { grid-template-columns: minmax(0, 1fr); gap: 20px; padding: 16px; }
  .gate__submit { justify-self: stretch; justify-content: center; text-align: center; }
}
</style>
