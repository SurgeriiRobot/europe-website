<script setup lang="ts">
const props = defineProps<{ blok: any, modelValue?: any }>()
defineEmits<{ 'update:modelValue': [value: any] }>()

// A select lists a datasource by slug. Without this the control held only its
// placeholder, so a required select could never be satisfied and the form it
// sat in could not be submitted at all.
const { data: choices } = await useAsyncData(
  () => `ds-${props.blok.options || 'none'}`,
  async () => {
    if (props.blok.type !== 'select' || !props.blok.options) return []
    const api = useStoryblokApi()
    const { data } = await api.get('cdn/datasource_entries', {
      datasource: props.blok.options,
      version: useStoryblokVersion(),
      per_page: 100,
    })
    return (data.datasource_entries || []) as { name: string, value: string }[]
  },
)
</script>

<template>
  <div v-editable="blok" class="field" :class="`field--${blok.width || 'half'}`">
    <label v-if="blok.type !== 'checkbox'" :for="blok.name" class="field__label caption">
      {{ blok.label }}<span v-if="blok.required" aria-hidden="true">*</span>
    </label>

    <textarea
      v-if="blok.type === 'textarea'"
      :id="blok.name"
      :name="blok.name"
      :required="blok.required"
      :placeholder="blok.placeholder"
      :value="modelValue"
      rows="5"
      class="field__control"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />

    <select
      v-else-if="blok.type === 'select'"
      :id="blok.name"
      :name="blok.name"
      :required="blok.required"
      :value="modelValue"
      class="field__control"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">{{ blok.placeholder || 'Select…' }}</option>
      <option v-for="c in choices || []" :key="c.value" :value="c.value">{{ c.name }}</option>
      <slot name="options" />
    </select>

    <label v-else-if="blok.type === 'checkbox'" class="field__checkbox">
      <input
        :id="blok.name"
        type="checkbox"
        :name="blok.name"
        :required="blok.required"
        :checked="Boolean(modelValue)"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      >
      <span>{{ blok.label }}</span>
    </label>

    <input
      v-else
      :id="blok.name"
      :type="blok.type || 'text'"
      :name="blok.name"
      :required="blok.required"
      :placeholder="blok.placeholder"
      :value="modelValue"
      class="field__control"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
  </div>
</template>

<style scoped>
/* Figma: a 16px navy label with its baseline 31.5px above a 38px control.
   The shared caption style rendered the label at 12px in muted grey. */
.field { display: grid; gap: calc(0.9 * var(--sx)); }
.field--full { grid-column: 1 / -1; }
.field__label {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.22;
  color: var(--ink);
}
.field__control {
  height: calc(2.64 * var(--sx));             /* 38px */
  min-height: 38px;
  width: 100%;
  padding: 0 12px;
  border: 1px solid #e1e2e5;
  border-radius: 6px;
  background: #f9f9fb;
  color: var(--ink);
}
select.field__control {
  background: var(--c-white);
  border-color: #e4e5e7;
  box-shadow: 0 2px 8px rgb(0 0 0 / 13%);
  color: var(--accent);
  font-weight: 500;
}
select.field__control:invalid { color: #969ba3; font-weight: 400; }
textarea.field__control { height: calc(7.5 * var(--sx)); min-height: 108px; padding: 10px 12px; }

.field__checkbox { display: flex; gap: var(--space-3); align-items: flex-start; font-size: var(--t-body-sm); }
/* The browser default sits at 13px, which Waitak asked to be half again as
   large. `flex: none` keeps it square when the consent text wraps, and the top
   offset holds it on the first line rather than the top of the box. */
.field__checkbox input {
  flex: none;
  inline-size: 20px;
  block-size: 20px;
  margin: 0;
  margin-block-start: calc((1em * var(--lh-body, 1.5) - 20px) / 2);
  accent-color: var(--c-blue);
}

/* An address the browser cannot parse turns the field red, but only once it has
   been typed in and left: `:user-invalid` waits for that, where `:invalid`
   would paint every empty required field red before anyone had touched it. */
.field__control:user-invalid {
  border-color: var(--c-red);
  box-shadow: 0 0 0 1px var(--c-red);
}
select.field__control:user-invalid { box-shadow: 0 2px 8px rgb(0 0 0 / 13%), 0 0 0 1px var(--c-red); }

/* Phones: every control clears the 44px minimum touch target. */
@media (max-width: 720px) {
  .field__control { min-height: 44px; height: 44px; }
  textarea.field__control { height: auto; min-height: 120px; }
}
</style>
