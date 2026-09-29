<script setup lang="ts">
// Clinical Applications intro (Figma 800-1694): an optional hairline frame
// across the top (gutter ticks down from the hero, a rule 52px down), a 72px
// centred title set in the editor's lines, a 16px body, and a row of links to
// the sections below, separated by bars. Phones stack the links, each with a
// rule under it.
const props = defineProps<{ blok: any }>()
const links = computed<any[]>(() => props.blok.links || [])
const sbHref = useSbUrl()
const hrefOf = (l: any) => (l && (l.cached_url || l.url || l.story?.full_slug) ? sbHref(l) : undefined)
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section intro" :data-theme="blok.theme || 'light'">
    <SectionConnector :connector="blok.connector" />
    <template v-if="blok.frame_top">
      <span class="intro__frame intro__frame--left" aria-hidden="true" />
      <span class="intro__frame intro__frame--right" aria-hidden="true" />
      <span class="intro__rule" aria-hidden="true" />
    </template>
    <div class="container intro__inner">
      <h2 class="intro__title"><BrandText :text="blok.headline" /></h2>
      <p v-if="blok.body" class="intro__body"><BrandText :text="blok.body" :nowrap="false" /></p>
      <ul v-if="links.length" class="intro__links">
        <li v-for="item in links" :key="item._uid" v-editable="item" class="intro__item">
          <a :href="hrefOf(item.link)" class="intro__link">{{ item.label }}</a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.intro {
  --connector-len: calc(6.94 * var(--sx));                                  /* 100 */
  padding: calc(9.07 * var(--sx)) 0 calc(16.88 * var(--sx));                /* 130.6 to the title / 243 */
}
/* Gutter ticks at x75 and x1365 running 52px down from the hero, over a
   full-width rule. */
.intro__frame { position: absolute; top: 0; height: calc(3.61 * var(--sx)); border-left: var(--line-w) solid var(--line); }   /* 52 */
.intro__frame--left { left: var(--frame-gutter); }
.intro__frame--right { right: var(--frame-gutter); }
.intro__rule { position: absolute; inset-inline: 0; top: calc(3.61 * var(--sx)); border-top: var(--line-w) solid var(--line); }

.intro__inner { display: grid; justify-items: center; text-align: center; }
.intro__title {
  margin: 0;
  font-size: clamp(2.75rem, 5vw, 4.5rem);                                   /* 72 */
  font-weight: 600;
  line-height: 1.1944;                                                      /* 86/72 */
  color: var(--ink);
  white-space: pre-line;
}
.intro__body {
  max-width: 430px;
  margin: calc(2.43 * var(--sx)) 0 0;                                        /* 35 */
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.625;                                                       /* 16/26 */
  color: var(--ink-muted);
}
.intro__links { display: flex; flex-wrap: wrap; justify-content: center; margin: calc(6.53 * var(--sx)) 0 0; padding: 0; list-style: none; }   /* 94 */
.intro__item { font-size: 1.5rem; font-weight: 600; line-height: 1.2083; color: var(--c-darkblue); }   /* 24/29 */
.intro__item + .intro__item::before { content: '\00a0\00a0|\00a0\00a0'; }
.intro__link { color: var(--c-blue); text-decoration: none; }
.intro__link:hover { text-decoration: underline; text-underline-offset: 4px; }

/* Phone design (780-1730): the frame's ticks sit 37px in, the title is 42/50,
   the body 18/29, and the links stack 58px apart, each over a navy rule that
   runs 8px past the word. */
@media (max-width: 720px) {
  .intro { --connector-len: 80px; padding: 72px 0 150px; }
  .intro__frame { height: 34px; }
  .intro__frame--left { left: 37.5px; }
  .intro__frame--right { right: 40.5px; }
  .intro__rule { top: 34px; }
  .intro__title { font-size: clamp(2.25rem, 10.77vw, 2.625rem); line-height: 1.1905; }   /* 42/50 */
  .intro__body { max-width: 352px; margin-top: 38px; font-size: 1.125rem; line-height: 1.6111; }
  .intro__links { flex-direction: column; align-items: center; gap: 21px; margin-top: 35px; }
  .intro__item + .intro__item::before { content: none; }
  .intro__link { display: inline-block; padding: 0 8px 7px; border-bottom: 1px solid var(--c-darkblue); }
  .intro__link:hover { text-decoration: none; }
}
</style>
