<script setup lang="ts">
// Figma footer (page y 13914, 1440x859) on the vertical brand wash:
//   nav    — column titles, Inter 600 20/24, centred at y 51, 45px apart
//   legal  — Inter 600 16/19 on a 38px pitch, left at the gutter / right-aligned
//   social — three icons on the centre axis at y 377
//   words  — "SP Surgical System" (600 28/34, left edge at x 520) over a 476px
//            Lora "Shurui" that the footer's bottom edge clips
//   rules  — full-width hairlines at y 128 and 435, gutter verticals at 75/1365
const props = defineProps<{ blok: any }>()
const sbHref = useSbUrl()
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

// Waitak, global feedback: "Will need the language Button to be able to change.
// So should or have the dropdown like in the Main Menu." It printed the current
// locale and nothing else. The list opens upward, since this sits at the very
// bottom of the page.
const localeCodes = computed(() => (locales.value as any[]).map(l => (typeof l === 'string' ? l : l.code)))
const otherLocales = computed(() => localeCodes.value.filter(c => c !== locale.value))
const langOpen = ref(false)
const langEl = ref<HTMLElement>()
onMounted(() => {
  const away = (e: Event) => { if (!langEl.value?.contains(e.target as Node)) langOpen.value = false }
  const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') langOpen.value = false }
  document.addEventListener('click', away)
  document.addEventListener('keydown', esc)
  onBeforeUnmount(() => { document.removeEventListener('click', away); document.removeEventListener('keydown', esc) })
})

const nav = computed(() =>
  (props.blok.columns || [])
    .map((c: any) => ({ uid: c._uid, label: c.title, link: c.links?.[0]?.link, blok: c }))
    .filter((c: any) => c.label),
)
const legal = computed<any[]>(() => props.blok.legal_links || [])
const half = computed(() => Math.ceil(legal.value.length / 2))
const ICONS: Record<string, 'linkedin' | 'phone' | 'mail'> = { linkedin: 'linkedin', phone: 'phone', email: 'mail' }
const LABELS: Record<string, string> = { linkedin: 'LinkedIn', phone: 'Phone', email: 'Email', youtube: 'YouTube', x: 'X' }
// A social entry without a link yet (phone / email are added later in the CMS)
// still shows its icon, just not as a link.
const socialHref = (social: any) => {
  const href = sbHref(social.url)
  return href && href !== '#' ? href : null
}
</script>

<template>
  <footer v-editable="blok" class="ftr">
    <span class="ftr__rule ftr__rule--h1" aria-hidden="true" />
    <span class="ftr__rule ftr__rule--h2" aria-hidden="true" />
    <span class="ftr__rule ftr__rule--v ftr__rule--l1" aria-hidden="true" />
    <span class="ftr__rule ftr__rule--v ftr__rule--r1" aria-hidden="true" />
    <span class="ftr__rule ftr__rule--v ftr__rule--l2" aria-hidden="true" />
    <span class="ftr__rule ftr__rule--v ftr__rule--r2" aria-hidden="true" />

    <nav class="ftr__nav" aria-label="Footer">
      <NuxtLink v-for="item in nav" :key="item.uid" v-editable="item.blok" :to="sbHref(item.link)" class="ftr__nav-link">
        {{ item.label }}
      </NuxtLink>
    </nav>

    <ul class="ftr__legal ftr__legal--left">
      <li v-for="item in legal.slice(0, half)" :key="item._uid" v-editable="item">
        <NuxtLink :to="sbHref(item.link)">{{ item.label }}</NuxtLink>
      </li>
    </ul>
    <ul class="ftr__legal ftr__legal--right">
      <li v-for="item in legal.slice(half)" :key="item._uid" v-editable="item">
        <NuxtLink :to="sbHref(item.link)">{{ item.label }}</NuxtLink>
      </li>
      <li v-if="otherLocales.length" ref="langEl" class="ftr__lang">
        <button
          type="button"
          class="ftr__lang-btn"
          :aria-expanded="langOpen"
          aria-label="Change language"
          @click="langOpen = !langOpen"
        >
          {{ locale.toUpperCase() }}
          <Icon name="expand-more" :size="16" class="ftr__lang-chevron" :class="{ 'is-open': langOpen }" />
        </button>
        <ul class="ftr__lang-list" :class="{ 'is-open': langOpen }" :inert="!langOpen">
          <li v-for="code in otherLocales" :key="code">
            <NuxtLink :to="switchLocalePath(code)" @click="langOpen = false">{{ code.toUpperCase() }}</NuxtLink>
          </li>
        </ul>
      </li>
      <li v-else><span>{{ locale.toUpperCase() }}</span></li>
    </ul>

    <ul v-if="blok.socials?.length" class="ftr__socials">
      <li v-for="social in blok.socials" :key="social._uid" v-editable="social">
        <a
          v-if="socialHref(social)"
          :href="socialHref(social)!"
          :aria-label="LABELS[social.platform] || social.platform"
          v-bind="/^https?:/.test(socialHref(social)!) ? { target: '_blank', rel: 'noopener' } : {}"
        >
          <Icon :name="ICONS[social.platform] || 'linkedin'" :size="24" />
        </a>
        <span v-else :aria-label="LABELS[social.platform] || social.platform" role="img">
          <Icon :name="ICONS[social.platform] || 'linkedin'" :size="24" />
        </span>
      </li>
    </ul>

    <p v-if="blok.wordmark" class="ftr__word display-word" aria-hidden="true">{{ blok.wordmark }}</p>
    <p v-if="blok.wordmark_caption" class="ftr__caption">{{ blok.wordmark_caption }}</p>
  </footer>
</template>

<style scoped>
/* Desktop is laid out on the design's own coordinates, in vw so it scales. */
.ftr {
  position: relative;
  height: clamp(560px, 59.65vw, 859px);      /* 859/1440 */
  overflow: hidden;
  background: var(--grad-footer);
  color: var(--c-white);
}
.ftr a { color: inherit; text-decoration: none; transition: color 150ms ease; }
.ftr a:hover, .ftr a:focus-visible { color: var(--c-blue-100); }

.ftr__rule { position: absolute; border: 0 solid var(--line-light); }
.ftr__rule--h1, .ftr__rule--h2 { inset-inline: 0; border-top-width: var(--line-w); }
.ftr__rule--h1 { top: 14.9%; }              /* 128 of 859 */
.ftr__rule--h2 { top: 50.6%; }              /* 435 of 859 */
.ftr__rule--v { border-left-width: var(--line-w); }
.ftr__rule--l1, .ftr__rule--r1 { top: 0; height: 18.3%; }           /* 0-157 */
.ftr__rule--l2, .ftr__rule--r2 { top: 46.45%; height: 4.2%; }       /* 399-435 */
.ftr__rule--l1, .ftr__rule--l2 { left: var(--frame-gutter); }
.ftr__rule--r1, .ftr__rule--r2 { right: var(--frame-gutter); }

.ftr__nav {
  position: absolute;
  top: 5.94%;                               /* 51 of 859 */
  inset-inline: 0;
  display: flex;
  justify-content: center;
  gap: 45px;                                /* 58px between words, as in Figma */
}
.ftr__nav-link { padding: 4px 5px; font-size: clamp(1rem, 1.39vw, 1.25rem); font-weight: 600; line-height: 1.2; }

.ftr__legal {
  position: absolute;
  top: 26.8%;                               /* 230 of 859 */
  display: grid;
  gap: 19px;                                /* 38px pitch at 19px line height */
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.1875;
}
.ftr__legal--left { left: var(--frame-gutter); }

/* The language control. Closed it reads exactly as the old locale mark did, so
   the footer keeps the design's rhythm; open, the other locales stack above it. */
.ftr__lang { position: relative; }
.ftr__lang-btn {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.ftr__lang-chevron { transition: rotate 150ms ease; }
.ftr__lang-chevron.is-open { rotate: 180deg; }
.ftr__lang-list {
  position: absolute;
  right: 0;
  bottom: 100%;
  display: grid;
  gap: 10px;
  margin: 0 0 10px;
  padding: 12px 14px;
  border: var(--line-w) solid color-mix(in srgb, currentColor 35%, transparent);
  background: var(--c-darkblue);
  list-style: none;
  text-align: right;
  opacity: 0;
  visibility: hidden;
  transition: opacity 150ms ease, visibility 150ms ease;
}
.ftr__lang-list.is-open { opacity: 1; visibility: visible; }
.ftr__lang-list a { text-decoration: none; }
.ftr__lang-list a:hover { text-decoration: underline; }
.ftr__legal--right { right: var(--frame-gutter); text-align: right; }

.ftr__socials {
  position: absolute;
  top: 43.9%;                               /* 377 of 859 */
  left: 50%;
  display: flex;
  gap: 31px;                                /* 55px pitch */
  margin: 0;
  padding: 0;
  list-style: none;
  translate: -50% 0;
}
.ftr__socials a, .ftr__socials span { display: inline-flex; }

.ftr__word {
  position: absolute;
  top: 46.45%;                              /* 399 of 859 */
  left: 50%;
  margin: 0;
  translate: -50% 0;
  font-size: calc(33.06 * var(--sx));       /* 476 */
  line-height: 1.2;
  color: var(--c-leather-200);
  pointer-events: none;
  user-select: none;
}
.ftr__caption {
  position: absolute;
  top: 58.7%;                               /* 504 of 859 */
  left: 36.15%;                             /* x 520: Figma sets it left of centre */
  margin: 0;
  font-size: clamp(1.25rem, 1.94vw, 1.75rem);
  font-weight: 600;
  line-height: 1.214;
  white-space: nowrap;
}

/* Below ~900px the coordinate layout gets cramped: stack it instead. */
@media (max-width: 900px) {
  .ftr { display: flex; flex-direction: column; align-items: center; gap: 32px; height: auto; padding: 48px 20px 0; }
  .ftr__rule { display: none; }
  .ftr__nav, .ftr__legal, .ftr__socials, .ftr__word, .ftr__caption { position: static; translate: none; }
  .ftr__nav { flex-wrap: wrap; gap: 8px 24px; }
  .ftr__legal { gap: 12px; text-align: center; }
  .ftr__legal--right { text-align: center; }
  .ftr__caption { order: 9; }
  .ftr__word { order: 10; margin-bottom: -14vw; }
}

/* Phone design (390 wide): everything stacked and centred at 20px on a 64px
   pitch — nav, a full-width hairline, the legal links, the three icons at 40px,
   a second hairline — then the caption over a 131px "Shurui" the edge clips. */
@media (max-width: 720px) {
  .ftr { gap: 0; padding: 71px 16px 0; }
  .ftr__nav { order: 1; flex-direction: column; align-items: center; gap: 40px; }
  .ftr__nav-link { padding: 0; font-size: 1.25rem; }
  .ftr__rule--h1, .ftr__rule--h2 { position: static; display: block; align-self: stretch; margin-inline: -16px; }
  .ftr__rule--h1 { order: 2; margin-top: 54px; }
  .ftr__legal { gap: 40px; font-size: 1.25rem; line-height: 1.2; }
  .ftr__legal--left { order: 3; margin-top: 49px; }
  .ftr__legal--right { order: 4; margin-top: 40px; }
  .ftr__legal--right li:last-child { display: none; }       /* the locale control isn't in the phone footer; the hamburger menu carries it */
  .ftr__socials { order: 5; gap: 42px; margin-top: 260px; }
  .ftr__socials :deep(.icon) { width: 40px; height: 40px; }      /* 82px apart, centre to centre */
  .ftr__rule--h2 { order: 6; margin-top: 57px; }
  .ftr__caption { order: 7; margin-top: 50px; font-size: 1.75rem; }
  /* The word sits on the bottom edge and is clipped a little by it: below the
     baseline the line box carries about 0.2em of descender and leading, so that
     much is pulled off plus a few px of the letterforms. */
  .ftr__word { order: 8; margin: -22px 0 -7.7vw; font-size: 33.6vw; }   /* 131px */
}
</style>
