<script setup lang="ts">
// Figma `Frame 40` (1440x80): logo left, a right-aligned row where every item —
// nav links, CTA, language — sits 41px from the next (measured off the frame:
// 40px drifts the row 6px right by the first link), search 35px after the
// language and 5px in from the gutter. Items with
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

// Without hover there is no way to reveal the children, so the first tap opens
// the menu and the second follows the parent's own link. Keyboard users get the
// bar from `focusin` on the item, since they never produce a hover.
const onParentClick = (item: any, e: MouseEvent) => {
  if (canHover()) return
  if (openId.value !== item._uid) { e.preventDefault(); openId.value = item._uid }
}

// Sub-menus open on hover. A short close delay lets the pointer travel from a
// nav item down into the bar beneath it without the bar collapsing on the way,
// and a pointer-type check keeps touch devices on tap-to-open.
let closeTimer: ReturnType<typeof setTimeout> | undefined
let anchorTimer: ReturnType<typeof setTimeout> | undefined
const canHover = () => import.meta.client && window.matchMedia('(hover: hover)').matches
const hoverOpen = (item: any) => {
  if (!canHover()) return
  clearTimeout(closeTimer)
  openId.value = childLinks(item).length ? item._uid : null
}
const hoverClose = () => {
  if (!canHover()) return
  clearTimeout(closeTimer)
  closeTimer = setTimeout(() => { openId.value = null }, 180)
}
const hoverCancel = () => clearTimeout(closeTimer)
onBeforeUnmount(() => clearTimeout(closeTimer))

function openMobile(search = false) {
  mobileSearch.value = search
  mobileOpen.value = true
}

watch(() => route.fullPath, () => { openId.value = null })
useClickOutside(root, () => { openId.value = null })

// Phone design: over a page's opening hero the bar is transparent with a white
// logo and menu icon; once the hero has scrolled away it turns white again.
// (Desktop keeps the white bar throughout, as designed.)
const overHero = ref(false)
// Off the top of the page the bar turns translucent and casts a soft shadow;
// scrolling down hides it and scrolling back up brings it straight back, so the
// navigation is never more than a flick away without sitting over the content.
const scrolled = ref(false)
const hidden = ref(false)
const anchoring = ref(false)
const run = ref(0)
const nuxtApp = useNuxtApp()
onMounted(() => {
  const phone = window.matchMedia('(max-width: 1180px)')
  let lastY = window.scrollY
  const update = () => {
    const hero = document.querySelector<HTMLElement>('.site__main .hero-full:first-child')
    const bar = root.value?.offsetHeight || 64
    const y = window.scrollY
    overHero.value = phone.matches && !!hero && y < hero.offsetHeight - bar
    scrolled.value = y > 8
    // A menu that is open, or a bounce past either end of the page, must not
    // flip the bar; only a deliberate scroll past the bar's own height does.
    const delta = y - lastY
    // An anchor scroll is movement the visitor did not make with the wheel, and
    // hiding the bar on arrival left an empty strip above the section they had
    // just asked for. `anchoring` holds the bar still until it settles.
    // A few pixels used to be enough to hide the bar, so a nudge of the wheel
    // took the navigation away. It now has to be a deliberate run in one
    // direction: downward travel accumulates and only hides past a threshold,
    // and any upward movement brings it straight back.
    if (!openId.value && !mobileOpen.value && !anchoring.value && y > bar) {
      if (delta > 0) {
        run.value = Math.max(0, run.value) + delta
        if (run.value > 140) hidden.value = true
      }
      else if (delta < 0) {
        run.value = 0
        hidden.value = false
      }
    }
    if (y <= bar) { hidden.value = false; run.value = 0 }
    lastY = y
  }
  update()
  // Any click on a same-page link starts an anchor scroll.
  const onAnchor = (e: Event) => {
    const a = (e.target as HTMLElement)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null
    if (!a) return
    const href = a.getAttribute('href') || ''
    if (!href.includes('#') || href.startsWith('http')) return
    anchoring.value = true
    hidden.value = false
    clearTimeout(anchorTimer)
    anchorTimer = setTimeout(() => { anchoring.value = false }, 1400)
  }
  document.addEventListener('click', onAnchor, true)
  onBeforeUnmount(() => document.removeEventListener('click', onAnchor, true))
  window.addEventListener('scroll', update, { passive: true })
  phone.addEventListener('change', update)
  const off = nuxtApp.hook('page:finish', () => nextTick(update))
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', update)
    phone.removeEventListener('change', update)
    off()
  })
})
watch(openId, id => { if (id) hidden.value = false })
</script>

<template>
  <header
    ref="root"
    v-editable="blok"
    class="hdr"
    :class="{ 'hdr--over-hero': overHero, 'hdr--scrolled': scrolled, 'hdr--hidden': hidden }"
    @keydown.esc="openId = null"
    @mouseleave="hoverClose"
  >
    <div class="hdr__bar">
      <NuxtLink :to="localePath('/')" class="hdr__logo" aria-label="SHURUI home">
        <img class="hdr__logo-img" :src="blok.logo?.filename || '/brand/shurui-logo.png'" alt="SHURUI" width="105" height="21">
        <img class="hdr__logo-img hdr__logo-img--light" src="/brand/shurui-logo-white.png" alt="" width="105" height="21">
      </NuxtLink>

      <div class="hdr__right">
        <nav aria-label="Main">
          <ul class="hdr__links">
            <li
              v-for="item in nav"
              :key="item._uid"
              v-editable="item"
              @mouseenter="hoverOpen(item)"
              @focusin="openId = childLinks(item).length ? item._uid : null"
            >
              <!-- A parent is a real page as well as a menu, so it has to be a
                   link: as a button it had no href, which left its children
                   reachable only by opening the menu. Where there is no hover,
                   the first tap opens the menu instead of navigating. -->
              <NuxtLink
                v-if="childLinks(item).length"
                :to="sbHref(item.link)"
                class="hdr__link"
                :class="{ 'is-active': isActive(item) }"
                :aria-expanded="openId === item._uid"
                :aria-controls="`subnav-${item._uid}`"
                @click="onParentClick(item, $event)"
              >
                {{ item.label }}
              </NuxtLink>
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

      <!-- Phone design: the hamburger alone; search lives inside the menu. -->
      <div class="hdr__mobile">
        <button type="button" class="hdr__icon" aria-label="Open menu" :aria-expanded="mobileOpen" @click="openMobile()">
          <Icon name="menu-thin" :size="28" />
        </button>
      </div>
    </div>

    <!-- The bar drops open from under the header; switching between two
         menus keeps the bar and swaps only its links. -->
    <Transition name="subnav">
      <div
        v-if="openItem"
        :id="`subnav-${openItem._uid}`"
        class="hdr__subnav"
        @mouseenter="hoverCancel"
        @mouseleave="hoverClose"
        @focusin="hoverCancel"
      >
        <Transition name="sublinks" mode="out-in">
          <ul :key="openItem._uid" class="hdr__sublinks">
            <li v-for="link in childLinks(openItem)" :key="link._uid" v-editable="link">
              <NuxtLink :to="sbHref(link.link)" class="hdr__sublink" :class="{ 'is-active': matches(sbHref(link.link)) }">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </Transition>
      </div>
    </Transition>

    <Transition name="mm">
      <HeaderMobileMenu
        v-if="mobileOpen"
        :nav="nav"
        :cta="blok.cta || []"
        :socials="socials || []"
        :initial-search="mobileSearch"
        @close="mobileOpen = false"
      />
    </Transition>
  </header>
</template>

<style scoped>
.hdr {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--c-white);
  transition: background-color 250ms ease, box-shadow 250ms ease, transform 300ms ease;
}
/* Translucent once the page has moved, with a shadow soft enough to read as
   depth rather than as a border. */
.hdr--scrolled {
  background: rgb(255 255 255 / 88%);
  box-shadow: 0 2px 16px rgb(16 20 77 / 8%);
  backdrop-filter: blur(12px);
}
.hdr--hidden { transform: translateY(-100%); }
@media (prefers-reduced-motion: reduce) {
  .hdr { transition: background-color 250ms ease, box-shadow 250ms ease; }
  .hdr--hidden { transform: none; }
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
.hdr__logo { position: relative; display: block; }
.hdr__logo img { display: block; width: 105px; height: auto; transition: opacity 250ms ease; }
.hdr__logo-img--light { position: absolute; inset: 0; opacity: 0; }

.hdr__right { display: flex; align-items: center; gap: 41px; }
.hdr__links { display: flex; gap: 41px; margin: 0; padding: 0; list-style: none; }

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
.hdr__link { color: var(--c-darkblue); transition: color 150ms ease; }
.hdr__link:hover,
.hdr__link.is-active { color: var(--c-blue); }

/* Overlays the page instead of pushing it down, so opening a menu never shifts
   the content underneath. */
.hdr__subnav {
  position: absolute;
  inset-inline: 0;
  top: 100%;
  background: var(--c-black-300);
}
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
.hdr__sublink { color: var(--c-white); transition: color 150ms ease; }
.hdr__sublink:hover,
.hdr__sublink.is-active { color: var(--c-blue-100); }

/* Bar: unrolls downward from the header's bottom edge. */
.subnav-enter-active { transition: clip-path 320ms cubic-bezier(0.22, 1, 0.36, 1); }
.subnav-leave-active { transition: clip-path 200ms cubic-bezier(0.4, 0, 1, 1); }
.subnav-enter-from, .subnav-leave-to { clip-path: inset(0 0 100% 0); }
.subnav-enter-to, .subnav-leave-from { clip-path: inset(0 0 0 0); }

/* Links: settle in just behind the bar; on a menu switch they swap in place. */
.sublinks-enter-active { transition: opacity 240ms ease 60ms, transform 320ms cubic-bezier(0.22, 1, 0.36, 1) 60ms; }
.sublinks-leave-active { transition: opacity 120ms ease; }
.sublinks-enter-from { opacity: 0; transform: translateY(-6px); }
.sublinks-leave-to { opacity: 0; }

/* Mobile menu: fades in while sliding down a touch. */
.mm-enter-active { transition: opacity 260ms ease, transform 320ms cubic-bezier(0.22, 1, 0.36, 1); }
.mm-leave-active { transition: opacity 180ms ease, transform 180ms ease; }
.mm-enter-from, .mm-leave-to { opacity: 0; transform: translateY(-12px); }

.hdr__mobile { display: none; align-items: center; gap: 18px; }
.hdr__icon {
  display: inline-flex;
  padding: 0;
  border: 0;
  background: none;
  color: var(--c-darkblue);
  cursor: pointer;
  transition: color 250ms ease;
}

/* The desktop row needs ~1180px (876px of nav plus logo and gutters). */
@media (max-width: 1180px) {
  .hdr__right, .hdr__subnav { display: none; }
  .hdr__mobile { display: flex; }
  /* Phone design: 92px logo and the hamburger both 26px in from the edges. */
  .hdr__bar { padding-inline: clamp(16px, 6.67vw, 26px); }
  .hdr__logo img { width: 92px; }
  /* Over a hero the bar is fully transparent, so the scrolled treatment must
     not leave a shadow or a blur hanging over the artwork. A scrim keeps the
     white logo and menu icon legible: several heroes are pale photographs, and
     without it both simply vanished, leaving no way to reach the menu at all. */
  .hdr--over-hero {
    background-color: transparent;
    background-image: linear-gradient(180deg, rgb(0 0 0 / 46%) 0%, rgb(0 0 0 / 28%) 55%, rgb(0 0 0 / 0%) 100%);
    box-shadow: none;
    backdrop-filter: none;
  }
  .hdr--over-hero .hdr__logo-img { opacity: 0; }
  .hdr--over-hero .hdr__logo-img--light { opacity: 1; }
  .hdr--over-hero .hdr__icon { color: var(--c-white); }
}
</style>
