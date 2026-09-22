<script setup lang="ts">
// Figma footer (page y 13914, 1440x859) on the vertical brand wash:
//   nav    — column titles, Inter 600 20/24, centred at y 51, 40px apart
//   legal  — Inter 600 16/19 on a 38px pitch, left at the gutter / right-aligned
//   social — three icons on the centre axis at y 377
//   words  — "SP Surgical System" (600 28/34) over a 476px Lora "Shurui" that the
//            footer's bottom edge clips
//   rules  — full-width hairlines at y 128 and 435, gutter verticals at 75/1365
const props = defineProps<{ blok: any }>()
const sbHref = useSbUrl()
const { locale } = useI18n()

const nav = computed(() =>
  (props.blok.columns || [])
    .map((c: any) => ({ uid: c._uid, label: c.title, link: c.links?.[0]?.link, blok: c }))
    .filter((c: any) => c.label),
)
const legal = computed<any[]>(() => props.blok.legal_links || [])
const half = computed(() => Math.ceil(legal.value.length / 2))
const ICONS: Record<string, 'linkedin' | 'phone' | 'mail'> = { linkedin: 'linkedin', phone: 'phone', email: 'mail' }
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
      <li><span>{{ locale.toUpperCase() }}</span></li>
    </ul>

    <ul v-if="blok.socials?.length" class="ftr__socials">
      <li v-for="social in blok.socials" :key="social._uid" v-editable="social">
        <a :href="sbHref(social.url)" :aria-label="social.platform" target="_blank" rel="noopener">
          <Icon :name="ICONS[social.platform] || 'linkedin'" :size="24" />
        </a>
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
.ftr a { color: inherit; text-decoration: none; }
.ftr a:hover { text-decoration: underline; }

.ftr__rule { position: absolute; border: 0 solid var(--c-white); }
.ftr__rule--h1, .ftr__rule--h2 { inset-inline: 0; border-top-width: var(--line-w); }
.ftr__rule--h1 { top: 8.89vw; }             /* 128 */
.ftr__rule--h2 { top: 30.21vw; }            /* 435 */
.ftr__rule--v { border-left-width: var(--line-w); }
.ftr__rule--l1, .ftr__rule--r1 { top: 0; height: 10.9vw; }          /* 0-157 */
.ftr__rule--l2, .ftr__rule--r2 { top: 27.71vw; height: 2.5vw; }     /* 399-435 */
.ftr__rule--l1, .ftr__rule--l2 { left: 5.21vw; }                    /* 75 */
.ftr__rule--r1, .ftr__rule--r2 { right: 5.21vw; }

.ftr__nav {
  position: absolute;
  top: 3.54vw;                              /* 51 */
  inset-inline: 0;
  display: flex;
  justify-content: center;
  gap: 40px;
}
.ftr__nav-link { padding: 4px 5px; font-size: clamp(1rem, 1.39vw, 1.25rem); font-weight: 600; line-height: 1.2; }

.ftr__legal {
  position: absolute;
  top: 15.97vw;                             /* 230 */
  display: grid;
  gap: 19px;                                /* 38px pitch at 19px line height */
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.1875;
}
.ftr__legal--left { left: 5.21vw; }
.ftr__legal--right { right: 5.21vw; text-align: right; }

.ftr__socials {
  position: absolute;
  top: 26.18vw;                             /* 377 */
  left: 50%;
  display: flex;
  gap: 31px;                                /* 55px pitch */
  margin: 0;
  padding: 0;
  list-style: none;
  translate: -50% 0;
}
.ftr__socials a { display: inline-flex; }

.ftr__word {
  position: absolute;
  top: 27.71vw;                             /* 399 */
  left: 50%;
  margin: 0;
  translate: -50% 0;
  font-size: 33.06vw;                       /* 476 */
  line-height: 1.2;
  color: var(--c-leather-200);
  pointer-events: none;
  user-select: none;
}
.ftr__caption {
  position: absolute;
  top: 35vw;                                /* 504 */
  inset-inline: 0;
  margin: 0;
  font-size: clamp(1.25rem, 1.94vw, 1.75rem);
  font-weight: 600;
  line-height: 1.214;
  text-align: center;
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
  .ftr__word { order: 10; margin-bottom: -12vw; }
}
</style>
