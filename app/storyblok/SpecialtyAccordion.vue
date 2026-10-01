<script setup lang="ts">
// Clinical Evidence "Multi-specialty clinical experience" (clinical-evidence-
// desktop, 2385-3661): a 48px centred title over a 490px paragraph, a row of
// five specialty drawings on a 92x84 artboard with 15px blue labels, then the
// list itself — full-width 94px rows from gutter to gutter, 34/41 blue labels
// 24px in from the rule, and a 28px plus sign 42px off the right.
//
// Open, each row prints the specialty's procedures as the design's text example
// frame draws them ("Desktop Clinical Evidence Text Example"): group titles and
// bulleted procedures all at 18/29 on one unbroken rhythm, with no space of
// their own between the groups. The frame's row heights are hand-set there and
// clip the last line; a real disclosure sizes to its content instead.
const props = defineProps<{ blok: any }>()
const icons = computed<any[]>(() => props.blok.icons || [])
const items = computed<any[]>(() => props.blok.items || [])

const px = (v: unknown) => (Number(v) > 0 ? `${Number(v)}px` : undefined)
// A negative `space_top` lifts the section into the one above instead of padding
// it: `stats_band` draws its figures 110px lower than this page's design wants
// (room for a stat icon this page has none of), and that slack has to come off
// somewhere. Positive values stay plain padding.
const top = computed(() => {
  const v = props.blok.space_top
  return v === '' || v == null || !Number.isFinite(Number(v)) ? null : Number(v)
})
const style = computed(() => ({
  '--sa-top': top.value === null ? undefined : `${Math.max(0, top.value)}px`,
  '--sa-lift': top.value === null ? undefined : `${Math.min(0, top.value)}px`,
  '--sa-bottom': px(props.blok.space_bottom),
  '--sa-top-m': px(props.blok.space_top_mobile),
  '--sa-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section spec"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="spec__inner">
      <h2 v-if="blok.headline" class="spec__title"><BrandText :text="blok.headline" /></h2>
      <p v-if="blok.body" class="spec__body"><BrandText :text="blok.body" :nowrap="false" /></p>

      <ul v-if="icons.length" class="spec__icons">
        <li v-for="icon in icons" :key="icon._uid" v-editable="icon" class="spec__icon">
          <img
            v-if="icon.icon?.filename"
            class="spec__icon-img"
            :src="sbImage(icon.icon, '368x0')"
            :srcset="`${sbImage(icon.icon, '184x0')} 184w, ${sbImage(icon.icon, '368x0')} 368w`"
            sizes="92px"
            :alt="icon.icon.alt || ''"
            width="92"
            height="84"
            loading="lazy"
          >
          <span class="spec__icon-label">{{ icon.label }}</span>
        </li>
      </ul>

      <div v-if="items.length" class="spec__list">
        <details v-for="item in items" :key="item._uid" v-editable="item" class="spec__row">
          <summary class="spec__summary">
            <span class="spec__label">{{ item.label }}</span>
            <span class="spec__mark" aria-hidden="true">
              <svg viewBox="0 0 28 28" width="28" height="28" focusable="false">
                <path class="spec__bar" d="M0 13.5h28v2.4H0z" />
                <path class="spec__bar spec__bar--v" d="M12.8 0h2.4v28h-2.4z" />
              </svg>
            </span>
          </summary>
          <div v-if="item.body" class="spec__procedures">
            <StoryblokRichText :document="item.body" />
          </div>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
.spec {
  --connector-len: max(40px, calc(4.1 * var(--sx)));
  margin-top: var(--sa-lift, 0px);
  padding-top: var(--sa-top, calc(5.49 * var(--sx)));                       /* 79 */
  padding-bottom: var(--sa-bottom, calc(14.51 * var(--sx)));                /* 209 */
}
.spec__inner {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--gutter-design);                                     /* 75 */
}
.spec__title {
  max-width: 660px;
  margin: 0 auto;
  font-size: clamp(2rem, 3.33vw, 3rem);                                     /* 48 */
  font-weight: 600;
  line-height: 1.2083;                                                      /* 58/48 */
  color: var(--ink);
  text-align: center;
  white-space: pre-line;
}
.spec__body {
  max-width: 490px;
  margin: calc(1.76 * var(--sx)) auto 0;                                    /* 25.3 */
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;                                                      /* 29/18 */
  color: var(--ink-muted);
  text-align: center;
  white-space: pre-line;
}

/* Five drawings on a 174px pitch, the row centred. Every drawing is exported on
   the same 92x84 artboard, so they sit at the size and height the design gives
   them without a per-icon rule. */
.spec__icons {
  display: flex;
  justify-content: center;
  /* Figma hangs the row 9px left of the frame's centre. */
  margin: calc(4.35 * var(--sx)) 0 0 calc(-1.28 * var(--sx));              /* 62.6 / -9 off centre */
  padding: 0;
  list-style: none;
}
.spec__icon {
  display: flex;
  flex: 0 0 calc(12.08 * var(--sx));                                        /* 174 */
  flex-direction: column;
  align-items: center;
}
.spec__icon-img { width: calc(6.39 * var(--sx)); height: calc(5.83 * var(--sx)); object-fit: contain; }   /* 92x84 */
.spec__icon-label {
  margin-top: calc(1.7 * var(--sx));                                        /* 24.5 */
  font-size: 0.9375rem;                                                     /* 15 */
  font-weight: 400;
  line-height: 1.2133;                                                      /* 18.2/15 */
  color: var(--c-blue);
  text-align: center;
}

.spec__list { margin-top: calc(6.94 * var(--sx)); }                         /* 100 */
.spec__row { border-top: var(--line-w) solid var(--c-darkblue); }
.spec__row:last-child { border-bottom: var(--line-w) solid var(--c-darkblue); }
.spec__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(1.74 * var(--sx)) calc(2.92 * var(--sx)) calc(1.84 * var(--sx)) calc(1.67 * var(--sx));   /* 25 / 42 / 26.5 / 24 */
  cursor: pointer;
  list-style: none;
}
.spec__summary::-webkit-details-marker { display: none; }
.spec__label {
  font-size: clamp(1.5rem, 2.36vw, 2.125rem);                               /* 34 */
  font-weight: 600;
  line-height: 1.2059;                                                      /* 41/34 */
  color: var(--c-blue);
}
.spec__mark { flex: none; width: 28px; height: 28px; color: var(--c-darkblue); }
.spec__mark svg { width: 100%; height: 100%; }
.spec__bar { fill: currentColor; }
.spec__bar--v { transition: opacity 150ms ease; }
.spec__row[open] .spec__bar--v { opacity: 0; }
.spec__summary:hover .spec__label { color: var(--c-blue-500); }

/* The procedures: one 18/29 rhythm from the first group title to the last
   bullet, 40px under the label and 40px above the rule. */
.spec__procedures {
  padding: 0 calc(2.92 * var(--sx)) calc(2.78 * var(--sx)) calc(2.08 * var(--sx));   /* 42 / 40 / 30 */
  margin-top: calc(0.59 * var(--sx));                                       /* the design sets the first line 77px under the label's cap */
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;                                                      /* 29/18 */
  color: var(--ink);
}
.spec__procedures :deep(p) { margin: 0; }
.spec__procedures :deep(ul) { margin: 0; padding: 0; list-style: none; }
.spec__procedures :deep(li) { position: relative; padding-left: 32px; }
.spec__procedures :deep(li::before) {
  content: '';
  position: absolute;
  top: 12.7px;
  left: 11px;
  width: 4.6px;
  height: 4.6px;
  border-radius: 50%;
  background: currentColor;
}

/* Phones: the drawings wrap three to a row inside the 16px gutters, and the
   rows set their labels at 24/29 with the plus at 20px. */
@media (max-width: 720px) {
  /* The desktop lift compensates for `stats_band`'s desktop spacing only. */
  .spec { margin-top: 0; padding-top: var(--sa-top-m, 72px); padding-bottom: var(--sa-bottom-m, 96px); }
  .spec__inner { padding-inline: 16px; }
  .spec__title { max-width: none; }
  .spec__body { max-width: none; margin-top: 24px; white-space: normal; }
  .spec__icons { flex-wrap: wrap; gap: 32px 0; margin-top: 48px; }
  .spec__icon { flex-basis: 33.33%; }
  .spec__icon-img { width: 80px; height: 73px; }
  .spec__icon-label { margin-top: 16px; }
  .spec__list { margin-top: 56px; }
  .spec__summary { padding: 18px 0 20px; gap: 16px; }
  .spec__label { font-size: 1.5rem; line-height: 1.2083; }
  .spec__mark { width: 20px; height: 20px; }
  .spec__procedures { padding: 0 0 28px; margin-top: 24px; font-size: 1rem; line-height: 1.625; }
  .spec__procedures :deep(li) { padding-left: 24px; }
  .spec__procedures :deep(li::before) { top: 8px; left: 8px; width: 4px; height: 4px; }
}
</style>
