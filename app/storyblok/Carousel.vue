<script setup lang="ts">
const props = defineProps<{ blok: any }>()
const items = computed<any[]>(() => props.blok.items || [])
const index = ref(0)

const go = (i: number) => {
  const count = items.value.length
  index.value = count ? (i + count) % count : 0
}

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  if (!props.blok.autoplay) return
  const seconds = Number(props.blok.interval) || 6
  timer = setInterval(() => go(index.value + 1), seconds * 1000)
})
onBeforeUnmount(() => timer && clearInterval(timer))
</script>

<template>
  <section v-editable="blok" :id="blok.anchor || undefined" class="section carousel" :data-theme="blok.theme || 'light'">
    <div class="container">
      <h2 v-if="blok.headline" class="carousel__headline">{{ blok.headline }}</h2>

      <div class="carousel__viewport">
        <div v-for="(item, i) in items" v-show="index === i" :key="item._uid">
          <StoryblokComponent :blok="item" />
        </div>
      </div>

      <div v-if="items.length > 1" class="carousel__controls">
        <button aria-label="Previous" @click="go(index - 1)">‹</button>
        <span class="caption">{{ index + 1 }} / {{ items.length }}</span>
        <button aria-label="Next" @click="go(index + 1)">›</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.carousel__headline { margin-bottom: var(--space-5); font-size: var(--t-h3); }
.carousel__controls { display: flex; align-items: center; justify-content: center; gap: var(--space-4); margin-top: var(--space-5); }
.carousel__controls button {
  width: 2.5rem; height: 2.5rem;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: none;
  cursor: pointer;
}
</style>
