<script setup lang="ts">
// Figma "Mobile Hamburger Menu": full-screen overlay on a diagonal
// #4169e8 -> #1f2739 gradient, 90px rows split by 50%-white rules, sections that
// open into white panels, and the CTA plus socials pinned to the bottom.
const props = defineProps<{ nav: any[], cta: any[], socials: any[], initialSearch?: boolean }>()
const emit = defineEmits<{ close: [] }>()

const sbHref = useSbUrl()
const route = useRoute()
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const expanded = ref<string | null>(null)
const searching = ref(props.initialSearch ?? false)
const term = ref('')
const localePath = useLocalePath()

const childLinks = (item: any) => (item.columns || []).flatMap((c: any) => c.links || [])
const localeCodes = computed(() => (locales.value as any[]).map(l => (typeof l === 'string' ? l : l.code)))

const ICONS: Record<string, 'linkedin' | 'phone' | 'mail'> = { linkedin: 'linkedin', phone: 'phone', email: 'mail' }

async function submitSearch() {
  const q = term.value.trim()
  if (!q) return
  await navigateTo({ path: localePath('/search'), query: { q } })
}

// Lock page scroll behind the overlay; close on navigation or Escape.
onMounted(() => { document.documentElement.style.overflow = 'hidden' })
onBeforeUnmount(() => { document.documentElement.style.overflow = '' })
watch(() => route.fullPath, () => emit('close'))
const onKey = (e: KeyboardEvent) => e.key === 'Escape' && emit('close')
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="mm" role="dialog" aria-modal="true" aria-label="Site menu">
    <div class="mm__top">
      <NuxtLink :to="localePath('/')" class="mm__logo" aria-label="SHURUI home">
        <img src="/brand/shurui-logo-white.png" alt="SHURUI" width="90" height="18">
      </NuxtLink>
      <div class="mm__controls">
        <button type="button" class="mm__icon" :aria-expanded="searching" aria-label="Search" @click="searching = !searching">
          <Icon name="search" :size="33" />
        </button>
        <button type="button" class="mm__icon" aria-label="Close menu" @click="emit('close')">
          <Icon name="close-thin" :size="24" />
        </button>
      </div>
    </div>

    <form v-if="searching" class="mm__search" role="search" @submit.prevent="submitSearch">
      <input v-model="term" type="search" placeholder="Search input" aria-label="Search" autofocus>
      <button type="submit" aria-label="Submit search"><Icon name="search" :size="20" /></button>
    </form>

    <nav class="mm__nav" aria-label="Main">
      <ul class="mm__list">
        <li v-for="item in props.nav" :key="item._uid" v-editable="item">
          <template v-if="childLinks(item).length">
            <button
              type="button"
              class="mm__row"
              :aria-expanded="expanded === item._uid"
              @click="expanded = expanded === item._uid ? null : item._uid"
            >
              {{ item.label }}
              <Icon name="expand-more" :size="20" class="mm__chevron" :class="{ 'is-open': expanded === item._uid }" />
            </button>
            <ul v-if="expanded === item._uid" class="mm__sub">
              <li v-for="link in childLinks(item)" :key="link._uid">
                <NuxtLink :to="sbHref(link.link)" class="mm__sub-link">{{ link.label }}</NuxtLink>
              </li>
            </ul>
          </template>
          <NuxtLink v-else :to="sbHref(item.link)" class="mm__row">{{ item.label }}</NuxtLink>
        </li>

        <li class="mm__langs">
          <NuxtLink
            v-for="code in localeCodes"
            :key="code"
            :to="switchLocalePath(code)"
            class="mm__row mm__lang"
            :class="{ 'is-current': code === locale }"
          >
            {{ code.toUpperCase() }}
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="mm__bottom">
      <div v-for="button in props.cta" :key="button._uid" class="mm__cta">
        <StoryblokComponent :blok="button" />
      </div>
      <ul v-if="props.socials.length" class="mm__socials">
        <li v-for="social in props.socials" :key="social._uid">
          <a :href="sbHref(social.url)" :aria-label="social.platform" target="_blank" rel="noopener">
            <Icon :name="ICONS[social.platform] || 'linkedin'" :size="32" />
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.mm {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: linear-gradient(160deg, #4169e8 0%, var(--c-black) 100%);
  color: var(--c-white);
}

.mm__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100px;
  padding-inline: 27px 28px;   /* logo ink lands at x30, as in Figma */
}
.mm__logo img { display: block; }
.mm__controls { display: flex; align-items: center; gap: 22px; }
.mm__icon { display: inline-flex; padding: 0; border: 0; background: none; color: inherit; cursor: pointer; }

.mm__search { position: relative; margin: 0 30px 12px; }
.mm__search input {
  width: 100%;
  height: 44px;
  padding: 0 44px 0 14px;
  border: 1px solid var(--c-black-100);
  border-radius: 4px;
  font-size: 1rem;
  color: var(--c-black);
}
.mm__search input::-webkit-search-cancel-button { display: none; }
.mm__search button {
  position: absolute; inset-inline-end: 10px; top: 50%; translate: 0 -50%;
  display: inline-flex; padding: 0; border: 0; background: none; color: var(--c-blue); cursor: pointer;
}

.mm__list, .mm__sub, .mm__socials { list-style: none; margin: 0; padding: 0; }
.mm__list > li + li { border-top: 1px solid rgb(255 255 255 / 50%); }

.mm__row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 90px;
  padding: 0 24px;
  border: 0;
  background: none;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
  color: var(--c-white);
  text-align: center;
  text-decoration: none;
  cursor: pointer;
}
.mm__chevron { transition: rotate 200ms ease; }
.mm__chevron.is-open { rotate: 180deg; }

.mm__sub { background: var(--c-white); }
.mm__sub li + li { border-top: 1px solid rgb(3 4 94 / 35%); }
.mm__sub-link {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 54px;
  padding: 0 24px;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--c-darkblue);
  text-decoration: none;
}

.mm__langs { display: flex; justify-content: center; }
.mm__lang { width: auto; }
.mm__lang:not(.is-current) { opacity: 0.6; }

.mm__bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;
  margin-top: auto;
  padding: 40px 30px 48px;
}
.mm__cta :deep(.btn) { min-width: 206px; }
.mm__socials { display: flex; gap: 30px; }
.mm__socials a { display: inline-flex; color: var(--c-white); }
</style>
