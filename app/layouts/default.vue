<script setup lang="ts">
const config = await useSiteConfig()
</script>

<template>
  <div class="site">
    <!-- First focusable element on the page: without it a keyboard user crosses
         nine header stops before reaching the content. Hidden until focused.
         Plain English like the rest of the chrome; the site carries no message
         catalogue, @nuxtjs/i18n is here for the routes. -->
    <a class="skip-link" href="#main">Skip to main content</a>

    <StoryblokComponent
      v-for="header in config?.header || []"
      :key="header._uid"
      :blok="header"
      :socials="config?.footer?.[0]?.socials || []"
    />

    <!-- tabindex=-1 so the skip link moves focus here rather than only the
         scroll position; base.css's scroll-padding-top keeps the landing clear
         of the sticky header. -->
    <main id="main" class="site__main" tabindex="-1">
      <slot />
    </main>

    <StoryblokComponent v-for="footer in config?.footer || []" :key="footer._uid" :blok="footer" />
    <StoryblokComponent v-for="notice in config?.cookie_notice || []" :key="notice._uid" :blok="notice" />
    <ConsentScripts />
  </div>
</template>

<style scoped>
.site { display: flex; flex-direction: column; min-height: 100dvh; }
.site__main { flex: 1; }
/* The skip link's target takes focus programmatically; a ring around the whole
   page would be noise, and the scroll itself is the feedback. */
.site__main:focus { outline: none; }
</style>
