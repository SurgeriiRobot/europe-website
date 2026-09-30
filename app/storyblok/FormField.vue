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
.field { display: grid; gap: var(--space-1); }
.field--full { grid-column: 1 / -1; }
.field__label { color: var(--ink-muted); }
.field__control {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--c-white);
  color: var(--c-black);
}
.field__checkbox { display: flex; gap: var(--space-3); align-items: flex-start; font-size: var(--t-body-sm); }
</style>
