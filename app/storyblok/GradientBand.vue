<script setup lang="ts">
// About 800-3310: one gradient behind three sections: the opening statement,
// the founder statement and the milestone timeline. Figma draws it as a single
// fill over the whole 1440x2510 band, so no section inside it can own it: a
// section painting its own slice would restart the ramp at every boundary.
//
// The band paints it once and the sections it holds render on that ground
// instead of their own (`.section` normally fills with `--surface`). They keep
// their own theme, which is what sets the ink and hairline colour.
//
// The ramp is fitted to the frame's own pixels: 166deg, rms 3.7/255 over 28k
// samples outside the text and the disc.
const props = defineProps<{ blok: any }>()

// undefined, not null: Vue's style binding accepts string | number | undefined.
const px = (v: unknown) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? undefined : `${Number(v)}px`)
const style = computed(() => ({
  '--gb-top': px(props.blok.space_top),
  '--gb-bottom': px(props.blok.space_bottom),
  '--gb-top-m': px(props.blok.space_top_mobile),
  '--gb-bottom-m': px(props.blok.space_bottom_mobile),
  '--connector-len': px(props.blok.connector_length),
}))
</script>

<template>
  <div
    v-editable="blok"
    :id="blok.anchor || undefined"
    class="gband"
    :class="`gband--${blok.backdrop || 'night-to-day'}`"
    :style="style"
  >
    <SectionConnector :connector="blok.connector" />
    <StoryblokComponent v-for="section in blok.body || []" :key="section._uid" :blok="section" />
  </div>
</template>

<style scoped>
.gband {
  position: relative;
  padding-block: var(--gb-top, 0px) var(--gb-bottom, 0px);
}
.gband--night-to-day {
  background: linear-gradient(
    166deg,
    #1b223e 0%,
    #05075a 13.8%,
    #0420a4 28.7%,
    #0642f7 43.8%,
    #0f4dfe 46.2%,
    #6aa3fe 61.3%,
    #c0e1fe 76.2%,
    #ffffff 88%,
    #ffffff 100%
  );
}
/* Contact 800-2560: one ramp behind the figures and the form together. Fitted
   to the frame's own pixels at 171deg, mean error 3.25/255. Confining it to the
   figures left a hard white seam where the form began. */
.gband--night-to-white {
  background: linear-gradient(
    171deg,
    #151a45 2.8%, #0d1050 8.3%, #05075c 13.9%, #030d76 19.4%,
    #041a94 25%, #0526b3 30.6%, #0533d2 36.1%, #063eef 41.7%,
    #1857fe 47.2%, #3c7afe 52.8%, #629dfe 58.3%, #7fb4fe 63.9%,
    #a1cdfe 69.4%, #c0e0fe 75%, #ddf0fe 80.6%, #fafdfe 86.1%,
    #ffffff 91.7%, #ffffff 100%
  );
}

/* The sections inside show the band through instead of filling themselves. */
.gband :deep(.section) { background: transparent; }

@media (max-width: 720px) {
  .gband { padding-block: var(--gb-top-m, 0px) var(--gb-bottom-m, 0px); }
  /* A phone frame is far taller than it is wide, so the 166deg ramp would spend
     most of its length off the sides. Straight down keeps the same colours in
     the same order over the band's own height, but the stops are not the
     desktop ones: a phone frame puts each section at a different point on the
     ramp. The deep blues are held to 58% so the white copy above the timeline
     stays above 4.5:1, and white is kept back to the foot so the timeline's
     #f4f4f4 year does not disappear. */
  .gband--night-to-day {
    background: linear-gradient(
      180deg,
      #1b223e 0%,
      #05075a 16%,
      #0420a4 33%,
      #0534bf 45%,
      #0642f7 58%,
      #3d7bfe 66%,
      #87bafe 76%,
      #c0e1fe 87%,
      #e9f6fe 94%,
      #ffffff 100%
    );
  }
}
</style>
