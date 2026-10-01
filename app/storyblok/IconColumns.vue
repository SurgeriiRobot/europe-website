<script setup lang="ts">
// About 7089-7638: three columns of drawing, title and paragraph, 340px wide on
// a 367px pitch. Each drawing sits on a 108px square so the titles line up
// whatever shape it is; the third column closes with an underlined link.
// `icon_grid` puts one blue label under its drawings and has nowhere for the
// paragraph or the link.
const props = defineProps<{ blok: any }>()
const items = computed<any[]>(() => props.blok.items || [])
const columns = computed(() => Number(props.blok.columns) || 3)
const sbHref = useSbUrl()
const hrefOf = (l: any) => (l && (l.cached_url || l.url || l.email || l.story?.full_slug) ? sbHref(l) : undefined)
const isSvg = (a: any) => /\.svg($|\?)/i.test(a?.filename || '')

// undefined, not null: Vue's style binding accepts string | number | undefined.
const px = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : `${Number(v)}px`)
const style = computed(() => ({
  '--cols': String(columns.value),
  '--ic-measure': Number(props.blok.measure) > 0 ? `calc(${(Number(props.blok.measure) / 14.4).toFixed(3)} * var(--sx))` : undefined,
  '--ic-top': px(props.blok.space_top),
  '--ic-bottom': px(props.blok.space_bottom),
  '--ic-top-m': px(props.blok.space_top_mobile),
  '--ic-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <section
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="section icols"
    :data-theme="blok.theme || 'light'"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <ul class="icols__grid">
      <li v-for="item in items" :key="item._uid" v-editable="item" class="icols__col">
        <img
          v-if="item.icon?.filename"
          class="icols__icon"
          :src="isSvg(item.icon) ? item.icon.filename : sbImage(item.icon, '320x0/filters:format(webp)')"
          :alt="item.icon.alt || ''"
          width="108"
          height="108"
          loading="lazy"
        >
        <h3 class="icols__title"><BrandText :text="item.title" /></h3>
        <p v-if="item.body" class="icols__body"><BrandText :text="item.body" :nowrap="false" /></p>
        <a v-if="hrefOf(item.link)" class="icols__link" :href="hrefOf(item.link)">
          <span>{{ item.link_label || 'Learn more' }}</span>
          <Icon name="arrow-forward" :size="20" />
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.icols { padding: var(--ic-top, calc(8.54 * var(--sx))) 0 var(--ic-bottom, calc(12.29 * var(--sx))); }
.icols__grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 3), minmax(0, var(--ic-measure, calc(23.61 * var(--sx)))));   /* 340 */
  justify-content: center;
  gap: calc(1.88 * var(--sx));                                                /* 27, for a 367px pitch */
  margin: 0 auto;
  padding: 0;
  list-style: none;
}
.icols__col { display: flex; flex-direction: column; align-items: center; text-align: center; }
.icols__icon { width: calc(7.5 * var(--sx)); height: calc(7.5 * var(--sx)); object-fit: contain; }   /* 108 */
.icols__title {
  margin: calc(2.15 * var(--sx)) 0 0;                                         /* 31 */
  font-size: clamp(1.25rem, 1.67vw, 1.5rem);                                  /* 24 */
  font-weight: 600;
  line-height: 1.2083;                                                        /* 29/24 */
  color: var(--ink);
  white-space: pre-line;
}
.icols__body {
  margin: calc(1.94 * var(--sx)) 0 0;                                         /* 28 */
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;                                                        /* 29/18 */
  color: var(--ink-muted);
  white-space: pre-wrap;                                                      /* the standards are separated by two spaces */
}
.icols__link {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0 8px;
  margin-top: calc(2.01 * var(--sx));                                         /* 29 */
  font-size: 1.125rem;
  font-weight: 300;
  line-height: 1.6111;
  color: var(--c-blue);
  text-decoration: underline;
  text-underline-offset: 4px;
}
.icols__link:hover { color: var(--c-blue-500); }

/* Phones take one column at the 16px gutter, the drawings a little smaller. */
@media (max-width: 720px) {
  .icols { padding: var(--ic-top-m, 72px) 0 var(--ic-bottom-m, 96px); }
  .icols__grid { grid-template-columns: minmax(0, 1fr); gap: 72px; padding-inline: 16px; }
  .icols__icon { width: 96px; height: 96px; }
  .icols__title { margin-top: 28px; }
  .icols__body { margin-top: 20px; }
}
</style>
