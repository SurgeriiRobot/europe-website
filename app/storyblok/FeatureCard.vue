<script setup lang="ts">
// As a band: 800px row, the photo filling one half, a 410px text column set 125px
// off the photo's edge and centred vertically. Title Inter 600 48/58, body 300 18/29.
const props = withDefaults(
  defineProps<{ blok: any, layout?: 'card' | 'band', flip?: boolean, decor?: number }>(),
  { layout: 'card', flip: false, decor: 0 },
)
const sbHref = useSbUrl()
const href = computed(() => (props.blok.link?.cached_url || props.blok.link?.url ? sbHref(props.blok.link) : null))
const media = computed(() => props.blok.media)
</script>

<template>
  <div
    v-if="layout === 'band'"
    v-editable="blok"
    class="band"
    :class="[{ 'band--flip': flip }, `band--decor-${decor}`]"
    :data-theme="blok.theme || 'dark'"
  >
    <div class="band__media">
      <img
        v-if="media?.filename"
        :src="sbCrop(media, 1440, 1600)"
        :srcset="`${sbCrop(media, 720, 800)} 720w, ${sbCrop(media, 1440, 1600)} 1440w`"
        sizes="(max-width: 860px) 100vw, 50vw"
        :alt="media.alt || ''"
        loading="lazy"
      >
    </div>
    <span class="band__line band__line--a" aria-hidden="true" />
    <span class="band__line band__line--b" aria-hidden="true" />
    <div class="band__panel">
      <div class="band__text">
        <h3 class="band__title"><BrandText :text="blok.title" /></h3>
        <p v-if="blok.body" class="band__body">{{ blok.body }}</p>
        <NuxtLink v-if="href" :to="href" class="band__link">{{ blok.link_label || 'Learn more' }}</NuxtLink>
      </div>
    </div>
  </div>

  <component :is="href ? 'NuxtLink' : 'article'" v-else v-editable="blok" :to="href || undefined" class="card" :data-theme="blok.theme || 'light'">
    <img v-if="media?.filename" :src="sbCrop(media, 800)" :alt="media.alt || ''" class="card__media" loading="lazy">
    <div class="card__body">
      <h3 class="card__title">{{ blok.title }}</h3>
      <p v-if="blok.body" class="card__text">{{ blok.body }}</p>
    </div>
  </component>
</template>

<style scoped>
.band {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: clamp(560px, 55.56vw, 800px);
}
.band__media { position: relative; overflow: hidden; }
.band__media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.band__panel {
  display: flex;
  align-items: center;
  padding-inline: clamp(24px, 8.68vw, 125px);   /* 125px off the photo's edge */
  color: var(--ink);
}
/* Panels are windows onto the section's gradient; a "dark" band gets a solid one. */
.band[data-theme='dark'] .band__panel { background: var(--c-black); }
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
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 4px;
}
.band--flip .band__media { order: 2; }

/* White hairlines, placed per band as in Figma (in vw of the 1440 frame). */
.band__line { position: absolute; z-index: 1; border: 0 solid var(--c-white); pointer-events: none; }
.band--decor-0 .band__line--a { left: 95.07%; top: 5%; bottom: 0; border-left-width: var(--line-w); }          /* x1369, 40->800 */
.band--decor-0 .band__line--b { left: 89.17%; right: 0; top: 92%; border-top-width: var(--line-w); }          /* 1284->1440 @736 */
.band--decor-1 .band__line--a { left: 0; width: 50%; top: 92.75%; border-top-width: var(--line-w); }          /* 0->720 @742 */
.band--decor-1 .band__line--b { left: var(--frame-gutter); top: 82.5%; bottom: 0; border-left-width: var(--line-w); }  /* x75, 660->800 */
.band--decor-2 .band__line--a { left: 50%; right: 0; top: 7.88%; border-top-width: var(--line-w); }           /* 720->1440 @63 */
.band--decor-2 .band__line--b { left: 58.96%; top: 7.88%; height: 6.75%; border-left-width: var(--line-w); }   /* x849, 63->117 */

@media (max-width: 860px) {
  .band { grid-template-columns: 1fr; }
  .band__media { min-height: 70vw; }
  .band--flip .band__media { order: 0; }
  .band__panel { padding-block: 56px; }
  .band__line { display: none; }   /* placed for the side-by-side layout only */
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
