<script setup lang="ts">
const { data: health, status, refresh } = await useFetch('/api/storyblok-health')

const connected = computed(() => (health.value?.ok ? health.value : null))
const failure = computed(() => (health.value && !health.value.ok ? health.value : null))
</script>

<template>
  <main class="page">
    <h1>Storyblok connection</h1>

    <section v-if="connected" class="card card--ok">
      <p class="verdict">Connected</p>
      <dl>
        <dt>Space</dt>
        <dd>{{ connected.space?.name ?? 'unknown' }} <span class="muted">#{{ connected.space?.id }}</span></dd>
        <dt>Region</dt>
        <dd>{{ connected.region }}</dd>
        <dt>Token</dt>
        <dd>{{ connected.token }} <span class="muted">— {{ connected.tokenType }}</span></dd>
        <dt>Stories</dt>
        <dd>{{ connected.total }} returned ({{ connected.version }})</dd>
      </dl>

      <ul v-if="connected.stories.length" class="stories">
        <li v-for="story in connected.stories" :key="story.id">
          <code>/{{ story.fullSlug }}</code>
          <span class="muted">{{ story.name }} · {{ story.contentType ?? 'no component' }}</span>
        </li>
      </ul>
      <p v-else class="muted">
        The space is reachable but has no stories yet — create one in Storyblok and refresh.
      </p>
    </section>

    <section v-else class="card card--fail">
      <p class="verdict">Not connected</p>
      <p>{{ failure?.message }}</p>
      <p class="muted">Reason: {{ failure?.reason }}</p>
    </section>

    <button :disabled="status === 'pending'" @click="refresh()">
      {{ status === 'pending' ? 'Checking…' : 'Re-check' }}
    </button>
  </main>
</template>

<style scoped>
.page {
  max-width: 44rem;
  margin: 0 auto;
  padding: 3rem 1.25rem;
  font: 15px/1.6 ui-sans-serif, system-ui, sans-serif;
}
h1 { font-size: 1.5rem; margin: 0 0 1.5rem; }
.card {
  border: 1px solid;
  border-radius: 10px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
}
.card--ok { border-color: #16a34a55; background: #16a34a0d; }
.card--fail { border-color: #dc262655; background: #dc26260d; }
.verdict { margin: 0 0 1rem; font-weight: 600; font-size: 1.1rem; }
.card--ok .verdict::before { content: '✓ '; color: #16a34a; }
.card--fail .verdict::before { content: '✕ '; color: #dc2626; }
dl { display: grid; grid-template-columns: auto 1fr; gap: 0.35rem 1.25rem; margin: 0; }
dt { font-weight: 600; }
dd { margin: 0; }
.muted { opacity: 0.65; }
.stories { list-style: none; margin: 1.25rem 0 0; padding: 1rem 0 0; border-top: 1px solid currentColor; }
.stories li { display: flex; flex-wrap: wrap; gap: 0.5rem 0.75rem; padding: 0.2rem 0; }
button {
  font: inherit;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid currentColor;
  background: transparent;
  cursor: pointer;
}
button:disabled { opacity: 0.5; cursor: default; }
</style>
