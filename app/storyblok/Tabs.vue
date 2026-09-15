<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const active = ref(0)
const items = computed<any[]>(() => props.blok.items || [])
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section tabs" :data-theme="blok.theme || 'light'">
    <div class="container">
      <h2 v-if="blok.headline" class="tabs__headline">{{ blok.headline }}</h2>

      <div class="tabs__list" role="tablist">
        <button
          v-for="(item, i) in items"
          :key="item._uid"
          class="tabs__tab"
          :class="{ 'is-active': active === i }"
          role="tab"
          :aria-selected="active === i"
          @click="active = i"
        >
          {{ item.label }}
        </button>
      </div>

      <div v-for="(item, i) in items" v-show="active === i" :key="item._uid" role="tabpanel">
        <StoryblokComponent v-for="child in item.body || []" :key="child._uid" :blok="child" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.tabs__headline { margin-bottom: var(--space-5); font-size: var(--t-h3); text-align: center; }
.tabs__list {
  display: flex;
  justify-content: center;
  gap: var(--space-5);
  border-bottom: 1px solid var(--border);
  margin-bottom: var(--space-6);
}
.tabs__tab {
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  padding: var(--space-3) var(--space-2);
  font-size: var(--t-body-sm);
  color: var(--ink-muted);
  cursor: pointer;
}
.tabs__tab.is-active { color: var(--accent); border-bottom-color: var(--accent); }
</style>
