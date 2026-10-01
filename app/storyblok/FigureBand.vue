<script setup lang="ts">
// About 4310-4799: two figures in the same 408px columns, 30px apart, that
// `stats_band` uses, but only one of them is a number. The other is a
// three-line list of regions set at 32/51, and `stat` draws one size only.
// Both columns sit on the same label line, so the figures are bottom aligned
// and the labels follow on a row of their own.
const props = defineProps<{ blok: any }>()
const items = computed<any[]>(() => props.blok.items || [])
const columns = computed(() => Number(props.blok.columns) || 2)

// undefined, not null: Vue's style binding accepts string | number | undefined.
const px = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : `${Number(v)}px`)
const style = computed(() => ({
  '--cols': String(columns.value),
  '--fb-top': px(props.blok.space_top),
  '--fb-bottom': px(props.blok.space_bottom),
  '--fb-top-m': px(props.blok.space_top_mobile),
  '--fb-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section fband"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <div class="container fband__grid">
      <div
        v-for="item in items"
        :key="item._uid"
        v-editable="item"
        class="fband__item"
        :class="`fband__item--${item.size || 'large'}`"
      >
        <p class="fband__value display-word">{{ item.value }}</p>
        <p class="fband__label">{{ item.label }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fband { padding: var(--fb-top, calc(8.89 * var(--sx))) 0 var(--fb-bottom, calc(10.63 * var(--sx))); }   /* 128 / 153 */
.fband__grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 2), minmax(0, calc(28.33 * var(--sx))));   /* 408 */
  justify-content: center;
  gap: calc(2.08 * var(--sx));                                                /* 30 */
}
.fband__item { display: grid; grid-template-rows: 1fr auto; justify-items: center; text-align: center; }
.fband__value {
  align-self: end;
  margin: 0;
  color: var(--c-blue);
  white-space: pre-wrap;                                                     /* the design sets two spaces either side of the bars */
}
/* Lora's 96px line box leaves more under the figures than the design does: it
   sets the number 12px clear of the list beside it. */
.fband__item--large .fband__value {
  margin-bottom: calc(0.83 * var(--sx));                                      /* 12 */
  font-size: calc(6.67 * var(--sx));
  line-height: 1.198;                                                         /* 96/115 */
}
.fband__item--small .fband__value { font-size: calc(2.22 * var(--sx)); line-height: 1.594; }    /* 32/51 */
.fband__label {
  margin: calc(1.79 * var(--sx)) 0 0;                                         /* 25.8 to the label */
  font-size: clamp(1.125rem, 1.67vw, 1.5rem);                                 /* 24 */
  font-weight: 600;
  line-height: 1.2083;                                                        /* 29/24 */
  color: var(--ink);
}

/* Phones stack the figures, as the stats band does there. */
@media (max-width: 720px) {
  .fband { padding: var(--fb-top-m, 72px) 0 var(--fb-bottom-m, 72px); }
  .fband__grid { grid-template-columns: minmax(0, 1fr); gap: 56px; }
  .fband__item--large .fband__value { font-size: clamp(4rem, 24.6vw, 6rem); }
  .fband__item--small .fband__value { font-size: 1.75rem; line-height: 1.5; }
  .fband__label { margin-top: 21px; font-size: 1.5rem; }
}
</style>
