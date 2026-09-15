<script setup lang="ts">
defineProps<{ blok: any }>()
</script>

<template>
  <footer v-editable="blok" class="footer">
    <div class="container">
      <div class="footer__columns">
        <StoryblokComponent v-for="column in blok.columns || []" :key="column._uid" :blok="column" />
      </div>

      <div class="footer__meta">
        <ul class="footer__legal">
          <li v-for="item in blok.legal_links || []" :key="item._uid">
            <StoryblokComponent :blok="item" />
          </li>
        </ul>
        <ul class="footer__socials">
          <li v-for="social in blok.socials || []" :key="social._uid">
            <StoryblokComponent :blok="social" />
          </li>
        </ul>
      </div>
    </div>

    <div v-if="blok.wordmark" class="footer__wordmark">
      <p v-if="blok.wordmark_caption" class="footer__caption">{{ blok.wordmark_caption }}</p>
      <p class="footer__word display-1">{{ blok.wordmark }}</p>
    </div>
  </footer>
</template>

<style scoped>
.footer { background: var(--c-blue); color: var(--c-white); padding-top: var(--space-8); overflow: hidden; }
.footer__columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: var(--space-6);
  padding-bottom: var(--space-7);
}
.footer__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-5);
  padding-block: var(--space-5);
  border-top: 1px solid color-mix(in srgb, var(--c-white) 25%, transparent);
}
.footer__legal, .footer__socials { display: flex; flex-wrap: wrap; gap: var(--space-5); list-style: none; margin: 0; padding: 0; }
.footer__wordmark { text-align: center; padding-top: var(--space-6); }
.footer__caption { font-size: var(--t-body-sm); margin-bottom: var(--space-2); }
.footer__word {
  margin: 0;
  line-height: 0.8;
  font-size: clamp(4rem, 22vw, 18rem);
  translate: 0 12%;
}
</style>
