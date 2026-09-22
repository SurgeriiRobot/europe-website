<script setup lang="ts">
// Figma `Frame 40` (1440x80): logo left, a right-aligned row where every item —
// nav links, CTA, language, search — sits 40px from the next. Items with
// children open a full-width 50px #575d6b sub-nav bar beneath the header.
const props = defineProps<{ blok: any, socials?: any[] }>()

const sbHref = useSbUrl()
const route = useRoute()
const localePath = useLocalePath()
const root = ref<HTMLElement>()

const nav = computed<any[]>(() => props.blok.nav || [])
const childLinks = (item: any): any[] => (item.columns || []).flatMap((c: any) => c.links || [])

const openId = ref<string | null>(null)
const openItem = computed(() => nav.value.find(i => i._uid === openId.value))
const mobileOpen = ref(false)
const mobileSearch = ref(false)

const current = computed(() => route.path.replace(/\/$/, '') || '/')
const matches = (href: string) =>
  href !== '#' && href !== '/' && (current.value === href || current.value.startsWith(`${href}/`))

// A top-level item reads as active while its bar is open, or when the current
// page lives under it — so the header still orients you after navigating.
const isActive = (item: any) => {
  if (openId.value === item._uid) return true
  const kids = childLinks(item)
  return kids.length ? kids.some(l => matches(sbHref(l.link))) : matches(sbHref(item.link))
}

const toggle = (item: any) => { openId.value = openId.value === item._uid ? null : item._uid }

function openMobile(search = false) {
  mobileSearch.value = search
  mobileOpen.value = true
}

watch(() => route.fullPath, () => { openId.value = null })
useClickOutside(root, () => { openId.value = null })
</script>

<template>
  <header ref="root" v-editable="blok" class="hdr" @keydown.esc="openId = null">
    <div class="hdr__bar">
      <NuxtLink :to="localePath('/')" class="hdr__logo" aria-label="SHURUI home">
        <img :src="blok.logo?.filename || '/brand/shurui-logo.png'" alt="SHURUI" width="104" height="21">
      </NuxtLink>

      <div class="hdr__right">
        <nav aria-label="Main">
          <ul class="hdr__links">
            <li v-for="item in nav" :key="item._uid" v-editable="item">
              <button
                v-if="childLinks(item).length"
                type="button"
                class="hdr__link"
                :class="{ 'is-active': isActive(item) }"
                :aria-expanded="openId === item._uid"
                :aria-controls="`subnav-${item._uid}`"
                @click="toggle(item)"
              >
                {{ item.label }}
              </button>
              <NuxtLink v-else :to="sbHref(item.link)" class="hdr__link" :class="{ 'is-active': isActive(item) }">
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <StoryblokComponent v-for="cta in blok.cta || []" :key="cta._uid" :blok="cta" />
        <LanguageSwitcher v-if="blok.show_language_switcher" />
        <HeaderSearch v-if="blok.show_search" />
      </div>

      <div class="hdr__mobile">
        <button v-if="blok.show_search" type="button" class="hdr__icon" aria-label="Search" @click="openMobile(true)">
          <Icon name="search" :size="24" />
        </button>
        <button type="button" class="hdr__icon" aria-label="Open menu" :aria-expanded="mobileOpen" @click="openMobile()">
          <Icon name="menu" :size="28" />
        </button>
      </div>
    </div>

    <div v-if="openItem" :id="`subnav-${openItem._uid}`" class="hdr__subnav">
      <ul class="hdr__sublinks">
        <li v-for="link in childLinks(openItem)" :key="link._uid" v-editable="link">
          <NuxtLink :to="sbHref(link.link)" class="hdr__sublink" :class="{ 'is-active': matches(sbHref(link.link)) }">
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </div>

    <HeaderMobileMenu
      v-if="mobileOpen"
      :nav="nav"
      :cta="blok.cta || []"
      :socials="socials || []"
      :initial-search="mobileSearch"
      @close="mobileOpen = false"
    />
  </header>
</template>

<style scoped>
.hdr {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--c-white);
}

.hdr__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: var(--container);
  height: var(--header-h);
  margin-inline: auto;
  padding-inline: clamp(16px, 5.2vw, 75px);
}
.hdr__logo img { display: block; width: 104px; height: auto; }

.hdr__right { display: flex; align-items: center; gap: 40px; }
.hdr__links { display: flex; gap: 40px; margin: 0; padding: 0; list-style: none; }

/* Figma nav `<Button>` (MUI text button): Inter 500 13/22, +0.46px, 4px 5px. */
.hdr__link,
.hdr__sublink {
  display: inline-block;
  padding: 4px 5px;
  border: 0;
  border-radius: 4px;
  background: none;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.375rem;
  letter-spacing: 0.46px;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}
.hdr__link { color: var(--c-darkblue); }
.hdr__link:hover,
.hdr__link.is-active { color: var(--c-blue); }

.hdr__subnav { background: var(--c-black-300); }
.hdr__sublinks {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 44px;             /* 54px text-to-text in Figma, minus 2 x 5px link padding */
  height: 50px;
  margin: 0;
  padding: 0 var(--gutter);
  list-style: none;
}
.hdr__sublink { color: var(--c-white); }
.hdr__sublink:hover,
.hdr__sublink.is-active { color: var(--c-blue-100); }

.hdr__mobile { display: none; align-items: center; gap: 18px; }
.hdr__icon { display: inline-flex; padding: 0; border: 0; background: none; color: var(--c-darkblue); cursor: pointer; }

/* The desktop row needs ~1180px (876px of nav plus logo and gutters). */
@media (max-width: 1180px) {
  .hdr__right, .hdr__subnav { display: none; }
  .hdr__mobile { display: flex; }
}
</style>
