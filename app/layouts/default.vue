<script setup lang="ts">
const config = await useSiteConfig()
</script>

<template>
  <div class="site">
    <StoryblokComponent
      v-for="header in config?.header || []"
      :key="header._uid"
      :blok="header"
      :socials="config?.footer?.[0]?.socials || []"
    />

    <main class="site__main">
      <slot />
    </main>

    <StoryblokComponent v-for="footer in config?.footer || []" :key="footer._uid" :blok="footer" />
    <StoryblokComponent v-for="notice in config?.cookie_notice || []" :key="notice._uid" :blok="notice" />
  </div>
</template>

<style scoped>
.site { display: flex; flex-direction: column; min-height: 100dvh; }
.site__main { flex: 1; }
</style>
