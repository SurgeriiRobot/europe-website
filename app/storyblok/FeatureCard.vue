<script setup lang="ts">
// As a band: a 760 / 800 / 760px row (by position), the photo filling one half, a
// 410px text column set 125px off the photo's edge and centred vertically. Title
// Inter 600 48/58, body 300 18/29.
const props = withDefaults(
  defineProps<{
    blok: any
    layout?: 'card' | 'band'
    variant?: 'classic' | 'stagger'
    flip?: boolean
    decor?: number
    first?: boolean
    last?: boolean
  }>(),
  { layout: 'card', variant: 'classic', flip: false, decor: 0, first: false, last: false },
)
const sbHref = useSbUrl()
const href = computed(() => (props.blok.link?.cached_url || props.blok.link?.url ? sbHref(props.blok.link) : null))
const media = computed(() => props.blok.media)
const stagger = computed(() => props.variant === 'stagger')
// Photo box height at 1440 (per band position), so the CDN crop matches the box
// exactly. Classic: band 1's photo is 760 + its 38px rise, band 3 is 760, band 2
// 800. Staggered: every photo is 800.
const photoH = computed(() => (stagger.value ? 800 : props.decor === 0 ? 798 : props.decor === 2 ? 760 : 800))
const bandClass = computed(() => [
  `band--${props.variant}`,
  stagger.value ? `band--s${props.decor}` : `band--decor-${props.decor}`,
  { 'band--flip': props.flip, 'band--first': props.first, 'band--last': props.last },
])
// Phones stack the band: a 390x300 photo, from `media_mobile` when the editor set
// one (the phone design frames these wider than the desktop halves).
const mediaMobile = computed(() => (props.blok.media_mobile?.filename ? props.blok.media_mobile : null))
</script>

<template>
  <div
    v-if="layout === 'band'"
    v-editable="blok"
    class="band"
    :class="bandClass"
    :data-theme="blok.theme || 'dark'"
  >
    <picture v-if="media?.filename" class="band__media">
      <source
        v-if="mediaMobile"
        media="(max-width: 860px)"
        :srcset="`${sbCrop(mediaMobile, 860)} 860w, ${sbCrop(mediaMobile, 1720)} 1720w`"
        sizes="100vw"
      >
      <img
        :src="sbCrop(media, 1440, photoH * 2)"
        :srcset="`${sbCrop(media, 720, photoH)} 720w, ${sbCrop(media, 1440, photoH * 2)} 1440w`"
        sizes="(max-width: 860px) 100vw, 50vw"
        :alt="media.alt || ''"
        loading="lazy"
      >
    </picture>
    <div v-else class="band__media" />
    <span class="band__line band__line--a" aria-hidden="true" />
    <span class="band__line band__line--b" aria-hidden="true" />
    <div class="band__panel">
      <div class="band__text">
        <h3 class="band__title"><BrandText :text="blok.title" /></h3>
        <p v-if="blok.body" class="band__body"><BrandText :text="blok.body" :nowrap="false" /></p>
        <NuxtLink v-if="href" :to="href" class="band__link">{{ blok.link_label || 'Learn more' }}</NuxtLink>
      </div>
    </div>
  </div>

  <!-- Static tags, not <component :is="'article'">: a dynamic "article" resolves
       to the Storyblok Article page component (registered globally) and crashes. -->
  <NuxtLink v-else-if="href" v-editable="blok" :to="href" class="card" :data-theme="blok.theme || 'light'">
    <img v-if="media?.filename" :src="sbCrop(media, 800)" :alt="media.alt || ''" class="card__media" loading="lazy">
    <div class="card__body">
      <h3 class="card__title">{{ blok.title }}</h3>
      <p v-if="blok.body" class="card__text">{{ blok.body }}</p>
    </div>
  </NuxtLink>
  <article v-else v-editable="blok" class="card" :data-theme="blok.theme || 'light'">
    <img v-if="media?.filename" :src="sbCrop(media, 800)" :alt="media.alt || ''" class="card__media" loading="lazy">
    <div class="card__body">
      <h3 class="card__title">{{ blok.title }}</h3>
      <p v-if="blok.body" class="card__text">{{ blok.body }}</p>
    </div>
  </article>
</template>

<style scoped>
.band {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: clamp(560px, calc(55.56 * var(--sx)), 800px);                 /* 800 */
}
/* Figma's first and third bands are 760 tall; only the middle one is 800. */
.band--decor-0, .band--decor-2 { min-height: clamp(530px, calc(52.78 * var(--sx)), 760px); }
.band__media { position: relative; overflow: hidden; }
/* The first band's photo starts 38px above its panel, over the bottom of the
   statement gradient (Figma 4683 vs 4721). */
.band--decor-0 .band__media { margin-top: calc(-2.64 * var(--sx)); }
.band__media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.band__panel {
  display: flex;
  align-items: center;
  padding-inline: clamp(24px, 8.68vw, 125px);   /* 125px off the photo's edge */
  color: var(--ink);
}
/* Each panel carries its theme's gradient, fitted to the design (tokens.css). */
.band[data-theme='dark'] .band__panel { background: var(--grad-band-dark); }
.band[data-theme='brand'] .band__panel { background: var(--grad-band-brand); }
.band[data-theme='gradient'] .band__panel { background: var(--grad-band-gradient); }
/* With the photo on the right, the column hugs the photo side: 125px off it. */
.band--flip .band__panel { justify-content: flex-end; }
/* Figma sits each column a little above the panel's centre (by 22 / 2 / 10px);
   bottom padding lifts the centred column by half its value. */
.band--decor-0 .band__panel { padding-bottom: calc(3.06 * var(--sx)); }
.band--decor-1 .band__panel { padding-bottom: calc(0.28 * var(--sx)); }
.band--decor-2 .band__panel { padding-bottom: calc(1.39 * var(--sx)); }
.band__text { display: grid; gap: 24px; max-width: 410px; }
.band__title { margin: 0; font-size: clamp(2rem, 3.33vw, 3rem); font-weight: 600; line-height: 1.2083; color: inherit; }
.band__body { margin: 0; font-size: 1.125rem; font-weight: 300; line-height: 1.6111; }
/* Figma has these in #0745fe, which nearly vanishes on the blue panels (about
   1.5:1 on the bright one); the panel's own text colour keeps them readable. */
.band__link {
  justify-self: start;
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.625rem;
  letter-spacing: 0.46px;
  margin-top: 6px;                 /* 30px under the body in Figma, not the column's 24 */
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 4px;
  transition: color 150ms ease;
}
.band__link:hover, .band__link:focus-visible { color: var(--c-blue-100); }
.band--flip .band__media { order: 2; }

/* White hairlines, placed per band as in Figma (x in % of the 1440 frame, y in
   design px scaled with the layout). */
.band__line { position: absolute; z-index: 1; border: 0 solid var(--line-light); pointer-events: none; }
.band--decor-0 .band__line--a { left: 95.07%; top: 0; bottom: 0; border-left-width: var(--line-w); }                       /* x1369, full height */
.band--decor-0 .band__line--b { left: 89.17%; right: 0; top: calc(48.33 * var(--sx)); border-top-width: var(--line-w); }    /* 1284->1440 @696 */
.band--decor-1 .band__line--a { left: 0; width: 50%; top: calc(51.53 * var(--sx)); border-top-width: var(--line-w); }       /* 0->720 @742 */
.band--decor-1 .band__line--b { left: var(--frame-gutter); top: calc(45.83 * var(--sx)); bottom: 0; border-left-width: var(--line-w); }  /* x75, 660->800 */
.band--decor-2 .band__line--a { left: 50%; right: 0; top: calc(4.375 * var(--sx)); border-top-width: var(--line-w); }      /* 720->1440 @63 */
.band--decor-2 .band__line--b { left: 58.96%; top: calc(4.375 * var(--sx)); height: calc(3.75 * var(--sx)); border-left-width: var(--line-w); }  /* x849, 63->117 */

/* ---- Staggered bands (SHURUI SP Robot, Figma bands at 3014-6254) ----------
   Every photo is 800 tall. The first band's panel starts 40px below its photo
   (the photo rises into the section above); the last band's panel runs 40px
   past its photo, and a blue line drops from the photo's corner through that
   strip into the next section. Panel colours and hairlines go by position. */
.band--stagger { min-height: clamp(560px, calc(55.56 * var(--sx)), 800px); }                 /* 800 */
.band--stagger.band--first { min-height: clamp(530px, calc(52.78 * var(--sx)), 760px); }     /* 760 */
.band--stagger.band--first .band__media { margin-top: calc(-2.78 * var(--sx)); }              /* 40 */
.band--stagger.band--last { min-height: clamp(590px, calc(58.33 * var(--sx)), 840px); }      /* 840 */
.band--stagger.band--last .band__media { align-self: start; height: clamp(560px, calc(55.56 * var(--sx)), 800px); }
.band--stagger.band--last::after {
  content: '';
  position: absolute;
  left: 50%;
  top: clamp(560px, calc(55.56 * var(--sx)), 800px);
  bottom: 0;
  border-left: var(--line-w) solid var(--c-blue);
}
/* Copy sits 10px below the first panel's centre, and the last band's copy is
   centred on its photo rather than on the taller panel. */
.band--stagger.band--first .band__panel { padding-top: calc(1.39 * var(--sx)); }     /* 20 */
.band--stagger.band--last .band__panel { padding-bottom: calc(5.56 * var(--sx)); }   /* 80 */
/* (Two classes, to outrank the per-theme panel colours above.) */
.band--stagger.band--s0 .band__panel { background: var(--grad-stagger-1); }
.band--stagger.band--s1 .band__panel { background: var(--grad-stagger-2); }
.band--stagger.band--s2 .band__panel { background: var(--grad-band-gradient); }
.band--stagger.band--s3 .band__panel { background: var(--grad-stagger-4); }

.band--s0 .band__line--a { left: 50%; right: 0; top: calc(3.54 * var(--sx)); border-top-width: var(--line-w); }                   /* 720->1440 @51 */
.band--s0 .band__line--b { left: 58.96%; top: calc(3.54 * var(--sx)); height: calc(3.75 * var(--sx)); border-left-width: var(--line-w); }  /* x849, 51->105 */
.band--s1 .band__line--a { left: var(--frame-gutter); top: 0; bottom: 0; border-left-width: var(--line-w); }                      /* x75, full height */
.band--s1 .band__line--b { left: 0; width: 10.63%; top: calc(4.375 * var(--sx)); border-top-width: var(--line-w); }               /* 0->153 @63 */
.band--s2 .band__line--a { left: 95.07%; top: 0; bottom: 0; border-left-width: var(--line-w); }                                   /* x1369, full height */
.band--s2 .band__line--b { left: 89.24%; right: 0; top: calc(52.36 * var(--sx)); border-top-width: var(--line-w); }               /* 1285->1440 @754 */
.band--s3 .band__line--a { left: 0; width: 50%; top: calc(4.93 * var(--sx)); border-top-width: var(--line-w); }                   /* 0->720 @71 */
.band--s3 .band__line--b { left: var(--frame-gutter); top: 0; height: calc(9.79 * var(--sx)); border-left-width: var(--line-w); } /* x75, 0->141 */

/* Phone design (390 wide): a 300px photo (77vw) over the panel; the copy starts
   at the panel's top (36px in, 16px from the edge), 24px between title and body,
   32px to the link, the panels fixed at 500 / 513 / 523px. */
@media (max-width: 860px) {
  .band, .band--decor-0, .band--decor-2 { grid-template-columns: 1fr; min-height: 0; }
  .band__media { display: block; min-height: 77vw; }
  .band--flip .band__media { order: 0; }
  .band--decor-0 .band__media { margin-top: 0; min-height: 78vw; }   /* the first photo is 304 */
  .band--decor-0 .band__media img, .band--decor-1 .band__media img { object-position: left center; }
  .band__panel,
  .band--decor-0 .band__panel,
  .band--decor-1 .band__panel,
  .band--decor-2 .band__panel { align-items: flex-start; justify-content: flex-start; padding: 36px 16px 96px; }
  /* The design's panels are fixed heights rather than hugging the copy. */
  .band--decor-0 .band__panel { min-height: 128.2vw; }     /* 500 */
  .band--decor-1 .band__panel { min-height: 131.5vw; }     /* 513 */
  .band--decor-2 .band__panel { min-height: 134.1vw; }     /* 523 */
  /* The phone design colours the brand panel without the pale corner, which
     would sit right under the heading here (sampled from the mobile frame). */
  .band[data-theme='brand'] .band__panel {
    background: linear-gradient(160deg, #6090fe 0%, #4470f6 25%, #3d62da 50%, #3650b3 75%, #2e387a 100%);
  }
  .band__text { gap: 24px; max-width: none; }
  .band__title { font-size: clamp(2.25rem, 12.3vw, 3rem); }
  .band__link { margin-top: 8px; }
  .band__line { display: none; }   /* placed for the side-by-side layout only */

  /* Staggered on phones (SP Robot mobile frame): each band 820 tall, photos of
     293 / 280px by position, the panel taking the rest; no rise or drop. */
  .band--stagger,
  .band--stagger.band--first,
  .band--stagger.band--last { grid-template-rows: auto 1fr; min-height: 210.26vw; }
  .band--stagger .band__media,
  .band--stagger.band--first .band__media,
  .band--stagger.band--last .band__media { align-self: stretch; height: 75.13vw; min-height: 0; margin-top: 0; }   /* 293 */
  .band--s1 .band__media, .band--s3 .band__media { height: 71.79vw !important; }                                  /* 280 */
  .band--stagger.band--last::after { display: none; }
  /* SP Robot's phone frame sets band copy 41px into the panel (home's: 36). */
  .band--stagger .band__panel,
  .band--stagger.band--first .band__panel,
  .band--stagger.band--last .band__panel { padding: 42px 16px 96px; }
}

.card {
  display: flex; flex-direction: column; overflow: hidden; min-height: 18rem;
  border-radius: var(--radius); background: var(--surface); color: var(--ink); text-decoration: none;
}
.card__media { width: 100%; height: 100%; object-fit: cover; flex: 1; }
.card__body { padding: var(--space-5); }
.card__title { font-size: var(--t-h4); margin-bottom: var(--space-2); }
.card__text { font-size: var(--t-body-sm); color: var(--ink-muted); }
</style>
