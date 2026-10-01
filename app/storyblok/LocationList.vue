<script setup lang="ts">
// About 5354-5720: the three offices, on the same full-measure rows as
// `disclosure_list` draws them (hairlines from the 75px gutter, the name in Inter
// 600 34/41 brand blue 24px in, a 26px plus at the right), with a second line that
// stays visible when the row is shut. That line is the point of the row here
// ("Production and quality operations."), so it cannot live in the body.
//
// The phone module library (extra-modules-mobile 19280-19800) draws the rows
// open and shut: the name at 20/24, its line under it at 16/26, and the address
// the plus reveals at 16/26 in navy.
//
// A row with nothing to reveal has no control: the design draws a plus on all
// three, but only Beijing's address exists in the design files.
const props = defineProps<{ blok: any }>()
const items = computed<any[]>(() => props.blok.items || [])
const hasBody = (item: any) => Boolean(item?.body?.content?.length)

// undefined, not null: Vue's style binding accepts string | number | undefined.
const px = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : `${Number(v)}px`)
const style = computed(() => ({
  '--ll-top': px(props.blok.space_top),
  '--ll-bottom': px(props.blok.space_bottom),
  '--ll-top-m': px(props.blok.space_top_mobile),
  '--ll-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section ll"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="ll__inner">
      <template v-for="item in items" :key="item._uid">
        <details v-if="hasBody(item)" v-editable="item" class="ll__row">
          <summary class="ll__summary">
            <span class="ll__text">
              <span class="ll__title">{{ item.title }}</span>
              <span v-if="item.subtitle" class="ll__sub">{{ item.subtitle }}</span>
            </span>
            <span class="ll__marker" aria-hidden="true" />
          </summary>
          <div class="ll__body"><StoryblokRichText :document="item.body" /></div>
        </details>
        <div v-else v-editable="item" class="ll__row ll__row--plain">
          <span class="ll__text">
            <span class="ll__title">{{ item.title }}</span>
            <span v-if="item.subtitle" class="ll__sub">{{ item.subtitle }}</span>
          </span>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.ll { padding: var(--ll-top, 0px) 0 var(--ll-bottom, calc(15.42 * var(--sx))); }
.ll__inner {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--gutter-design);                                       /* the design's 75px gutter */
  border-bottom: var(--line-w) solid var(--ink);
}
.ll__row { border-top: var(--line-w) solid var(--ink); }
.ll__summary,
.ll__row--plain {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(1.67 * var(--sx));
  padding: calc(1.67 * var(--sx)) calc(2.92 * var(--sx)) calc(1.92 * var(--sx)) calc(1.67 * var(--sx));   /* 24 / 42 / 27.7 / 24 */
  cursor: pointer;
  list-style: none;
}
.ll__row--plain { cursor: auto; }
.ll__summary::-webkit-details-marker { display: none; }
.ll__text { display: grid; gap: calc(0.33 * var(--sx)); }                     /* 4.7 */
.ll__title {
  font-size: clamp(1.5rem, 2.36vw, 2.125rem);                                 /* 34 */
  font-weight: 600;
  line-height: 1.2059;                                                        /* 41/34 */
  color: var(--c-blue);
}
.ll__sub {
  font-size: clamp(1rem, 1.39vw, 1.25rem);                                    /* 20 */
  font-weight: 300;
  line-height: 1.215;                                                         /* 24.3/20 */
  color: var(--c-blue);
}

/* 26x26 with 4px bars; the upright drops away when the row is open. */
.ll__marker { position: relative; flex: none; width: 26px; height: 26px; }
.ll__marker::before,
.ll__marker::after { content: ''; position: absolute; background: var(--ink); }
.ll__marker::before { inset: 11px 0; }
.ll__marker::after { inset: 0 11px; }
.ll__row[open] .ll__marker::after { display: none; }

.ll__body {
  padding: 0 calc(2.92 * var(--sx)) calc(1.92 * var(--sx)) calc(1.67 * var(--sx));
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;                                                        /* 29/18 */
  color: var(--ink);
}
.ll__body :deep(p) { margin: 0; }

@media (max-width: 720px) {
  .ll { padding: var(--ll-top-m, 0px) 0 var(--ll-bottom-m, 56px); }
  .ll__inner { padding-inline: 16px; border-bottom-color: var(--c-darkblue-200); border-bottom-width: 1px; }
  .ll__row { border-top-color: var(--c-darkblue-200); border-top-width: 1px; }
  .ll__summary, .ll__row--plain { gap: 16px; padding: 24px 0 24px 0; }
  .ll__text { gap: 4px; max-width: 280px; }
  .ll__title { font-size: 1.25rem; line-height: 1.2; }                        /* 20/24 */
  .ll__sub { font-size: 1rem; line-height: 1.625; }                           /* 16/26 */
  .ll__body { padding: 0 0 24px; font-size: 1rem; line-height: 1.625; }
}
</style>
