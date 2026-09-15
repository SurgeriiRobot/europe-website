<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const sbHref = useSbUrl()
const href = computed(() => (props.blok.intro_link ? sbHref(props.blok.intro_link) : null))
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section accordion" :data-theme="blok.theme || 'light'">
    <div class="container container--narrow">
      <h2 v-if="blok.headline" class="accordion__headline">{{ blok.headline }}</h2>
      <NuxtLink v-if="href" :to="href" class="accordion__link">See the full list</NuxtLink>

      <StoryblokComponent v-for="item in blok.items || []" :key="item._uid" :blok="item" />
    </div>
  </section>
</template>

<style scoped>
.accordion__headline { font-size: var(--t-h3); text-align: center; }
.accordion__link { display: block; text-align: center; margin-block: var(--space-3) var(--space-6); font-size: var(--t-body-sm); color: var(--accent); }
</style>
