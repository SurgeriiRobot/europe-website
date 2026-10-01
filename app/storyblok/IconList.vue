<script setup lang="ts">
// Clinical Evidence "Observed clinical benefits" (clinical-evidence-desktop,
// 3661-4945): a 48px centred title over a 610px paragraph, then a cut-out
// figure placed at x108 and clipped by the section's foot, with a column of
// icon + label rows beside it on a 116px pitch. Every icon is exported on the
// same 69x61 artboard, so one rule places all five.
const props = defineProps<{ blok: any }>()
const items = computed<any[]>(() => props.blok.items || [])
const media = computed(() => (props.blok.media?.filename ? props.blok.media : null))

const px = (v: unknown) => (Number(v) > 0 ? `${Number(v)}px` : undefined)
const style = computed(() => ({
  '--il-top': px(props.blok.space_top),
  '--il-bottom': px(props.blok.space_bottom),
  '--il-top-m': px(props.blok.space_top_mobile),
  '--il-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section ilist"
    :data-theme="blok.theme || 'muted'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="container ilist__head">
      <SectionTitle :headline="blok.headline" :body="blok.body" :lines="blok.title_lines" />
    </div>
    <div class="ilist__stage">
      <img
        v-if="media"
        class="ilist__media"
        :src="sbImage(media, '1440x0')"
        :srcset="`${sbImage(media, '720x0')} 720w, ${sbImage(media, '1440x0')} 1440w`"
        sizes="(max-width: 720px) 72vw, calc(50 * min(1vw, 14.4px))"
        :alt="media.alt || ''"
        loading="lazy"
      >
      <ul v-if="items.length" class="ilist__list">
        <li v-for="item in items" :key="item._uid" v-editable="item" class="ilist__item">
          <img
            v-if="item.icon?.filename"
            class="ilist__icon"
            :src="sbImage(item.icon, '276x0')"
            :srcset="`${sbImage(item.icon, '138x0')} 138w, ${sbImage(item.icon, '276x0')} 276w`"
            sizes="69px"
            :alt="item.icon.alt || ''"
            width="69"
            height="61"
            loading="lazy"
          >
          <span class="ilist__label"><BrandText :text="item.label" /></span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.ilist {
  --connector-len: max(40px, calc(4.1 * var(--sx)));
  padding-top: var(--il-top, calc(13.47 * var(--sx)));                      /* 194 */
  padding-bottom: var(--il-bottom, 0px);
  overflow: hidden;
}
.ilist__head :deep(.sec-title) { max-width: 630px; gap: calc(1.76 * var(--sx)); }   /* 25.3 */
.ilist__head :deep(.sec-title__p) { max-width: 610px; }

/* Laid out on the 1440 frame: the cut-out's box starts 106px under the body at
   x108, the list's first row is centred 151.5px down from the same line. The
   figure runs past the section's foot, which clips it. */
.ilist__stage {
  position: relative;
  max-width: var(--container);
  min-height: calc(54.38 * var(--sx));                                      /* 783 */
  margin: calc(7.61 * var(--sx)) auto 0;                                    /* 109.6 */
}
.ilist__media {
  position: absolute;
  top: 0;
  left: calc(7.5 * var(--sx));                                              /* 108 */
  width: calc(50 * var(--sx));                                              /* 720 */
  max-width: none;
  height: auto;
  pointer-events: none;
}
.ilist__list {
  position: relative;
  margin: 0 0 0 calc(53.06 * var(--sx));                                    /* x764 */
  padding: calc(6.49 * var(--sx)) 0 0;                                      /* 93.5 */
  list-style: none;
}
.ilist__item {
  display: flex;
  align-items: center;
  gap: calc(2.05 * var(--sx));                                              /* 29.5 */
  height: calc(8.06 * var(--sx));                                           /* 116 */
}
.ilist__icon { flex: none; width: calc(4.79 * var(--sx)); height: calc(4.24 * var(--sx)); object-fit: contain; }   /* 69x61 */
.ilist__label { font-size: 1.5rem; font-weight: 600; line-height: 1.2083; color: var(--c-blue); }   /* 24/29 */

/* Phones: the title and body across the gutters, the figure centred above the
   list rather than beside it. */
@media (max-width: 720px) {
  .ilist { padding-top: var(--il-top-m, 96px); padding-bottom: var(--il-bottom-m, 64px); }
  .ilist__head :deep(.sec-title) { max-width: none; }
  .ilist__head :deep(.sec-title__p) { max-width: none; }
  .ilist__stage { min-height: 0; margin-top: 48px; }
  .ilist__media { position: relative; left: auto; width: 72vw; margin-inline: auto; }
  .ilist__list { margin: 24px 0 0; padding: 0; }
  .ilist__item { gap: 20px; height: 84px; }
  .ilist__icon { width: 56px; height: 50px; }
  .ilist__label { font-size: 1.25rem; }
}
</style>
