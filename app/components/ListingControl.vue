<script setup lang="ts">
// The outlined control every listing toolbar is drawn with. News & events, the
// Clinical Library and the search page all draw the same 42px pill: a 1px
// #03045e outline on a 4px radius, Inter 500 15/26 with MUI's 0.46px tracking,
// 21px in to the label and a 20px chevron 21px in from the right edge.
//
// Three shapes, one pill:
//   select      a visible label with the platform's own <select> lying over it,
//               transparent but still focusable. The chip is sized by the label
//               rather than by the widest option — a native select is as wide as
//               its longest entry, which would blow the drawn widths apart.
//   toggle      a filter that is either on or off.
//   disclosure  the phones' "Show filters" button.
//
// `wide` is the sort control's geometry — 13px to the label over a 24px chevron
// — which the phone modules give every stacked control.
withDefaults(defineProps<{
  variant?: 'select' | 'toggle' | 'disclosure'
  label: string
  /** Read out in place of the visible label, which on a select is the value. */
  name?: string
  value?: string
  options?: { value: string, label: string }[]
  on?: boolean
  open?: boolean
  controls?: string
  wide?: boolean
}>(), { variant: 'select', name: '', value: '', options: () => [], on: false, open: false, controls: undefined, wide: false })

const emit = defineEmits<{ change: [value: string], toggle: [] }>()
</script>

<template>
  <label v-if="variant === 'select'" class="ctrl ctrl--select" :class="{ 'ctrl--wide': wide }">
    <span class="ctrl__label" aria-hidden="true">{{ label }}</span>
    <select
      class="ctrl__input"
      :aria-label="name || label"
      :value="value"
      @change="emit('change', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
  </label>

  <button
    v-else-if="variant === 'toggle'"
    type="button"
    class="ctrl ctrl--toggle"
    :class="{ 'is-on': on }"
    :aria-pressed="on"
    @click="emit('toggle')"
  >
    {{ label }}
  </button>

  <button
    v-else
    type="button"
    class="ctrl ctrl--select ctrl--wide ctrl--disclosure"
    :class="{ 'is-open': open }"
    :aria-expanded="open"
    :aria-controls="controls"
    @click="emit('toggle')"
  >
    {{ label }}
  </button>
</template>

<style scoped>
.ctrl {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 42px;
  border: 1px solid var(--c-darkblue);
  border-radius: 4px;
  background-color: var(--surface);
  color: var(--c-darkblue);
  font-size: 0.9375rem;                 /* 15 */
  font-weight: 500;
  line-height: 26px;
  letter-spacing: 0.46px;
  white-space: nowrap;
  cursor: pointer;
}

/* A dropdown is the label plus a 20px chevron, 21px from each edge and 10px
   apart. */
.ctrl--select {
  padding: 0 51px 0 21px;               /* 21 gutter + 20 chevron + 10 gap */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2303045e'%3E%3Cpath d='M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 21px center;
  background-size: 20px 20px;
}
/* The sort control and every stacked phone control: 13px to the label over a
   24px glyph. Declared after `--select` so it wins on the same specificity. */
.ctrl--wide {
  padding: 0 37px 0 13px;
  background-position: right 13px center;
  background-size: 24px 24px;
}
.ctrl--disclosure.is-open {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2303045e'%3E%3Cpath d='M12 8.59 6 14.59 7.41 16 12 11.42 16.59 16 18 14.59z'/%3E%3C/svg%3E");
}

.ctrl__label { overflow: hidden; text-overflow: ellipsis; }
.ctrl__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  background: none;
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
  opacity: 0;
  appearance: none;
  cursor: inherit;
}

.ctrl--toggle { padding-inline: 21px; }
.ctrl--toggle.is-on { border-color: var(--c-blue); background-color: var(--c-blue); color: var(--c-white); }

.ctrl:focus-within, .ctrl:focus-visible { outline: 2px solid var(--c-blue); outline-offset: 2px; }
/* Colour only: the `background` shorthand here would drop a dropdown's chevron. */
.ctrl:hover { background-color: color-mix(in srgb, var(--c-darkblue) 5%, var(--surface)); }
.ctrl--toggle.is-on:hover { background-color: var(--c-blue-500); }

/* Phones stack every control full width between the 16px gutters, and the phone
   modules draw them all at the sort control's 13px inset over a 24px chevron
   rather than the desktop chips' 21px and 20px. The toolbar that holds them
   sets the width; this is only the drawn geometry. */
@media (max-width: 720px) {
  .ctrl--select {
    padding: 0 37px 0 13px;
    background-position: right 13px center;
    background-size: 24px 24px;
  }
  .ctrl--toggle { padding-inline: 13px; }
}
</style>
