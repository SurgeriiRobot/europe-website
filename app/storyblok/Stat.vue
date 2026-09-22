<script setup lang="ts">
const props = defineProps<{ blok: any }>()

// Counts up when the figure scrolls into view. The server renders the final
// value, so it is correct without JavaScript and for anyone avoiding motion.
const root = ref<HTMLElement>()
const display = ref(String(props.blok.value ?? ''))

onMounted(() => {
  const raw = String(props.blok.value ?? '')
  const match = raw.match(/[\d.,]+/)
  if (!match || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const target = Number(match[0].replace(/[^\d.]/g, ''))
  if (!Number.isFinite(target) || target <= 0) return
  const grouped = match[0].includes(',')
  const render = (n: number) => raw.replace(match[0], grouped ? n.toLocaleString('en-US') : String(n))

  display.value = render(0)
  const io = new IntersectionObserver((entries) => {
    if (!entries[0]?.isIntersecting) return
    io.disconnect()
    const start = performance.now()
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 1100)
      display.value = render(Math.round(target * (1 - (1 - p) ** 3)))   // ease-out
      if (p < 1) requestAnimationFrame(step)
      else display.value = raw
    }
    requestAnimationFrame(step)
  }, { threshold: 0.4 })

  if (root.value) io.observe(root.value)
  onBeforeUnmount(() => io.disconnect())
})
</script>

<template>
  <div ref="root" v-editable="blok" class="stat">
    <img v-if="blok.icon?.filename" :src="sbCrop(blok.icon, 0, 80)" alt="" class="stat__icon" height="40">
    <p class="stat__value display-word"><span class="stat__num">{{ display }}</span></p>
    <p class="stat__label">{{ blok.label }}</p>
  </div>
</template>

<style scoped>
.stat { display: grid; justify-items: center; text-align: center; }
.stat__value {
  margin: clamp(24px, 7.6vw, 110px) 0 0;
  font-size: clamp(3.5rem, 6.67vw, 6rem);   /* 96px */
  line-height: 1.198;                        /* 115/96 */
  color: var(--c-blue);
}
.stat__num { font-variant-numeric: tabular-nums; }   /* no width jitter while counting */
.stat__label {
  margin: clamp(16px, 2.4vw, 35px) 0 0;
  font-size: clamp(1.125rem, 1.67vw, 1.5rem);
  font-weight: 600;
  line-height: 1.2083;
  color: var(--ink);
}
</style>
