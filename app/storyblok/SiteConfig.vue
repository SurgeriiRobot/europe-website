<script setup lang="ts">
// The global settings story has no page of its own — the header, footer and
// cookie notice it holds are rendered by the layout on every page. Without this,
// opening it in the Visual Editor shows an empty page between the chrome.
defineProps<{ blok: any }>()
</script>

<template>
  <section v-editable="blok" class="section config" data-theme="muted">
    <div class="container container--narrow config__inner">
      <h1 class="config__title">Global site configuration</h1>
      <p>
        This story holds the header, footer and cookie notice used on every page.
        It is not a page itself — edit the header or footer directly above and below,
        or use the fields in the sidebar.
      </p>
      <ul class="config__list">
        <li><strong>Header</strong> — logo, navigation, mega-menus, call to action, search and language switch</li>
        <li><strong>Footer</strong> — link columns, legal links, social links and the wordmark</li>
        <li><strong>Cookie notice</strong> — text and button labels</li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.config { padding-block: var(--space-9); }
.config__inner { display: grid; gap: var(--space-4); text-align: center; }
.config__title { font-size: var(--t-h3); }
.config__list { display: grid; gap: var(--space-2); margin: 0; padding: 0; list-style: none; font-size: var(--t-body-sm); color: var(--ink-muted); }
</style>
