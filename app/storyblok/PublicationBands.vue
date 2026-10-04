<script setup lang="ts">
// Clinical Evidence "Selected publications" (clinical-evidence-desktop,
// 4945-9305). One blue region holding a 48px title and a 630px paragraph, four
// 800px rows that alternate photograph and copy — 410px text column 125px off
// the photograph's edge, Inter 600 34/41 over 300 18/29 and an underlined
// 15px link — and a closing 48px title with a button.
//
// Figma paints each row's panel with its own gradient rather than running one
// wash down the section, and hangs a pair of white hairlines on every row; both
// go by row position, as they do on the SP Robot bands. The first row's
// photograph starts 39px above its panel, in the title region's foot.
const props = defineProps<{ blok: any }>()
const items = computed<any[]>(() => props.blok.items || [])
const sbHref = useSbUrl()
const hrefOf = (l: any) => (l && (l.cached_url || l.url || l.story?.full_slug) ? sbHref(l) : null)

const px = (v: unknown) => (Number(v) > 0 ? `${Number(v)}px` : undefined)
const style = computed(() => ({
  '--pb-top': px(props.blok.space_top),
  '--pb-bottom': px(props.blok.space_bottom),
  '--pb-top-m': px(props.blok.space_top_mobile),
  '--pb-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section pubs"
    :data-theme="blok.theme || 'gradient'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />

    <div class="pubs__head">
      <div class="container">
        <SectionTitle :headline="blok.headline" :body="blok.body" />
      </div>
    </div>

    <div
      v-for="(item, i) in items"
      :key="item._uid"
      v-editable="item"
      class="pubs__row"
      :class="[`pubs__row--${i % 4}`, { 'pubs__row--flip': i % 2 === 1 }]"
    >
      <picture v-if="item.media?.filename" class="pubs__media">
        <source
          v-if="item.media_mobile?.filename"
          media="(max-width: 860px)"
          :srcset="`${sbCrop(item.media_mobile, 860)} 860w, ${sbCrop(item.media_mobile, 1720)} 1720w`"
          sizes="100vw"
        >
        <img
          :src="sbCrop(item.media, 1440, 1600)"
          :srcset="`${sbCrop(item.media, 720, 800)} 720w, ${sbCrop(item.media, 1440, 1600)} 1440w`"
          sizes="(max-width: 860px) 100vw, 50vw"
          :alt="item.media.alt || ''"
          loading="lazy"
        >
      </picture>
      <div v-else class="pubs__media" />

      <div class="pubs__panel">
        <div class="pubs__text">
          <h3 class="pubs__title"><BrandText :text="item.title" /></h3>
          <p v-if="item.body" class="pubs__body"><BrandText :text="item.body" :nowrap="false" /></p>
          <NuxtLink v-if="hrefOf(item.link)" :to="hrefOf(item.link)!" class="pubs__link">
            {{ item.link_label || 'Read the publication' }}
          </NuxtLink>
        </div>
      </div>

      <span class="pubs__line pubs__line--a" aria-hidden="true" />
      <span class="pubs__line pubs__line--b" aria-hidden="true" />
    </div>

    <div v-if="blok.outro || blok.buttons?.length" class="pubs__outro">
      <h2 v-if="blok.outro" class="pubs__outro-title"><BrandText :text="blok.outro" /></h2>
      <div v-if="blok.buttons?.length" class="pubs__actions">
        <StoryblokComponent v-for="button in blok.buttons" :key="button._uid" :blok="button" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Gradients fitted to the design's own pixels, region by region (rms 3-5/255). */
.pubs {
  --connector-len: calc(6.94 * var(--sx));                                  /* 100 */
  padding: 0;
  background: none;
  overflow: hidden;
}

.pubs__head {
  padding-top: var(--pb-top, calc(19.69 * var(--sx)));                      /* 283.5 to the title */
  padding-bottom: calc(13.26 * var(--sx));                                  /* 191 */
  /* Figma's own stops put the intro paragraph on #436ff8, which is 4.50:1 under
     white: AA to two decimal places and a rounding error away from failing. The
     pale foot is unchanged; #4169e8 now holds to 80%, which is where the copy
     ends, and the paragraph reads 4.8:1. */
  background: linear-gradient(166deg, #1a213e 4.2%, #151b45 12.5%, #10154b 20.8%, #141f64 29.2%, #1c2d80 37.5%, #233b9b 45.8%, #2b4ab8 54.2%, #3357ce 62.5%, #3b64e4 70.8%, #4169e8 80%, #5d85fd 89%, #7a9afd 95.8%);
}
.pubs__head :deep(.sec-title) { max-width: 630px; gap: calc(2.32 * var(--sx)); }   /* 33.4 */

.pubs__row {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: clamp(560px, calc(55.56 * var(--sx)), 800px);                 /* 800 */
}
/* The opening row's panel is 761 tall; its photograph keeps the full 800 and
   rises into the title region above. */
.pubs__row--0 { min-height: clamp(532px, calc(52.85 * var(--sx)), 761px); }
.pubs__row--0 .pubs__media { margin-top: calc(-2.71 * var(--sx)); }        /* 39 */

.pubs__media { position: relative; overflow: hidden; }
.pubs__media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.pubs__row--flip .pubs__media { order: 2; }

.pubs__panel { display: flex; align-items: center; padding-inline: clamp(24px, 8.68vw, 125px); }
.pubs__row--flip .pubs__panel { justify-content: flex-end; }
/* Figma lifts the copy 7px above each panel's centre (26.5px in the short first
   row, whose copy is centred on the photograph rather than the panel). */
.pubs__panel { padding-bottom: calc(0.97 * var(--sx)); }                    /* 14 */
.pubs__row--0 .pubs__panel { padding-bottom: calc(3.68 * var(--sx)); }      /* 53 */

/* Each panel keeps its row's direction, hue journey and dark end, with the pale
   end clamped at #4169e8. Figma draws the pale corners much further in:
     row 0  ... #4875fd 70.8%, #688dfd 79.2%, #89a6fe 87.5%, #a6bcfe 95.8%
     row 1  #4371fc 4.2%, #567ffd 12.5%, #5d84fd 20.8%, #567ffd 29.2% ...
     row 2  ... #416df5 79.2%, #5780fd 87.5%, #7194fd 95.8%
     row 3  #ccd9fe 4.2%, #a3bafe 12.5%, #7d9dfd 20.8%, #547efd 29.2% ...
   and at 1440 the 410px text column sits clear of them. It stops being clear as
   soon as the panel narrows: the column fills the panel, the gradient's axis
   shortens, and the copy slides into the pale corner. Measured on the white
   copy, row 3's 34px title ran 1.77:1 at 390, 2.30:1 at 900 and 2.85:1 at 1180,
   the 15px link 2.98:1 at 390 and 2.85:1 at 900, body text 3.79:1 at 390. The
   corners cannot be rescued by re-timing the stops, because how far along the
   axis the copy starts is a function of the panel's height, which runs from
   ~380px on a phone to 800px at the design width.
   #4169e8 is the lightest colour white clears 4.5:1 on (4.8:1), so the ceiling
   serves the 18px body and the 15px link as well as the 34px titles, and it
   holds at every width and for any length of copy. Putting the pale corners
   back means a different treatment for the copy on those rows, which is the
   designer's call, not a contrast fix. */
.pubs__row--0 .pubs__panel { background: linear-gradient(168deg, #0f154e 0%, #111d66 10%, #15277c 20%, #1d3699 32%, #2745b2 44%, #3153c9 56%, #365cda 68%, #3a61de 78%, #3e67e6 88%, #4169e8 100%); }
.pubs__row--1 .pubs__panel { background: linear-gradient(154deg, #4169e8 0%, #3f66e2 12%, #365dda 30%, #2a47b2 50%, #213894 66%, #192875 78%, #111651 90%, #141a46 100%); }
.pubs__row--2 .pubs__panel { background: linear-gradient(152deg, #1a213e 0%, #151b45 10%, #10154c 20%, #141f64 30%, #1c2d80 40%, #243c9d 50%, #2b4ab8 60%, #3256cd 72%, #3962e1 84%, #3d64e3 92%, #4169e8 100%); }
.pubs__row--3 .pubs__panel { background: linear-gradient(158deg, #4169e8 0%, #3458d0 14%, #2b48b4 30%, #1f358e 46%, #192672 60%, #11164c 78%, #161c44 90%, #181e40 100%); }

.pubs__text { display: grid; max-width: 410px; color: var(--c-white); }
.pubs__title { margin: 0; font-size: clamp(1.625rem, 2.36vw, 2.125rem); font-weight: 600; line-height: 1.2059; color: inherit; white-space: pre-line; }   /* 34/41 */
.pubs__body { margin: calc(1.69 * var(--sx)) 0 0; font-size: 1.125rem; font-weight: 300; line-height: 1.6111; }   /* 24.4 above; 18/29 */
.pubs__link {
  justify-self: start;
  margin-top: calc(2.47 * var(--sx));                                       /* 35.5 */
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.2133;
  letter-spacing: 0.46px;
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 150ms ease;
}
.pubs__link:hover, .pubs__link:focus-visible { color: var(--c-blue-100); }

/* Hairlines, placed per row as Figma draws them (x as a share of the 1440 frame,
   y in design px scaled with the layout). */
.pubs__line { position: absolute; z-index: 1; border: 0 solid var(--line-light); pointer-events: none; }
.pubs__row--0 .pubs__line--a { left: 95.07%; top: 0; bottom: 0; border-left-width: var(--line-w); }                        /* x1369 */
.pubs__row--0 .pubs__line--b { left: 89.24%; right: 0; top: calc(49.58 * var(--sx)); border-top-width: var(--line-w); }     /* 1285->1440 @714 */
.pubs__row--1 .pubs__line--a { left: 0; width: 50%; top: calc(51.67 * var(--sx)); border-top-width: var(--line-w); }        /* 0->720 @744 */
.pubs__row--1 .pubs__line--b { left: var(--frame-gutter); top: calc(45.97 * var(--sx)); bottom: 0; border-left-width: var(--line-w); }   /* x75, 662->800 */
.pubs__row--2 .pubs__line--a { left: 50%; right: 0; top: calc(51.39 * var(--sx)); border-top-width: var(--line-w); }        /* 720->1440 @740 */
.pubs__row--2 .pubs__line--b { left: 55.14%; top: calc(45.69 * var(--sx)); bottom: 0; border-left-width: var(--line-w); }   /* x794, 658->800 */
.pubs__row--3 .pubs__line--a { left: 5.83%; top: 0; bottom: 0; border-left-width: var(--line-w); }                          /* x84 */
.pubs__row--3 .pubs__line--b { left: 0; width: 10.76%; top: calc(48.61 * var(--sx)); border-top-width: var(--line-w); }     /* 0->155 @700 */

.pubs__outro {
  display: grid;
  justify-items: center;
  padding-top: calc(6.46 * var(--sx));                                      /* 93 */
  padding-bottom: var(--pb-bottom, calc(22.71 * var(--sx)));                /* 327 */
  background: linear-gradient(172deg, #2642a8 4.2%, #2b4ab8 12.5%, #3254c9 20.8%, #375dd8 29.2%, #3c65e8 37.5%, #436ff8 45.8%, #547efd 54.2%, #7194fd 62.5%, #89a6fe 70.8%, #a3bafe 79.2%, #becefe 87.5%, #d2ddfe 95.8%);
}
.pubs__outro-title {
  margin: 0;
  font-size: clamp(2rem, 3.33vw, 3rem);                                     /* 48 */
  font-weight: 600;
  line-height: 1.2083;
  color: var(--c-white);
  text-align: center;
}
.pubs__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; margin-top: calc(1.81 * var(--sx)); }   /* 26 */
/* Figma's button here is a pale solid on the blue, not an outline. */
.pubs__actions :deep(.btn--secondary) {
  border-color: transparent;
  background: var(--c-leather-300);
  color: var(--c-darkblue);
}
.pubs__actions :deep(.btn--secondary:hover) { background: var(--c-white); }

/* Phones: the rows stack photo-over-panel at the 16px gutter, as the band
   sections elsewhere on the site do. */
@media (max-width: 860px) {
  .pubs__row, .pubs__row--0 { grid-template-columns: 1fr; min-height: 0; }
  .pubs__media { display: block; min-height: 77vw; }
  .pubs__row--0 .pubs__media { margin-top: 0; }
  .pubs__row--flip .pubs__media { order: 0; }
  .pubs__panel,
  .pubs__row--0 .pubs__panel { align-items: flex-start; justify-content: flex-start; padding: 40px 16px 72px; }
  .pubs__text { max-width: none; }
  .pubs__line { display: none; }

}
@media (max-width: 720px) {
  .pubs { --connector-len: 80px; }
  .pubs__head { padding-top: var(--pb-top-m, 120px); padding-bottom: 96px; }
  .pubs__head :deep(.sec-title) { gap: 24px; }
  /* The desktop line breaks are set to a 410px column; phones re-wrap. */
  .pubs__title { font-size: clamp(1.5rem, 8.72vw, 2.125rem); white-space: normal; }
  .pubs__body { margin-top: 24px; }
  .pubs__link { margin-top: 28px; }
  .pubs__outro { padding-top: 72px; padding-bottom: var(--pb-bottom-m, 120px); }
  .pubs__actions { margin-top: 32px; }
}
</style>
