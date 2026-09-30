<script setup lang="ts">
// One entry of the Instructions for Use list (Figma instructions-for-use-desktop,
// the 10 blocks between y343 and y1177). Two flush-left 18/29 lines: the device
// the document belongs to, bulleted, then the document itself.
//
// The regulatory PDFs have not been supplied yet, so `document` is empty and the
// design's own marker — "(link to PFD see IFU folder)" — is printed after the
// title and flagged for editors. Uploading the file removes the marker and turns
// the title into the download; nothing else about the row changes.
const props = defineProps<{ blok: any }>()

const sbHref = useSbUrl()
const doc = computed(() => props.blok.document?.filename || '')
const href = computed(() => {
  if (doc.value) return doc.value
  const l = props.blok.link
  return l && (l.cached_url || l.url || l.story?.full_slug) ? sbHref(l) : ''
})
const pending = computed(() => !href.value)
// Storyblok gives a document's own size back on the asset; the label tells a
// visitor what a download will cost them before they start it.
const kind = computed(() => {
  const name = doc.value.split('/').pop() || ''
  const ext = name.includes('.') ? name.split('.').pop()!.toUpperCase() : ''
  return ext && ext.length <= 4 ? ext : 'PDF'
})
</script>

<template>
  <li v-editable="blok" class="ifu-item">
    <p class="ifu-item__device">
      <span class="ifu-item__dot" aria-hidden="true">•</span>{{ ' ' }}<BrandText :text="blok.device" :nowrap="false" />
    </p>
    <p class="ifu-item__doc">
      <a
        v-if="doc"
        :href="doc"
        class="ifu-item__link"
        download
        target="_blank"
        rel="noopener"
      >
        <BrandText :text="blok.title" :nowrap="false" />
        <span class="ifu-item__sr"> ({{ kind }}, opens in a new tab)</span>
      </a>
      <NuxtLink v-else-if="href" :to="href" class="ifu-item__link">
        <BrandText :text="blok.title" :nowrap="false" />
      </NuxtLink>
      <template v-else>
        <BrandText :text="blok.title" :nowrap="false" />
      </template>
      <span v-if="pending && blok.placeholder" class="ifu-item__todo">{{ ' ' }}{{ blok.placeholder }}</span>
    </p>
  </li>
</template>

<style scoped>
/* One blank 29px line between entries — the design's own rhythm, which comes
   from its two-line paragraphs being separated by an empty line. */
.ifu-item { margin-bottom: 29px; }
.ifu-item:last-child { margin-bottom: 0; }

.ifu-item__device,
.ifu-item__doc {
  margin: 0;
  font-size: 1.125rem;                /* 18 */
  font-weight: 300;
  line-height: 1.6111;                /* 29/18 */
  color: var(--ink);
}

/* The bullet is part of the line, not a marker: the second line is flush with
   it rather than indented under the text, exactly as the design draws it. */
.ifu-item__dot { font-weight: 400; }

.ifu-item__link {
  color: inherit;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  text-decoration-color: color-mix(in srgb, currentColor 35%, transparent);
}
.ifu-item__link:hover { color: var(--c-blue); text-decoration-color: currentColor; }

/* Nothing to download yet. The marker is the design's own placeholder text and
   is only ever shown while the asset field is empty. */
.ifu-item__todo { color: var(--c-black-300); }

.ifu-item__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-width: 720px) {
  .ifu-item { margin-bottom: 24px; }
  .ifu-item__device,
  .ifu-item__doc { font-size: 1rem; line-height: 1.625; }   /* 16/26 */
}
</style>
