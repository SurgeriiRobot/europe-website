<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const sbHref = useSbUrl()

// Per-viewer preference only — never anything the server needs to read back.
const STORAGE_KEY = 'shurui-cookie-consent'
const decided = ref(true)

onMounted(() => {
  try {
    decided.value = Boolean(localStorage.getItem(STORAGE_KEY))
  } catch {
    decided.value = false
  }
})

function decide(value: 'accepted' | 'rejected') {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Private mode or blocked storage — the notice simply reappears next visit.
  }
  decided.value = true
}

const policyHref = computed(() => sbHref(props.blok.policy_link))
</script>

<template>
  <div v-if="!decided" v-editable="blok" class="cookies" role="dialog" aria-label="Cookie notice">
    <div class="cookies__body">
      <StoryblokRichText v-if="blok.body" :document="blok.body" />
      <NuxtLink v-if="blok.policy_link" :to="policyHref" class="cookies__link">
        {{ blok.settings_label || 'Cookie settings' }}
      </NuxtLink>
    </div>
    <div class="cookies__actions">
      <button class="btn btn--secondary btn--md" @click="decide('rejected')">{{ blok.reject_label || 'Reject' }}</button>
      <button class="btn btn--primary btn--md" @click="decide('accepted')">{{ blok.accept_label || 'Accept all' }}</button>
    </div>
  </div>
</template>

<style scoped>
.cookies {
  position: fixed;
  inset-inline: var(--space-4);
  bottom: var(--space-4);
  z-index: 60;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  max-width: var(--container);
  margin-inline: auto;
  padding: var(--space-5);
  background: var(--c-white);
  border: 1px solid var(--c-neutral-400);
  border-radius: var(--radius-lg);
  box-shadow: 0 16px 48px rgb(3 4 94 / 16%);
  font-size: var(--t-body-sm);
}
.cookies__body { max-width: 60ch; }
.cookies__link { display: inline-block; margin-top: var(--space-2); font-size: var(--t-caption); }
.cookies__actions { display: flex; gap: var(--space-3); }
.btn { border-radius: var(--radius); padding: 0.75rem 1.25rem; font-size: var(--t-body-sm); cursor: pointer; border: 1px solid transparent; }
.btn--primary { background: var(--c-blue); color: var(--c-white); }
.btn--secondary { background: transparent; border-color: var(--c-neutral-500); }
</style>
