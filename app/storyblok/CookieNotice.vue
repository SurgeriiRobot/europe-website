<script setup lang="ts">
// The cookie banner as the approved frame draws it (state-menu-cookie-notice,
// panel 432x245 at the design width, 29 off the right edge and 33 off the
// bottom): a pale card with the title, the paragraph, an Accept button and
// "Manage your preferences" beside it.
//
// Juan confirmed on 15 October that this banner is the consent solution rather
// than a paid CMP, so it is what actually gates HubSpot's tracking script and
// the LinkedIn Insight Tag. Plausible is cookieless and is never gated.
const props = defineProps<{ blok: any }>()
const sbHref = useSbUrl()
const { ready, open, consent, accept, reject } = useConsent()

// "Manage your preferences" opens the second face of the same card rather than
// a separate dialog: there are only two switches, and one of them is fixed.
const view = ref<'notice' | 'prefs'>('notice')
const marketing = ref(false)
watch(open, (isOpen) => {
  if (!isOpen) return
  view.value = 'notice'
  marketing.value = consent.value === 'accepted'
})

const policyHref = computed(() => sbHref(props.blok.policy_link))
const save = () => (marketing.value ? accept() : reject())
</script>

<template>
  <div
    v-if="ready && open"
    v-editable="blok"
    class="cookies"
    role="dialog"
    aria-modal="false"
    aria-labelledby="cookie-title"
  >
    <h2 id="cookie-title" class="cookies__title">
      {{ blok.headline || 'This site uses cookies and your privacy choices are important to us' }}
    </h2>

    <template v-if="view === 'notice'">
      <div class="cookies__body">
        <StoryblokRichText v-if="blok.body" :document="blok.body" />
        <p v-else>
          We use cookies to improve the user experience and to analyze website traffic.
          By clicking "Accept", you consent to the use of cookies on our website.
          <NuxtLink v-if="blok.policy_link" :to="policyHref">{{ blok.policy_label || 'Read the cookies policies' }}</NuxtLink>.
        </p>
      </div>
      <div class="cookies__actions">
        <button type="button" class="cookies__accept" @click="accept()">
          {{ blok.accept_label || 'Accept' }}
        </button>
        <button type="button" class="cookies__manage" @click="view = 'prefs'">
          {{ blok.manage_label || 'Manage your preferences' }}
        </button>
      </div>
    </template>

    <template v-else>
      <ul class="cookies__prefs">
        <li class="cookies__pref">
          <label>
            <input type="checkbox" checked disabled>
            <span>
              <strong>{{ blok.necessary_label || 'Strictly necessary' }}</strong>
              {{ blok.necessary_note || 'Needed for the site to work, including remembering this choice. Always on.' }}
            </span>
          </label>
        </li>
        <li class="cookies__pref">
          <label>
            <input v-model="marketing" type="checkbox">
            <span>
              <strong>{{ blok.marketing_label || 'Marketing and tracking' }}</strong>
              {{ blok.marketing_note || 'HubSpot and the LinkedIn Insight Tag. Off unless you turn it on.' }}
            </span>
          </label>
        </li>
      </ul>
      <div class="cookies__actions">
        <button type="button" class="cookies__accept" @click="save()">
          {{ blok.save_label || 'Save preferences' }}
        </button>
        <button type="button" class="cookies__manage" @click="view = 'notice'">
          {{ blok.back_label || 'Back' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* 432 x 245 at 1440, 41 of padding, sitting 29 from the right and 33 from the
   foot of the viewport. Height is left to the content: the preferences face is
   taller than the notice. */
.cookies {
  position: fixed;
  right: calc(29 / 14.4 * var(--sx));
  bottom: calc(33 / 14.4 * var(--sx));
  z-index: 60;
  width: calc(432 / 14.4 * var(--sx));
  padding: calc(38 / 14.4 * var(--sx)) calc(41 / 14.4 * var(--sx)) calc(36 / 14.4 * var(--sx));
  background: #f5f5f5;
  color: var(--c-ink, #03045e);
  box-shadow: 0 16px 48px rgb(3 4 94 / 16%);
}
.cookies__title {
  margin: 0 0 calc(27 / 14.4 * var(--sx));
  font-size: calc(16 / 14.4 * var(--sx));
  line-height: 1.1875;                       /* 19 over 16 */
  font-weight: 600;
}
.cookies__body { font-size: calc(14 / 14.4 * var(--sx)); line-height: 1.2143; }
.cookies__body :deep(a) { color: #0745fe; text-decoration: underline; }
.cookies__actions {
  display: flex;
  align-items: center;
  gap: calc(38 / 14.4 * var(--sx));
  margin-top: calc(27 / 14.4 * var(--sx));
}
/* The frame draws Accept in the lighter blue, not the brand blue the page
   buttons use. */
.cookies__accept {
  min-width: calc(67 / 14.4 * var(--sx));
  padding: calc(8 / 14.4 * var(--sx)) calc(10 / 14.4 * var(--sx));
  border: 0;
  background: #20aeff;
  color: var(--c-white, #fff);
  font: inherit;
  font-size: calc(13 / 14.4 * var(--sx));
  cursor: pointer;
}
.cookies__manage {
  padding: 0;
  border: 0;
  background: none;
  color: #0745fe;
  font: inherit;
  font-size: calc(13 / 14.4 * var(--sx));
  text-decoration: underline;
  cursor: pointer;
}
.cookies__prefs { margin: 0; padding: 0; list-style: none; font-size: calc(14 / 14.4 * var(--sx)); }
.cookies__pref + .cookies__pref { margin-top: calc(16 / 14.4 * var(--sx)); }
.cookies__pref label { display: flex; gap: calc(12 / 14.4 * var(--sx)); align-items: flex-start; }
.cookies__pref input { margin-top: 0.2em; accent-color: #0745fe; }
.cookies__pref strong { display: block; font-weight: 600; }

/* Phones: the card is the width of the screen inside the 16px gutter. */
@media (max-width: 720px) {
  .cookies {
    right: 16px;
    left: 16px;
    bottom: 16px;
    width: auto;
    padding: 24px 20px;
  }
  .cookies__title { margin-bottom: 16px; font-size: 1rem; }
  .cookies__body, .cookies__prefs { font-size: 0.875rem; }
  .cookies__actions { gap: 24px; margin-top: 20px; }
  .cookies__accept, .cookies__manage { font-size: 0.875rem; }
  .cookies__accept { min-width: 88px; padding: 10px 14px; }
}
</style>
