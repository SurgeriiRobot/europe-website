<script setup lang="ts">
// The design joins sections with a 0.5px line on the centre axis. It takes the
// section's own line colour, so a line crossing from a light section into a
// dark one switches from blue to white exactly at the boundary.
defineProps<{ connector?: string }>()
</script>

<template>
  <span v-if="connector === 'top' || connector === 'both'" class="connector connector--top" aria-hidden="true" />
  <span v-if="connector === 'bottom' || connector === 'both'" class="connector connector--bottom" aria-hidden="true" />
</template>

<style scoped>
.connector {
  position: absolute;
  left: 50%;
  z-index: 2;
  height: clamp(40px, 4.2vw, 60px);   /* 59px either side of a boundary in Figma */
  border-left: var(--line-w) solid var(--line);
  pointer-events: none;
}
.connector--top { top: 0; }
.connector--bottom { bottom: 0; }
</style>
